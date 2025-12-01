import { ErrorFactory } from "@/errors";
import { AvailabilityModel, BookingModel, CampsiteModel, type BookingDocument } from "@/models";
import { CLIENT_URL, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY, PAYOS_CLIENT_ID } from "@/constants";
import appAssert from "@/utils/app-assert";
import type {
  CancelBookingInput,
  CreateBookingInput,
  SearchBookingInput,
} from "@/validators/booking.validator";
import mongoose from "mongoose";
import { orderRoutes } from "@/routes";

const { PayOS } = require("@payos/node");

const payos = new PayOS({
  clientId: PAYOS_CLIENT_ID,
  apiKey: PAYOS_API_KEY,
  checksumKey: PAYOS_CHECKSUM_KEY,
});

export class BookingService {
  /**
   * Create booking (guest book campsite)
   */
  async createBooking(guestId: string, input: CreateBookingInput): Promise<BookingDocument> {
    const {
      campsite: campsiteId,
      checkIn,
      checkOut,
      numberOfGuests,
      numberOfPets,
      numberOfVehicles,
      guestMessage,
      paymentMethod,
    } = input;

    // Get campsite
    const campsite = await CampsiteModel.findById(campsiteId);
    appAssert(campsite, ErrorFactory.resourceNotFound("Campsite"));
    appAssert(campsite.isActive, ErrorFactory.badRequest("Campsite không còn hoạt động"));

    // Check capacity
    appAssert(
      numberOfGuests <= campsite.capacity.maxGuests,
      ErrorFactory.badRequest(`Số khách tối đa: ${campsite.capacity.maxGuests}`)
    );
    if (campsite.capacity.maxPets !== undefined) {
      appAssert(
        numberOfPets <= campsite.capacity.maxPets,
        ErrorFactory.badRequest(`Số thú cưng tối đa: ${campsite.capacity.maxPets}`)
      );
    }
    if (campsite.capacity.maxVehicles !== undefined) {
      appAssert(
        numberOfVehicles <= campsite.capacity.maxVehicles,
        ErrorFactory.badRequest(`Số xe tối đa: ${campsite.capacity.maxVehicles}`)
      );
    }

    // Check pet policy
    if (numberOfPets > 0) {
      appAssert(
        campsite.rules.allowPets,
        ErrorFactory.badRequest("Campsite không cho phép thú cưng")
      );
    }

    // Check availability
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check min nights
    appAssert(
      nights >= campsite.rules.minNights,
      ErrorFactory.badRequest(`Tối thiểu ${campsite.rules.minNights} đêm`)
    );

    // Check max nights
    if (campsite.rules.maxNights) {
      appAssert(
        nights <= campsite.rules.maxNights,
        ErrorFactory.badRequest(`Tối đa ${campsite.rules.maxNights} đêm`)
      );
    }

    // Check availability in calendar
    //  const isAvailable = await this.checkAvailability(campsiteId, checkIn, checkOut);
    //  appAssert(isAvailable, ErrorFactory.conflict("Campsite không có sẵn trong thời gian này"));

    // Calculate pricing
    const pricing = this.calculatePricing(campsite, nights, numberOfGuests, numberOfPets);
    let payOSOrderCode: number | null = null;
    let payOSCheckoutUrl: string | null = null;
    const code = this.generateBookingCode();
    payOSOrderCode = Math.floor(Date.now() / 1000);
    const amount = 2000; // TODO: TESTING ONLY
    try {
      const paymentLink = await payos.paymentRequests.create({
        orderCode: payOSOrderCode,
        amount,
        description: "Thanh toán ",
        returnUrl: `${CLIENT_URL}/checkouts/${code}/success`,
        cancelUrl: `${CLIENT_URL}/checkouts/${code}/cancel`,
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
      campsite: campsiteId,
      guest: guestId,
      host: campsite.host,
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
    await this.blockDatesForBooking(campsiteId, checkInDate, checkOutDate);
    // Auto-confirm if instant book
    if (campsite.isInstantBook) {
      await booking.confirm();
    }

    return booking;
  }

  async handlePayOSWebhook(data: any) {

    try {
      const orderCode = data.data?.code;
      const success = data.data?.status === "PAID" || data.success;


      const booking = await BookingModel.findOne({ payOSOrderCode: orderCode })
      appAssert(booking, ErrorFactory.resourceNotFound("Booking"));

      if (success) {
        booking.paymentStatus = "paid";
        await booking.save();
        return { success: true, code: "PAYMENT_SUCCESS", message: "Thanh toán thành công", booking };
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
      .populate("campsite")
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
    await this.unblockDatesForBooking(
      booking.campsite.toString(),
      booking.checkIn,
      booking.checkOut
    );

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
    campsiteId: string,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check blocked dates
    const blockedDates = await AvailabilityModel.countDocuments({
      campsite: campsiteId,
      date: { $gte: checkInDate, $lt: checkOutDate },
      isAvailable: false,
    });

    if (blockedDates > 0) return false;

    // Check overlapping bookings
    const overlappingBooking = await BookingModel.findOne({
      campsite: campsiteId,
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
    campsite: any,
    nights: number,
    numberOfGuests: number,
    numberOfPets: number
  ): any {
    const { basePrice, cleaningFee = 0, petFee = 0, extraGuestFee = 0 } = campsite.pricing;

    const subtotal = basePrice * nights;
    const cleaning = cleaningFee;
    const pet = numberOfPets > 0 ? petFee * numberOfPets : 0;
    const extraGuest =
      numberOfGuests > campsite.capacity.maxGuests
        ? extraGuestFee * (numberOfGuests - campsite.capacity.maxGuests) * nights
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
  private async blockDatesForBooking(
    campsiteId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<void> {
    const dates: Date[] = [];
    const currentDate = new Date(checkIn);

    // Generate all dates from checkIn to checkOut (exclusive)
    while (currentDate < checkOut) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create availability records for each date
    const availabilityRecords = dates.map((date) => ({
      campsite: campsiteId,
      date,
      isAvailable: false,
      blockType: "booked" as const,
      reason: "Đã được đặt",
    }));

    // Use bulkWrite with upsert to avoid duplicates
    const bulkOps = availabilityRecords.map((record) => ({
      updateOne: {
        filter: { campsite: record.campsite, date: record.date },
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
    campsiteId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<void> {
    // Remove availability records for booked dates
    await AvailabilityModel.deleteMany({
      campsite: campsiteId,
      date: { $gte: checkIn, $lt: checkOut },
      blockType: "booked",
    });
  }

  async getMyBookings(userId: string) {
    const query = {
      $or: [{ host: userId }],
    };
    const bookings = await BookingModel.find(query)
      .populate("campsite", "name slug images location")
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
}
