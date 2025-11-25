
import TourBModel, { TourBDocument, CustomerInfo } from "@/models/tourB.model";

export default class TourBService {

    // Tạo booking tour
    async createTourBooking(data: any, userId: string) {
        
        return TourBModel.create({
            ...data,
            code : generateOrderCode(),
            createdAt: new Date(),
            updatedAt: new Date(),

        });
    }

    async updateCustomerInfo(bookingId: string, customerInfo: CustomerInfo[]) {
        const booking = await TourBModel.findById(bookingId);
        if (!booking) {
            throw new Error("Booking không tồn tại");
        }
        booking.customers = customerInfo;
        await booking.save();
        return booking;
    }   
        

    // Lấy tất cả booking (Admin)
    async getAllBookings(): Promise<TourBDocument[]> {
        return TourBModel.find()
            .populate("tour")
            .sort({ createdAt: -1 })
            .exec();
    }

    // Lấy booking theo user (nếu có lưu userId vào model)
    async getBookingsByUser(userId: string) {
        return TourBModel.find({ userId }).populate("tour").exec();
    }

    // Lấy chi tiết
    async getBookingById(id: string): Promise<TourBDocument | null> {
        return TourBModel.findById(id).populate("tour");
    }

    // Cập nhật trạng thái booking
    async updateStatusBooking(id: string, status: "pending" | "completed" | "cancelled") {
        const booking = await TourBModel.findById(id);
        if (!booking) {
            return { success: false, message: "Không tìm thấy booking" };
        }

        booking.status = status;
        await booking.save();

        return { success: true, message: "Cập nhật trạng thái thành công", booking };
    }

    // Hủy booking
    async cancelBooking(id: string) {
        const booking = await TourBModel.findById(id);
        if (!booking) {
            return { success: false, message: "Booking không tồn tại" };
        }

        booking.status = "cancelled";
        await booking.save();

        return { success: true, message: "Hủy booking thành công", booking };
    }
}

function generateOrderCode(): string {
    const now = new Date();

    // Lấy ngày/tháng/năm dạng ddMMyy
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng 0-based
    const year = String(now.getFullYear()).slice(-2);

    // Sinh 3 số ngẫu nhiên để tránh trùng
    const random = Math.floor(Math.random() * 9000) + 1000; // 100 - 999

    return `HDTB${day}${month}${year}${random}`;
}
