import { catchErrors } from "@/errors";
import TourBService from "@/services/tourB.service";
import { ResponseUtil } from "@/utils";

export default class TourBController {
  constructor(private readonly tourBService: TourBService) {}

  // 🎯 Admin: lấy tất cả booking
  getAllBookings = catchErrors(async (req, res) => {
    const bookings = await this.tourBService.getAllBookings();
    return ResponseUtil.success(res, bookings, "Lấy danh sách booking tour thành công");
  });

  // 🎯 User: tạo booking tour
  createBooking = catchErrors(async (req, res) => {
    const result = await this.tourBService.createTourBooking(
      req.body,
      req.userId.toString()
    );

    return ResponseUtil.success(res, result, "Tạo booking tour thành công");
  });

  updateCustomerInfo = catchErrors(async (req, res) => {
    const { bookingId } = req.params;
    const customerInfo = req.body;

    const updatedBooking = await this.tourBService.updateCustomerInfo(bookingId?.toString() || "", customerInfo);

    return ResponseUtil.success(res, updatedBooking, "Cập nhật thông tin khách hàng thành công");
  });
  

  // 🎯 Lấy booking theo user
  getBookingsByUser = catchErrors(async (req, res) => {
    const data = await this.tourBService.getBookingsByUser(req.userId.toString());

    return ResponseUtil.success(res, data, "Lấy danh sách tour đã đặt thành công");
  });

  // 🎯 Chi tiết booking
  getBookingById = catchErrors(async (req, res) => {
    const { bookingId } = req.params;
    const booking = await this.tourBService.getBookingById(bookingId?.toString() || "");

    return ResponseUtil.success(res, booking, "Lấy chi tiết booking thành công");
  });

  // 🎯 Admin cập nhật trạng thái
  updateStatusBooking = catchErrors(async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    const result = await this.tourBService.updateStatusBooking(bookingId?.toString() || ""  , status);

    return ResponseUtil.success(res, result.booking, result.message);
  });

  // 🎯 Hủy booking
  cancelBooking = catchErrors(async (req, res) => {
    const { bookingId } = req.params;

    const result = await this.tourBService.cancelBooking(bookingId?.toString() || "");

    return ResponseUtil.success(res, result.booking, result.message);
  });
}
