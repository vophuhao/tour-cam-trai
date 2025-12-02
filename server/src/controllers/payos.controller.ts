
import mongoose from "mongoose";
import { BookingModel } from "@/models/booking.model";
import { OrderModel } from "@/models/order.model";
import ProductModel from "@/models/product.model";
import { AvailabilityModel } from "@/models/availability.model";
export async function handlePayOSWebhook(data: any) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderCode = data.data?.orderCode;
    const success = data.data?.status === "PAID" || data.success;
    const type = data.metadata?.type; // 'booking' hoặc 'order'

    if (!orderCode) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, code: "MISSING_ORDER_CODE", message: "Thiếu orderCode" };
    }

    // ✅ BOOKING PAYMENT
    if (type === "booking") {
      const booking = await BookingModel.findOne({ payOSOrderCode: orderCode }).session(session);

      if (!booking) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, code: "BOOKING_NOT_FOUND", message: "Không tìm thấy booking" };
      }

      if (success) {
        booking.paymentStatus = "paid";
        booking.status = "confirmed";
        booking.paidAt = new Date();
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        return {
          success: true,
          code: "PAYMENT_SUCCESS",
          message: "Thanh toán booking thành công",
          data: booking,
        };
      } else {
        booking.paymentStatus = "failed";
        booking.status = "cancelled";
        await booking.save({ session });

        // Unblock dates
        await AvailabilityModel.deleteMany(
          {
            campsite: booking.campsite,
            date: { $gte: booking.checkIn, $lt: booking.checkOut },
            blockType: "booked",
          },
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        return {
          success: false,
          code: "PAYMENT_FAILED",
          message: "Thanh toán booking thất bại",
          data: booking,
        };
      }
    }

    // ✅ ORDER PAYMENT (default)
    else {
      const order = await OrderModel.findOne({ payOSOrderCode: orderCode })
        .populate("items.product")
        .session(session);

      if (!order) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, code: "ORDER_NOT_FOUND", message: "Không tìm thấy đơn hàng" };
      }

      if (success) {
        order.paymentStatus = "paid";
        order.orderStatus = "processing";

        // Update product count
        for (const item of order.items) {
          await ProductModel.updateOne(
            { _id: item.product._id },
            { $inc: { count: item.quantity } },
            { session }
          );
        }

        await order.save({ session });
        await session.commitTransaction();
        session.endSession();

        return {
          success: true,
          code: "PAYMENT_SUCCESS",
          message: "Thanh toán đơn hàng thành công",
          data: order,
        };
      } else {
        order.paymentStatus = "failed";
        order.orderStatus = "cancelled";

        // Restore stock
        for (const item of order.items) {
          await ProductModel.updateOne(
            { _id: item.product._id },
            { $inc: { stock: item.quantity } },
            { session }
          );
        }

        await order.save({ session });
        await session.commitTransaction();
        session.endSession();

        return {
          success: false,
          code: "PAYMENT_FAILED",
          message: "Thanh toán đơn hàng thất bại",
          data: order,
        };
      }
    }
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error handling PayOS webhook:", err);
    return { success: false, code: "WEBHOOK_ERROR", message: err.message };
  }
}