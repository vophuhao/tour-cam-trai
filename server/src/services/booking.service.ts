import { ErrorFactory } from "@/errors";
import { AvailabilityModel, BookingModel, CampsiteModel, type BookingDocument } from "@/models";
import appAssert from "@/utils/app-assert";
import type {
  CancelBookingInput,
  CreateBookingInput,
  SearchBookingInput,
} from "@/validators/booking.validator";
import mongoose from "mongoose";

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
    const isAvailable = await this.checkAvailability(campsiteId, checkIn, checkOut);
    appAssert(isAvailable, ErrorFactory.conflict("Campsite không có sẵn trong thời gian này"));

    // Calculate pricing
    const pricing = this.calculatePricing(campsite, nights, numberOfGuests, numberOfPets);

    // Create booking
    const booking = await BookingModel.create({
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

    // Auto-confirm if instant book
    if (campsite.isInstantBook) {
      await booking.confirm();
    }

    return booking;
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string, userId: string): Promise<BookingDocument> {
    const booking = await BookingModel.findById(bookingId)
      .populate("campsite")
      .populate("guest", "name email avatar")
      .populate("host", "name email avatar");

    appAssert(booking, ErrorFactory.resourceNotFound("Booking"));

    // Check permission (chỉ guest hoặc host mới xem được)
    appAssert(
      booking.guest.toString() === userId || booking.host.toString() === userId,
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
}
