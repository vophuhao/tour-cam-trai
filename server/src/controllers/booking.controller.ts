import { catchErrors } from "@/errors";
import type { BookingService } from "@/services/booking.service";
import { ResponseUtil } from "@/utils";
import { mongoIdSchema } from "@/validators";
import {
  cancelBookingSchema,
  confirmBookingSchema,
  createBookingSchema,
  refundBookingSchema,
  searchBookingSchema,
  updatePaymentSchema,
} from "@/validators/booking.validator";
import mongoose from "mongoose";

export default class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Create booking (guest)
   * @route POST /api/bookings
   */
  createBooking = catchErrors(async (req, res) => {
    // Parse and validate input
    const input = createBookingSchema.parse(req.body);
    const guestId = mongoIdSchema.parse(req.userId);

    // Create booking - availability check now handles maxConcurrentBookings automatically
    const booking = await this.bookingService.createBooking(guestId, input);

    return ResponseUtil.created(res, booking, "Đặt chỗ thành công");
  });

  /**
   * Get booking details
   * @route GET /api/bookings/:id
   */
  getBooking = catchErrors(async (req, res) => {
    const { id } = req.params;
    const userId = mongoIdSchema.parse(req.userId);

    const booking = await this.bookingService.getBooking(id || "", userId);

    return ResponseUtil.success(res, booking, "Lấy thông tin booking thành công");
  });

  /**
   * Search my bookings
   * @route GET /api/bookings
   */
  searchBookings = catchErrors(async (req, res) => {
    const input = searchBookingSchema.parse(req.query);
    const userId = mongoIdSchema.parse(req.userId);

    const { data, pagination } = await this.bookingService.searchBookings(userId, input);

    return ResponseUtil.paginated(res, data, pagination, "Lấy danh sách booking thành công");
  });

  /**
   * Confirm booking (host)
   * @route POST /api/bookings/:id/confirm
   */
  confirmBooking = catchErrors(async (req, res) => {
    const { id } = req.params;
    const hostId = mongoIdSchema.parse(req.userId);
    const { hostMessage } = confirmBookingSchema.parse(req.body);

    const booking = await this.bookingService.confirmBooking(id || "", hostId, hostMessage);

    return ResponseUtil.success(res, booking, "Xác nhận booking thành công");
  });

  /**
   * Cancel booking (guest or host)
   * @route POST /api/bookings/:id/cancel
   */
  cancelBooking = catchErrors(async (req, res) => {
    const { id } = req.params;
    const userId = mongoIdSchema.parse(req.userId);
    const input = cancelBookingSchema.parse(req.body);

    const booking = await this.bookingService.cancelBooking(
      id || "",
      userId as unknown as mongoose.Types.ObjectId,
      input
    );

    return ResponseUtil.success(res, booking, "Hủy booking thành công");
  });
  

  /**
   * Complete booking (system - called after checkout date)
   * @route POST /api/bookings/:id/complete
   */
  completeBooking = catchErrors(async (req, res) => {
    const { id } = req.params;

    const booking = await this.bookingService.completeBooking(id || "");
    return ResponseUtil.success(res, booking, "Hoàn thành booking thành công");
  });

  /**
   * Refund booking (host or admin)
   * @route POST /api/bookings/:id/refund
   */
  refundBooking = catchErrors(async (req, res) => {
    const { id } = req.params;
    const userId = mongoIdSchema.parse(req.userId);
    const { refundAmount } = refundBookingSchema.parse(req.body);

    const booking = await this.bookingService.refundBooking(id || "", userId, refundAmount);
    return ResponseUtil.success(res, booking, "Hoàn tiền booking thành công");
  });

  /**
   * Update payment status (admin)
   * @route PATCH /api/bookings/:id/payment
   */
  updatePayment = catchErrors(async (req, res) => {
    const { id } = req.params;
    // Validate input
    updatePaymentSchema.parse(req.body);

    // This would be in a separate payment service, simplified here
    const booking = await this.bookingService.getBooking(id || "", mongoIdSchema.parse(req.userId));

    return ResponseUtil.success(res, booking, "Cập nhật thanh toán thành công");
  });

  getMyBookings = catchErrors(async (req, res) => {
    const userId = mongoIdSchema.parse(req.userId);

    const { data, pagination } = await this.bookingService.getMyBookings(userId);
    return ResponseUtil.paginated(
      res,
      data,
      pagination,
      "Lấy danh sách booking của tôi thành công"
    );
  });
  getBookingByCode = catchErrors(async (req, res) => {
    const { code } = req.params;

    const booking = await this.bookingService.getBookingByCode(code || "");
    return ResponseUtil.success(res, booking, "Lấy thông tin booking thành công");
  });

  handlePayOSWebhook = catchErrors(async (req, res) => {
    const result = await this.bookingService.handlePayOSWebhook(req.body);
    return res.status(200).json(result);
  });

  userCancelPayment = catchErrors(async (req, res) => {
    const { id } = req.params;
    const result = await this.bookingService.userCancelPayment(id || "");
    return ResponseUtil.success(res, result, "Hủy thanh toán booking thành công");
  });
}
