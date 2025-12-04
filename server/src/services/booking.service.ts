import { CLIENT_URL, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY, PAYOS_CLIENT_ID } from "@/constants";
import { ErrorFactory } from "@/errors";
import {
  AvailabilityModel,
  BookingModel,
  PropertyModel,
  SiteModel,
  type BookingDocument,
} from "@/models";
import appAssert from "@/utils/app-assert";
import type {
  CancelBookingInput,
  CreateBookingInput,
  SearchBookingInput,
} from "@/validators/booking.validator";
import mongoose from "mongoose";
import SiteService from "./site.service";

const { PayOS } = require("@payos/node");

const payos = new PayOS({
  clientId: PAYOS_CLIENT_ID,
  apiKey: PAYOS_API_KEY,
  checksumKey: PAYOS_CHECKSUM_KEY,
});

export class BookingService {
  /**
   * Create booking (guest book site)
   */
  async createBooking(guestId: string, input: CreateBookingInput): Promise<BookingDocument> {
    const {
      property: propertyId,
      site: siteId,
      campsite: campsiteId, // Legacy support
      checkIn,
      checkOut,
      numberOfGuests,
      numberOfPets,
      numberOfVehicles,
      guestMessage,
      paymentMethod,
    } = input;

    // Ensure either site or campsite is provided
    appAssert(
      siteId || campsiteId,
      ErrorFactory.badRequest("Either site or campsite must be provided")
    );

    // Get property and site
    const [property, site] = await Promise.all([
      PropertyModel.findById(propertyId),
      siteId ? SiteModel.findById(siteId) : Promise.resolve(null),
    ]);

    appAssert(property, ErrorFactory.resourceNotFound("Property"));
    appAssert(site, ErrorFactory.resourceNotFound("Site"));
    appAssert(property.isActive, ErrorFactory.badRequest("Property không còn hoạt động"));
    appAssert(site!.isActive, ErrorFactory.badRequest("Site không còn hoạt động"));

    // Verify site belongs to property
    appAssert(
      site!.property.toString() === propertyId,
      ErrorFactory.badRequest("Site không thuộc property này")
    );

    // Check capacity (from site)
    appAssert(
      numberOfGuests <= site.capacity.maxGuests,
      ErrorFactory.badRequest(`Số khách tối đa: ${site.capacity.maxGuests}`)
    );
    if (site.capacity.maxPets !== undefined) {
      appAssert(
        numberOfPets <= site.capacity.maxPets,
        ErrorFactory.badRequest(`Số thú cưng tối đa: ${site.capacity.maxPets}`)
      );
    }
    if (site.capacity.maxVehicles !== undefined) {
      appAssert(
        numberOfVehicles <= site.capacity.maxVehicles,
        ErrorFactory.badRequest(`Số xe tối đa: ${site.capacity.maxVehicles}`)
      );
    }

    // Check pet policy (from property)
    if (numberOfPets > 0) {
      appAssert(
        property.petPolicy?.allowed,
        ErrorFactory.badRequest("Property không cho phép thú cưng")
      );
    }

    // Check availability
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check min nights (from site booking settings)
    appAssert(
      nights >= site.bookingSettings.minimumNights,
      ErrorFactory.badRequest(`Tối thiểu ${site.bookingSettings.minimumNights} đêm`)
    );

    // Check max nights
    if (site.bookingSettings.maximumNights) {
      appAssert(
        nights <= site.bookingSettings.maximumNights,
        ErrorFactory.badRequest(`Tối đa ${site.bookingSettings.maximumNights} đêm`)
      );
    }

    // Check availability in calendar
    //  const isAvailable = await this.checkAvailability(siteId, checkIn, checkOut);
    //  appAssert(isAvailable, ErrorFactory.conflict("Site không có sẵn trong thời gian này"));

    // Calculate pricing (from site)
    const pricing = this.calculatePricing(site, nights, numberOfGuests, numberOfPets);

    let payOSOrderCode: number | null = null;
    let payOSCheckoutUrl: string | null = null;
    const code = this.generateBookingCode();
    payOSOrderCode = Math.floor(Date.now() / 1000);
    const amount = pricing.total; // Use actual total from pricing calculation

    try {
      const paymentLink = await payos.paymentRequests.create({
        orderCode: payOSOrderCode,
        amount,
        description: `BOOKING ${code}`,
        returnUrl: `${CLIENT_URL}/bookings/${code}/success`,
        cancelUrl: `${CLIENT_URL}/bookings/cancel`,
      });

      payOSCheckoutUrl =
        paymentLink?.checkoutUrl ||
        paymentLink?.url ||
        paymentLink?.redirectUrl ||
        paymentLink?.data?.checkoutUrl ||
        null;
    } catch (err: any) {
      console.error("Error creating PayOS payment link:", err.message);
    }

    // Create booking
    const booking = await BookingModel.create({
      code,
      payOSOrderCode,
      payOSCheckoutUrl,
      property: propertyId,
      site: siteId,
      guest: guestId,
      host: property.host,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      numberOfGuests,
      numberOfPets,
      numberOfVehicles,
      pricing,
      guestMessage,
      payment: {
        method: paymentMethod,
      },
    });

    // Calculate total
    await booking.calculateTotal();
    // Block dates in availability calendar
    if (siteId) {
      await this.blockDatesForBooking(siteId, checkInDate, checkOutDate);
    }
    // Auto-confirm if instant book
    if (site!.bookingSettings.instantBook) {
      await booking.confirm();
    }

    return booking;
  }

  async getBookingByCode(code: string): Promise<BookingDocument> {
    const booking = await BookingModel.findOne({ code })
      .populate("campsite")
      .populate("guest", "username email avatarUrl")
      .populate("host", "username email avatarUrl");

    appAssert(booking, ErrorFactory.resourceNotFound("Booking"));

    return booking;
  }

  async handlePayOSWebhook(data: any) {
    try {
      const orderCode = data.data?.code;
      const success = data.data?.status === "PAID" || data.success;

      const booking = await BookingModel.findOne({ payOSOrderCode: orderCode });
      appAssert(booking, ErrorFactory.resourceNotFound("Booking"));

      if (success) {
        booking.paymentStatus = "paid";
        await booking.save();
        return {
          success: true,
          code: "PAYMENT_SUCCESS",
          message: "Thanh toán thành công",
          booking,
        };
      } else {
        booking.paymentStatus = "failed";
        await booking.save();

        return { success: false, code: "PAYMENT_FAILED", message: "Thanh toán thất bại", booking };
      }
    } catch (err: any) {
      console.error("Error handling PayOS webhook:", err.message);
      return { success: false, code: "WEBHOOK_ERROR", message: err.message };
    }
  }
  private generateBookingCode(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);

    // 5 random digits
    const random = Math.floor(10000 + Math.random() * 90000);

    return `HDB${day}${month}${year}${random}`;
  }
  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string, userId: string): Promise<BookingDocument> {
    const booking = await BookingModel.findById(bookingId)
      .populate("property", "name location photos")
      .populate("site", "name accommodationType photos pricing")
      .populate("guest", "username email avatarUrl")
      .populate("host", "username email avatarUrl");

    appAssert(booking, ErrorFactory.resourceNotFound("Booking"));

    // Check permission (chỉ guest hoặc host mới xem được)
    appAssert(
      booking.guest._id.toString() === userId || booking.host._id.toString() === userId,
      ErrorFactory.forbidden("Bạn không có quyền xem booking này")
    );

    return booking;
  }

  /**
   * Confirm booking (host accept)
   */
  async confirmBooking(
    bookingId: string,
    hostId: string,
    hostMessage?: string
  ): Promise<BookingDocument> {
    const booking = await BookingModel.findById(bookingId);
    appAssert(booking, ErrorFactory.resourceNotFound("Booking"));
    appAssert(
      booking.host.toString() === hostId,
      ErrorFactory.forbidden("Bạn không phải host của booking này")
    );
    appAssert(
      booking.status === "pending",
      ErrorFactory.badRequest("Booking không ở trạng thái pending")
    );

    if (hostMessage) {
      booking.hostMessage = hostMessage;
    }

    await booking.confirm();
    return booking;
  }

  /**
   * Cancel booking (guest or host)
   */
  async cancelBooking(
    bookingId: string,
    userId: mongoose.Types.ObjectId,
    input: CancelBookingInput
  ): Promise<BookingDocument> {
    const booking = await BookingModel.findById(bookingId);
    appAssert(booking, ErrorFactory.resourceNotFound("Booking"));

    // Check permission
    const isGuest = booking.guest.toString() === userId.toString();
    const isHost = booking.host.toString() === userId.toString();
    appAssert(isGuest || isHost, ErrorFactory.forbidden("Bạn không có quyền hủy booking này"));

    // Check status
    appAssert(
      booking.status === "pending" || booking.status === "confirmed",
      ErrorFactory.badRequest("Không thể hủy booking này")
    );

    await booking.cancel(userId, input.cancellationReason);

    // Unblock dates when booking is cancelled
    await this.unblockDatesForBooking(booking.site.toString(), booking.checkIn, booking.checkOut);

    return booking;
  }

  /**
   * Complete booking (auto after checkout date)
   */
  async completeBooking(bookingId: string): Promise<BookingDocument> {
    const booking = await BookingModel.findById(bookingId);
    appAssert(booking, ErrorFactory.resourceNotFound("Booking"));
    appAssert(booking.status === "confirmed", ErrorFactory.badRequest("Booking chưa được confirm"));

    // Check if past checkout date
    const now = new Date();
    appAssert(now >= booking.checkOut, ErrorFactory.badRequest("Chưa đến ngày checkout"));

    await booking.complete();
    return booking;
  }

  /**
   * Search bookings with filters
   */
  async searchBookings(userId: string, input: SearchBookingInput) {
    const { status, checkInFrom, checkInTo, role, sort, page, limit } = input;

    // Build query
    const query: any = {};

    // Filter by role (guest or host)
    if (role === "guest") {
      query.guest = userId;
    } else if (role === "host") {
      query.host = userId;
    } else {
      // Show all bookings (as guest or host)
      query.$or = [{ guest: userId }, { host: userId }];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by check-in date range
    if (checkInFrom || checkInTo) {
      query.checkIn = {};
      if (checkInFrom) query.checkIn.$gte = new Date(checkInFrom);
      if (checkInTo) query.checkIn.$lte = new Date(checkInTo);
    }

    // Sorting
    let sortOption: any = {};
    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "check-in":
        sortOption = { checkIn: 1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      BookingModel.find(query)
        .populate("campsite", "name slug images location")
        .populate("guest", "name email avatar")
        .populate("host", "name email avatar")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      BookingModel.countDocuments(query),
    ]);

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Check availability helper
   */
  private async checkAvailability(
    siteId: string,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check blocked dates
    const blockedDates = await AvailabilityModel.countDocuments({
      site: siteId,
      date: { $gte: checkInDate, $lt: checkOutDate },
      isAvailable: false,
    });

    if (blockedDates > 0) return false;

    // Check overlapping bookings
    const overlappingBooking = await BookingModel.findOne({
      site: siteId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    return !overlappingBooking;
  }

  /**
   * Calculate pricing breakdown
   */
  private calculatePricing(
    site: any,
    nights: number,
    numberOfGuests: number,
    numberOfPets: number
  ): any {
    const { basePrice, fees = {} } = site.pricing;
    const { cleaningFee = 0, petFee = 0, extraGuestFee = 0 } = fees;

    const subtotal = basePrice * nights;
    const cleaning = cleaningFee;
    const pet = numberOfPets > 0 ? petFee * numberOfPets : 0;
    const extraGuest =
      numberOfGuests > site.capacity.maxGuests
        ? extraGuestFee * (numberOfGuests - site.capacity.maxGuests) * nights
        : 0;

    return {
      basePrice,
      totalNights: nights,
      subtotal,
      cleaningFee: cleaning,
      petFee: pet,
      extraGuestFee: extraGuest,
      serviceFee: 0, // will be calculated later
      tax: 0, // will be calculated later
      total: 0, // will be calculated by booking.calculateTotal()
    };
  }

  /**
   * Block dates in availability calendar when booking is created
   */
  private async blockDatesForBooking(siteId: string, checkIn: Date, checkOut: Date): Promise<void> {
    const dates: Date[] = [];
    const currentDate = new Date(checkIn);

    // Generate all dates from checkIn to checkOut (exclusive)
    while (currentDate < checkOut) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create availability records for each date
    const availabilityRecords = dates.map((date) => ({
      site: siteId,
      date,
      isAvailable: false,
      blockType: "booked" as const,
      reason: "Đã được đặt",
    }));

    // Use bulkWrite with upsert to avoid duplicates
    const bulkOps = availabilityRecords.map((record) => ({
      updateOne: {
        filter: { site: record.site, date: record.date },
        update: { $set: record },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await AvailabilityModel.bulkWrite(bulkOps);
    }
  }

  /**
   * Unblock dates when booking is cancelled
   */
  private async unblockDatesForBooking(
    siteId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<void> {
    // Remove availability records for booked dates
    await AvailabilityModel.deleteMany({
      site: siteId,
      date: { $gte: checkIn, $lt: checkOut },
      blockType: "booked",
    });
  }

  async getMyBookings(userId: string) {
    const query = {
      $or: [{ host: userId }],
    };
    const bookings = await BookingModel.find(query)
      .populate("property", "name slug location photos")
      .populate("site", "name slug accommodationType photos pricing")
      .populate("guest", "name email avatar")
      .populate("host", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();
    const total = await BookingModel.countDocuments(query);

    return {
      data: bookings,
      pagination: {
        page: 1,
        limit: total,
        total,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  /**
   * Book undesignated site (guest books any available site in group)
   * Auto-assigns an available site from the group
   */
  async bookUndesignatedSite(
    guestId: string,
    groupId: string,
    input: Omit<CreateBookingInput, "site"> & { property: string }
  ): Promise<BookingDocument> {
    const { property: propertyId, checkIn, checkOut } = input;

    // Check if group has any available sites
    const groupAvailability = await SiteService.checkGroupAvailability(groupId, checkIn, checkOut);

    appAssert(
      groupAvailability.isAvailable && groupAvailability.availableSiteIds,
      ErrorFactory.conflict(
        groupAvailability.reason || "Không có site nào available trong group này"
      )
    );

    // Auto-select first available site
    const selectedSiteId = groupAvailability.availableSiteIds[0];

    // Create booking with the auto-selected site
    const booking = await this.createBooking(guestId, {
      ...input,
      site: selectedSiteId,
    });

    return booking;
  }
}
