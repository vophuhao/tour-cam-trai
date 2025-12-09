
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
import { sendMail } from "@/utils/send-mail";
import type {
  CancelBookingInput,
  CreateBookingInput,
  SearchBookingInput,
} from "@/validators/booking.validator";
import mongoose from "mongoose";
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
      fullnameGuest,
      phone,
      email,
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
    const pricing = this.calculatePricing(
      site,
      nights,
      numberOfGuests,
      numberOfPets,
      checkInDate,
      checkOutDate
    );

    let payOSOrderCode: number | null = null;
    let payOSCheckoutUrl: string | null = null;
    const code = this.generateBookingCode();
    payOSOrderCode = Math.floor(Date.now() / 1000);
    const amount = 2000;

    try {
      const paymentLink = await payos.paymentRequests.create({
        orderCode: payOSOrderCode,
        amount,
        description: `BOOKING ${code}`,
        returnUrl: `${CLIENT_URL}/bookings/${code}/confirmation`,
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
      fullnameGuest: fullnameGuest,
      phone: phone,
      email: email,
      paymentMethod,
      paymentStatus: "pending",
    });

    // Calculate total
    await booking.calculateTotal();
    // Block dates in availability calendar
    // NOTE: Only block for DESIGNATED sites (maxConcurrentBookings = 1)
    // Undesignated sites handle availability through concurrent booking count
    if (siteId) {
      const maxConcurrent = site!.capacity.maxConcurrentBookings || 1;
      if (maxConcurrent === 1) {
        // Designated site: Block dates in availability calendar
        await this.blockDatesForBooking(siteId, checkInDate, checkOutDate);
      }
      // For undesignated sites (maxConcurrent > 1), availability is managed
      // by counting bookings in getBlockedDates(), not by Availability records
    }
    // Auto-confirm if instant book
    if (site!.bookingSettings.instantBook) {
      await booking.confirm();
    }

    return booking;
  }

  async getBookingByCode(code: string): Promise<BookingDocument> {
    const booking = await BookingModel.findOne({ code })
      .populate("site", "name accommodationType photos pricing location")
      .populate("guest", "username email avatarUrl")
      .populate("property", "name location photos slug")
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
    const booking = await BookingModel.findOne({ code: bookingId })
      .populate("property", "name location photos cancellationPolicy slug")
      .populate({
        path: "site",
        select: "name accommodationType photos pricing slug",
        populate: {
          path: "property",
          select: "name location photos slug host cancellationPolicy",
          populate: {
            path: "host",
            select: "fullName username avatarUrl",
          },
        },
      })
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
    const booking = await BookingModel.findOne({ code: bookingId });
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
    if (input.cancellInformation) {
      booking.cancellInformation = input.cancellInformation;
      await booking.save();
    }
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

    // Unblock dates when booking is completed
    // This releases the dates back to availability pool
    await this.unblockDatesForBooking(booking.site.toString(), booking.checkIn, booking.checkOut);

    return booking;
  }

  /**
   * Refund booking (admin or host action)
   */
  async refundBooking(
    bookingId: string,
    userId: string,
    refundAmount?: number
  ): Promise<BookingDocument> {
    const booking = await BookingModel.findById(bookingId);
    appAssert(booking, ErrorFactory.resourceNotFound("Booking"));

    // Check permission (host or admin)
    const isHost = booking.host.toString() === userId;
    // Admin check would go here if needed
    appAssert(isHost, ErrorFactory.forbidden("Bạn không có quyền refund booking này"));

    // Check status
    appAssert(
      booking.status === "confirmed" || booking.status === "cancelled",
      ErrorFactory.badRequest("Không thể refund booking này")
    );

    // Check payment status
    appAssert(
      booking.paymentStatus === "paid",
      ErrorFactory.badRequest("Booking chưa được thanh toán")
    );

    // Set refund
    booking.status = "refunded";
    booking.refundAmount = refundAmount || booking.pricing.total;
    await booking.save();

    // Unblock dates when booking is refunded
    await this.unblockDatesForBooking(booking.site.toString(), booking.checkIn, booking.checkOut);

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
        .populate({
          path: "site",
          select: "name slug photos accommodationType pricing",
          populate: {
            path: "property",
            select: "name location photos slug host",
            populate: {
              path: "host",
              select: "fullName username",
            },
          },
        })
        .populate("guest", "username email avatarUrl")
        .populate("host", "username email avatarUrl")
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
    numberOfPets: number,
    checkIn: Date,
    checkOut: Date
  ): any {
    const {
      basePrice,
      weekendPrice = null,
      cleaningFee = 0,
      petFee = 0,
      additionalGuestFee = 0,
      vehicleFee = 0,
    } = site.pricing;

    // Calculate weekend nights if weekendPrice is defined
    let subtotal = basePrice * nights;
    let weekdayNights = nights;
    let weekendNights = 0;

    if (weekendPrice !== null && weekendPrice > 0) {
      // Count actual weekend nights (Friday & Saturday)
      const currentDate = new Date(checkIn);
      let weekendCount = 0;

      while (currentDate < checkOut) {
        const dayOfWeek = currentDate.getDay();
        // 5 = Friday, 6 = Saturday
        if (dayOfWeek === 5 || dayOfWeek === 6) {
          weekendCount++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      weekendNights = weekendCount;
      weekdayNights = nights - weekendNights;
      subtotal = weekdayNights * basePrice + weekendNights * weekendPrice;
    }

    const cleaning = cleaningFee;
    const pet = numberOfPets > 0 ? petFee * numberOfPets : 0;
    const extraGuest =
      numberOfGuests > site.capacity.maxGuests
        ? additionalGuestFee * (numberOfGuests - site.capacity.maxGuests)
        : 0;

    return {
      basePrice,
      weekendPrice: weekendPrice || basePrice,
      totalNights: nights,
      weekdayNights,
      weekendNights,
      subtotal,
      cleaningFee: cleaning,
      petFee: pet,
      extraGuestFee: extraGuest,
      vehicleFee: 0, // Not implemented yet
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

    // Generate all dates from checkIn to checkOut (INCLUSIVE)
    // Must include checkout date to prevent overlapping bookings
    while (currentDate <= checkOut) {
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
    // Remove availability records for booked dates (inclusive of checkout)
    // Only applies to designated sites (maxConcurrentBookings = 1)
    // Undesignated sites don't create availability blocks
    await AvailabilityModel.deleteMany({
      site: siteId,
      date: { $gte: checkIn, $lte: checkOut },
      blockType: "booked",
    });
  }

  async getMyBookings(userId: string) {
    const query = {
      $or: [{ host: userId }],
    };
    const bookings = await BookingModel.find(query)
      .populate("property", "name slug location photos")
      .populate("site", "name slug accommodationType photos pricing location")
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

  async userCancelPayment(orderCode: string) {
    console.log("User cancel payment for orderCode:", orderCode);
    const booking = await BookingModel.findOne({ payOSOrderCode: orderCode });
    appAssert(booking, ErrorFactory.resourceNotFound("Booking"));

    if (!booking.code) {
      console.log("No booking found for orderCode:", orderCode);
      return {
        success: false,
        message: "No booking found for the provided order code",
      };
    }
    const bookingId = booking.code.toString();
    // ❗ cancelBooking cần booking._id (ObjectId), không phải orderCode
    await this.cancelBooking(bookingId, booking.guest as mongoose.Types.ObjectId, {
      cancellationReason: "User cancelled payment",
    });
    await booking.deleteOne();
    return {
      success: true,
      message: "Booking payment cancelled and booking removed",
    };
  }

  /**
   * Auto cancel expired pending bookings and send reminder emails
   * - Send reminder email after 6 hours
   * - Auto cancel and delete after 24 hours
   */

  async cancelExpiredPendingBookings() {
    const REMINDER_HOURS = 6;
    const CANCEL_HOURS = 24;

    const now = new Date();
    const reminderTime = new Date(now.getTime() - REMINDER_HOURS * 60 * 60 * 1000);
    const cancelTime = new Date(now.getTime() - CANCEL_HOURS * 60 * 60 * 1000);

    // 1) TÌM BOOKING CẦN GỬI EMAIL NHẮC NHỞ (6 giờ)
    const bookingsNeedReminder = await BookingModel.find({
      paymentStatus: "pending",
      createdAt: { $lt: reminderTime, $gte: cancelTime },
      reminderSent: { $ne: true },
    })
      .populate("guest", "username email fullName")
      .populate("site", "name")
      .populate("property", "name");

    for (const booking of bookingsNeedReminder) {
      try {
        const guestEmail = booking.email || (booking.guest as any)?.email;
        const guestName =
          booking.fullnameGuest ||
          (booking.guest as any)?.fullName ||
          (booking.guest as any)?.username ||
          "Quý khách";
        const propertyName = (booking.property as any)?.name || "Khu cắm trại";
        const siteName = (booking.site as any)?.name || "Site";
        const totalAmount = booking.pricing?.total || 0;
        const checkoutUrl =
          booking.payOSCheckoutUrl || `${CLIENT_URL}/bookings/${booking.code}/confirmation`;
        if (!booking.isSentMail) {
          await sendMail({
            to: guestEmail,
            subject: "⏰ Nhắc nhở hoàn tất thanh toán booking",
            html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { 
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
                border-radius: 10px 10px 0 0; 
              }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { 
                display: inline-block; 
                background: #10b981; 
                color: white !important; 
                padding: 15px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                margin: 20px 0;
                font-weight: bold;
              }
              .info-box { 
                background: white; 
                padding: 20px; 
                border-left: 4px solid #f59e0b; 
                margin: 20px 0; 
                border-radius: 5px; 
              }
              .warning-box { 
                background: #fee2e2; 
                padding: 20px; 
                border-left: 4px solid #ef4444; 
                margin: 20px 0; 
                border-radius: 5px; 
              }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
              .highlight { color: #f59e0b; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Nhắc nhở thanh toán</h1>
                <p style="font-size: 16px; margin: 10px 0;">Booking của bạn đang chờ thanh toán</p>
              </div>
              
              <div class="content">
                <p>Xin chào <strong>${guestName}</strong>,</p>
                
                <p>Chúng tôi nhận thấy booking <strong class="highlight">${booking.code}</strong> của bạn chưa được thanh toán.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #f59e0b;">📋 Thông tin booking</h3>
                  <p><strong>Mã booking:</strong> ${booking.code}</p>
                  <p><strong>Địa điểm:</strong> ${siteName} - ${propertyName}</p>
                  <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString("vi-VN")}</p>
                  <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString("vi-VN")}</p>
                  <p><strong>Số đêm:</strong> ${booking.nights} đêm</p>
                  <p><strong>Số khách:</strong> ${booking.numberOfGuests} người</p>
                  <p style="font-size: 18px; color: #10b981; margin-top: 15px;">
                    <strong>Tổng tiền:</strong> ${totalAmount.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                
                <div class="warning-box">
                  <p style="margin: 0; color: #dc2626;">
                    <strong>⚠️ Lưu ý quan trọng:</strong> Booking sẽ tự động bị hủy sau <strong>18 giờ nữa</strong> nếu không được thanh toán.
                  </p>
                </div>
                
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${checkoutUrl}" class="button" style="color: white;">
                    💳 Thanh toán ngay
                  </a>
                </p>
                
                <h3>📌 Tại sao cần thanh toán ngay?</h3>
                <ul>
                  <li>Đảm bảo chỗ của bạn không bị người khác đặt</li>
                  <li>Tránh mất slot trong thời gian cao điểm</li>
                  <li>Nhận xác nhận booking ngay lập tức</li>
                  <li>Yên tâm chuẩn bị cho chuyến đi</li>
                </ul>
                
                <p style="margin-top: 30px;">Nếu bạn gặp vấn đề khi thanh toán, vui lòng liên hệ với chúng tôi ngay.</p>
                
                <p style="margin-top: 20px;">
                  Trân trọng,<br>
                  <strong>Đội ngũ HipCamp</strong>
                </p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} HipCamp. All rights reserved.</p>
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <p>Liên hệ: support@hipcamp.vn</p>
              </div>
            </div>
          </body>
          </html>
        `,
          });
          booking.isSentMail = true;
          await booking.save();
        }
        // Đánh dấu đã gửi reminder
        await BookingModel.updateOne({ _id: booking._id }, { $set: { reminderSent: true } });
        console.log(
          `📧 Đã gửi email nhắc nhở thanh toán: Booking ${booking.code} đến ${guestEmail}`
        );
      } catch (err) {
        console.error(`❌ Lỗi gửi email nhắc nhở Booking ${booking.code}:`, err);
      }
    }
    // 2) TÌM VÀ HỦY BOOKING QUÁ HẠN 24 GIỜ
    const expiredBookings = await BookingModel.find({
      paymentStatus: "pending",
      status: "pending",
      createdAt: { $lt: cancelTime },
    })
      .populate("guest", "username email fullName")
      .populate("site", "name")
      .populate("property", "name");

    for (const booking of expiredBookings) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const bookingId = (booking._id as mongoose.Types.ObjectId).toString();
        const siteId = booking.site.toString();

        // Unblock dates (giải phóng lịch)
        await this.unblockDatesForBooking(siteId, booking.checkIn, booking.checkOut);

        // Hủy booking (sử dụng logic existing)
        await this.cancelBooking(bookingId, booking.guest as mongoose.Types.ObjectId, {
          cancellationReason: "Auto-cancelled: Payment timeout after 24 hours",
        });
        await booking.save();
        await session.commitTransaction();
        session.endSession();

        console.log(`⛔ Đã tự động hủy và xóa booking quá hạn 24h: ${booking.code}`);

        // Gửi email thông báo hủy
        try {
          const guestEmail = booking.email || (booking.guest as any)?.email;
          const guestName =
            booking.fullnameGuest ||
            (booking.guest as any)?.fullName ||
            (booking.guest as any)?.username ||
            "Quý khách";
          const propertyName = (booking.property as any)?.name || "Khu cắm trại";
          const siteName = (booking.site as any)?.name || "Site";

          await sendMail({
            to: guestEmail,
            subject: "❌ Booking đã bị hủy do quá thời gian thanh toán",
            html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { 
                  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                  color: white; 
                  padding: 30px; 
                  text-align: center; 
                  border-radius: 10px 10px 0 0; 
                }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { 
                  display: inline-block; 
                  background: #3b82f6; 
                  color: white !important; 
                  padding: 15px 40px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  margin: 20px 0;
                  font-weight: bold;
                }
                .info-box { 
                  background: white; 
                  padding: 20px; 
                  border-left: 4px solid #ef4444; 
                  margin: 20px 0; 
                  border-radius: 5px; 
                }
                .tips-box { 
                  background: #dbeafe; 
                  padding: 20px; 
                  border-left: 4px solid #3b82f6; 
                  margin: 20px 0; 
                  border-radius: 5px; 
                }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>❌ Booking đã bị hủy</h1>
                  <p style="font-size: 16px; margin: 10px 0;">Hết thời gian thanh toán</p>
                </div>
                
                <div class="content">
                  <p>Xin chào <strong>${guestName}</strong>,</p>
                  
                  <p>Rất tiếc, booking <strong>${booking.code}</strong> của bạn đã bị hủy tự động do không được thanh toán trong vòng 24 giờ.</p>
                  
                  <div class="info-box">
                    <h3 style="margin-top: 0; color: #ef4444;">📋 Thông tin booking đã hủy</h3>
                    <p><strong>Mã booking:</strong> ${booking.code}</p>
                    <p><strong>Địa điểm:</strong> ${siteName} - ${propertyName}</p>
                    <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString("vi-VN")}</p>
                    <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString("vi-VN")}</p>
                    <p><strong>Lý do hủy:</strong> <span style="color: #ef4444;">Quá thời gian thanh toán (24 giờ)</span></p>
                  </div>
                  
                  <div class="tips-box">
                    <h3 style="margin-top: 0; color: #3b82f6;">💡 Bạn vẫn muốn đặt chỗ?</h3>
                    <ul>
                      <li>Kiểm tra lại lịch trống tại địa điểm</li>
                      <li>Tạo booking mới và thanh toán ngay</li>
                      <li>Liên hệ với chúng tôi nếu cần hỗ trợ</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="${CLIENT_URL}/properties" class="button" style="color: white;">
                      🔍 Tìm địa điểm khác
                    </a>
                  </div>
                  
                  <p style="margin-top: 30px;">
                    Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
                  </p>
                  
                  <p style="margin-top: 20px;">
                    Trân trọng,<br>
                    <strong>Đội ngũ HipCamp</strong>
                  </p>
                </div>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} HipCamp. All rights reserved.</p>
                  <p>Liên hệ hỗ trợ: support@hipcamp.vn | Hotline: 1900-xxxx</p>
                </div>
              </div>
            </body>
            </html>
          `,
          });

          console.log(`📧 Đã gửi email thông báo hủy booking: ${booking.code} đến ${guestEmail}`);
        } catch (emailErr) {
          console.error(`❌ Lỗi gửi email thông báo hủy Booking ${booking.code}:`, emailErr);
        }
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(`❌ Lỗi khi hủy booking ${booking.code}:`, err);
      }
    }

    return {
      remindersSent: bookingsNeedReminder.length,
      bookingsCancelled: expiredBookings.length,
    };
  }

  /**
 * Auto complete bookings after checkout date and send completion emails
 */
  async autoCompleteBooking() {
    try {
      const now = new Date();

      // Find all confirmed bookings where checkout date has passed
      const bookingsToComplete = await BookingModel.find({
        status: 'confirmed',
        paymentStatus: 'paid',
        checkOut: { $lt: now }
      })
        .populate('guest', 'username email fullName')
        .populate('site', 'name')
        .populate('property', 'name');

      if (bookingsToComplete.length === 0) {
        console.log('✅ Không có booking nào cần hoàn thành');
        return { completed: 0 };
      }

      let completedCount = 0;

      for (const booking of bookingsToComplete) {
        try {
          // Update booking status to completed
          booking.status = 'completed';
          await booking.save();

          // Unblock dates when booking is completed
          await this.unblockDatesForBooking(
            booking.site.toString(),
            booking.checkIn,
            booking.checkOut
          );

          completedCount++;
          console.log(`✅ Đã hoàn thành booking: ${booking.code}`);

          // Send completion email to guest
          try {
            const guestEmail = booking.email || (booking.guest as any)?.email;
            const guestName =
              booking.fullnameGuest ||
              (booking.guest as any)?.fullName ||
              (booking.guest as any)?.username ||
              'Quý khách';
            const propertyName = (booking.property as any)?.name || 'Khu cắm trại';
            const siteName = (booking.site as any)?.name || 'Site';

            await sendMail({
              to: guestEmail,
              subject: '🎉 Chuyến đi của bạn đã hoàn thành - Cảm ơn bạn!',
              html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { 
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                  color: white; 
                  padding: 30px; 
                  text-align: center; 
                  border-radius: 10px 10px 0 0; 
                }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { 
                  display: inline-block; 
                  background: #3b82f6; 
                  color: white !important; 
                  padding: 15px 40px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  margin: 20px 0;
                  font-weight: bold;
                }
                .info-box { 
                  background: white; 
                  padding: 20px; 
                  border-left: 4px solid #10b981; 
                  margin: 20px 0; 
                  border-radius: 5px; 
                }
                .tips-box { 
                  background: #dbeafe; 
                  padding: 20px; 
                  border-left: 4px solid #3b82f6; 
                  margin: 20px 0; 
                  border-radius: 5px; 
                }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Chuyến đi đã hoàn thành!</h1>
                  <p style="font-size: 16px; margin: 10px 0;">Cảm ơn bạn đã tin tưởng HipCamp</p>
                </div>
                
                <div class="content">
                  <p>Xin chào <strong>${guestName}</strong>,</p>
                  
                  <p>Chuyến đi của bạn tại <strong>${siteName} - ${propertyName}</strong> đã hoàn thành. Chúng tôi hy vọng bạn đã có những trải nghiệm tuyệt vời!</p>
                  
                  <div class="info-box">
                    <h3 style="margin-top: 0; color: #10b981;">📋 Thông tin chuyến đi</h3>
                    <p><strong>Mã booking:</strong> ${booking.code}</p>
                    <p><strong>Địa điểm:</strong> ${siteName} - ${propertyName}</p>
                    <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Số đêm:</strong> ${booking.nights} đêm</p>
                    <p><strong>Số khách:</strong> ${booking.numberOfGuests} người</p>
                  </div>
                  
                  <div class="tips-box">
                    <h3 style="margin-top: 0; color: #3b82f6;">⭐ Chia sẻ trải nghiệm của bạn</h3>
                    <p>Đánh giá của bạn sẽ giúp những khách hàng khác có thêm thông tin để lựa chọn địa điểm phù hợp!</p>
                    <ul>
                      <li>Viết review về chuyến đi</li>
                      <li>Đánh giá dịch vụ và tiện nghi</li>
                      <li>Chia sẻ hình ảnh đẹp</li>
                      <li>Giúp cộng đồng camping Việt Nam phát triển</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="${CLIENT_URL}/bookings/${booking.code}/review" class="button" style="color: white;">
                      ⭐ Viết đánh giá
                    </a>
                  </div>
                  
                  <p style="margin-top: 30px;">
                    Cảm ơn bạn đã lựa chọn HipCamp. Chúng tôi mong được phục vụ bạn trong những chuyến đi tiếp theo!
                  </p>
                  
                  <p style="margin-top: 20px;">
                    Trân trọng,<br>
                    <strong>Đội ngũ HipCamp</strong>
                  </p>
                </div>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} HipCamp. All rights reserved.</p>
                  <p>Liên hệ hỗ trợ: support@hipcamp.vn | Hotline: 1900-xxxx</p>
                </div>
              </div>
            </body>
            </html>
            `,
            });

            console.log(`📧 Đã gửi email hoàn thành booking: ${booking.code} đến ${guestEmail}`);
          } catch (emailErr) {
            console.error(`❌ Lỗi gửi email hoàn thành Booking ${booking.code}:`, emailErr);
          }
        } catch (err) {
          console.error(`❌ Lỗi khi hoàn thành booking ${booking.code}:`, err);
        }
      }

      return {
        completed: completedCount,
        total: bookingsToComplete.length,
      };
    } catch (error) {
      console.error('❌ Lỗi trong autoCompleteBooking:', error);
      throw error;
    }
  }
}
