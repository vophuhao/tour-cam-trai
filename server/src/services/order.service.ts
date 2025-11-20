import { CLIENT_URL, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY, PAYOS_CLIENT_ID } from "@/constants";
import { OrderModel } from "@/models/order.model";
import ProductModel from "@/models/product.model";
import mongoose from "mongoose";

const { PayOS } = require("@payos/node");

const payos = new PayOS({
  clientId: PAYOS_CLIENT_ID,
  apiKey: PAYOS_API_KEY,
  checksumKey: PAYOS_CHECKSUM_KEY,
});

export default class OrderService {
  /** ✅ Tạo đơn hàng và trả lỗi rõ ràng cho FE */
  async createOrder(data: any, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 🔍 Kiểm tra tồn kho và giữ hàng
      for (const item of data.items) {
        console.log("Checking stock for product", item.product, "quantity", item.quantity);
        const result = await ProductModel.updateOne(
          { _id: new mongoose.Types.ObjectId(item.product), stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session }
        );

        if (result.matchedCount === 0) {
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            code: "OUT_OF_STOCK",
            message: `Sản phẩm không còn đủ hàng.`,
          };
        }
      }

      let payOSOrderCode: number | null = null;
      let payOSCheckoutUrl: string | null = null;
      const paymentStatus = "pending";
      let orderStatus = "pending";

      if (data.paymentMethod === "cod") {
        orderStatus = "processing";
      }

      // 💳 Online payment
      if (data.paymentMethod !== "cod") {
        payOSOrderCode = Math.floor(Date.now() / 1000);
        // const amount = Math.round(data.grandTotal);
        const amount = 2000; // TODO: TESTING ONLY

        try {
          const paymentLink = await payos.paymentRequests.create({
            orderCode: payOSOrderCode,
            amount,
            description: "Thanh toán đơn hàng",
            returnUrl: `${CLIENT_URL}/cart/payment/success`,
            cancelUrl: `${CLIENT_URL}/cart/payment/cancel`,
          });

          payOSCheckoutUrl =
            paymentLink?.checkoutUrl ||
            paymentLink?.url ||
            paymentLink?.redirectUrl ||
            paymentLink?.data?.checkoutUrl ||
            null;
        } catch (err: any) {
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            code: "PAYMENT_LINK_FAILED",
            message: "Không thể tạo link thanh toán online",
          };
        }
      }
      const orderCode = generateOrderCode();
      const [order] = await OrderModel.create(
        [
          {
            user: userId,
            code: orderCode,
            items: data.items,
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod,
            shippingMethod: data.shippingMethod,
            itemsTotal: data.itemsTotal,
            discount: data.discount,
            tax: data.tax,
            shippingFee: data.shippingFee,
            grandTotal: data.grandTotal,
            promoCode: data.promoCode,
            orderNote: data.orderNote,
            payOSOrderCode,
            payOSCheckoutUrl,
            paymentStatus,
            orderStatus,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        code: "ORDER_CREATED",
        message: "Tạo đơn hàng thành công",
        order,
      };
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        code: "CREATE_ORDER_FAILED",
        message: err.message || "Không thể tạo đơn hàng",
      };
    }
  }

  /** 🔔 Xử lý webhook PayOS */
  async handlePayOSWebhook(data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orderCode = data.data?.orderCode;
      const success = data.data?.status === "PAID" || data.success;

      if (!orderCode) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, code: "MISSING_ORDER_CODE", message: "Thiếu orderCode" };
      }

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

        return { success: true, code: "PAYMENT_SUCCESS", message: "Thanh toán thành công", order };
      } else {
        order.paymentStatus = "failed";
        order.orderStatus = "cancelled";

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

        return { success: false, code: "PAYMENT_FAILED", message: "Thanh toán thất bại", order };
      }
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, code: "WEBHOOK_ERROR", message: err.message };
    }
  }

  /** ⏰ Hủy đơn COD quá hạn (cron job) */
  async cancelExpiredCODOrders(timeoutMinutes = 15) {
    const expireTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const expiredOrders = await OrderModel.find({
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "pending",
      createdAt: { $lt: expireTime },
    });

    for (const order of expiredOrders) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        for (const item of order.items) {
          await ProductModel.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session }
          );
        }

        await OrderModel.deleteOne({ _id: order._id }, { session });

        await session.commitTransaction();
        session.endSession();
        console.log(`🗑️ Đã xóa đơn COD quá hạn: ${order._id}`);
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(`❌ Lỗi khi xóa đơn COD ${order._id}:`, err);
      }
    }
  }

  async getAllOrders() {
    return await OrderModel.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });
  }
  async getOrdersByUser(userId: string) {
    const orders = await OrderModel.find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 });
    return orders;
  }


  async updateStatusOrder(orderId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return { success: false, message: "Đơn hàng không tồn tại" };
    }

    type OrderStatus =
      | "pending"
      | "processing"
      | "confirmed"
      | "shipping"
      | "completed"
      | "cancelled";

    const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
      pending: "processing",
      processing: "confirmed",
      confirmed: "shipping",
      shipping: "completed",
      completed: null,
      cancelled: null,
    };

    const current = order.orderStatus as OrderStatus;
    const next = nextStatusMap[current];

    if (!next) {
      return {
        success: false,
        message: `Không thể cập nhật trạng thái từ "${current}".`,
      };
    }

    order.orderStatus = next;
    await order.save();

    return {
      success: true,
      message: `Cập nhật trạng thái đơn hàng thành "${next}" thành công.`,
      order,
    };
  }

  async getOrderById(orderId: string) {
    const order = await OrderModel.findById(orderId)
    return order;
  }
  
  async cancelOrder(orderId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return { success: false, message: "Đơn hàng không tồn tại" };
    }
    if (order.orderStatus === "cancelled") {
      return { success: false, message: "Đơn hàng đã bị hủy" };
    }

    order.orderStatus = "cancelled";
    await order.save();

    return { success: true, message: "Hủy đơn hàng thành công", order };
  }

}

function generateOrderCode(): string {
  const now = new Date();

  // Lấy ngày/tháng/năm dạng ddMMyy
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng 0-based
  const year = String(now.getFullYear()).slice(-2);

  // Sinh 3 số ngẫu nhiên để tránh trùng
  const random = Math.floor(Math.random() * 900) + 100; // 100 - 999

  return `HD${day}${month}${year}${random}`;
}
