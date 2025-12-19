

import { CLIENT_URL, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY, PAYOS_CLIENT_ID } from "@/constants";
import { OrderModel } from "@/models/order.model";
import ProductModel from "@/models/product.model";
import mongoose from "mongoose";

import { TOKENS } from "@/di/tokens";
import { container } from "@/di";
import NotificationService from "./notification.service";


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
      const orderCode = generateOrderCode();

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
            description: `ORDER`, 
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

      // Send notification to all admins about new order
      try {
        const notificationService = container.resolve<NotificationService>(TOKENS.NotificationService);
        const UserModel = (await import("@/models/user.model")).default;
        const customer = await UserModel.findById(userId);
        const admins = await UserModel.find({ role: "admin" });
        
        for (const admin of admins) {
          await notificationService.createNewOrderForAdmin(
            admin._id!.toString(),
            order!._id!.toString(),
            order!.code!,
            customer?.username || "Khách hàng",
            order!.grandTotal
          );
        }
      } catch (error) {
        console.error("Failed to send new order notification to admin:", error);
      }

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
  async cancelExpiredOrders() {

    // 2) HỦY ĐƠN CARD (12 giờ)
    const CARD_TIMEOUT_HOURS = 12;

    const cardExpireTime = new Date(Date.now() - CARD_TIMEOUT_HOURS * 60 * 60 * 1000);

    const expiredCardOrders = await OrderModel.find({
      paymentMethod: "card",
      paymentStatus: "pending",
      orderStatus: "pending",
      createdAt: { $lt: cardExpireTime },
    });

    for (const order of expiredCardOrders) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Hoàn lại stock
        for (const item of order.items) {
          await ProductModel.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session }
          );
        }

        // Cập nhật trạng thái đơn → cancel
        await OrderModel.updateOne(
          { _id: order._id },
          {
            orderStatus: "cancelled",
            paymentStatus: "failed", // optional
            cancelledAt: new Date(),
          },
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        console.log(`⛔ Đã hủy đơn card quá hạn 12h: ${order._id}`);
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(`❌ Lỗi khi hủy đơn card ${order._id}:`, err);
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

  async updateOrderStatus(
    orderId: string,
    status: "pending" | "processing" | "confirmed" | "shipping" | "delivered" | "completed" | "cancelled" | "cancel_request") {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return { success: false, message: "Đơn hàng không tồn tại" };
    }

    // Validate status transition
    const validTransitions: Record<string, Array<"pending" | "processing" | "confirmed" | "shipping" | "delivered" | "completed" | "cancelled" | "cancel_request">> = {
      pending: ["processing", "cancelled"],
      processing: ["confirmed", "cancelled"],
      confirmed: ["shipping", "cancelled"],
      shipping: ["delivered", "cancelled"],
      delivered: ["completed"],
      cancel_request: ["cancelled"],
    };

    const currentStatus = order.orderStatus;
    const allowedStatuses = validTransitions[currentStatus] || [];

    if (!allowedStatuses.includes(status)) {
      return {
        success: false,
        message: `Không thể chuyển từ trạng thái "${currentStatus}" sang "${status}"`,
      };
    }

    // Update status
    order.orderStatus = status;

    // Add to history
    order.history.push({
      status: status,
      date: new Date(),
    });

    await order.save();

    // Send notifications
    try {
      const notificationService = container.resolve<NotificationService>(TOKENS.NotificationService);
      
      // Map order status to notification type
      const notificationTypeMap: Record<string, "order_confirmed" | "order_shipping" | "order_delivered" | "order_cancelled"> = {
        confirmed: "order_confirmed",
        shipping: "order_shipping",
        delivered: "order_delivered",
        cancelled: "order_cancelled",
      };
      
      // Send notification to customer
      const notificationType = notificationTypeMap[status];
      if (notificationType) {
        await notificationService.createOrderNotification(
          order.user.toString(),
          orderId,
          order!.code!,
          notificationType
        );
      }

      // Send notification to admin when order is completed
      if (status === "completed") {
        const UserModel = (await import("@/models/user.model")).default;
        const customer = await UserModel.findById(order.user);
        const admins = await UserModel.find({ role: "admin" });
        
        for (const admin of admins) {
          await notificationService.createNotification({
            recipient: admin!._id!.toString(),
            type: "order_delivered",
            title: "Đơn hàng hoàn tất",
            message: `Đơn hàng ${order.code} của ${customer?.username || "khách hàng"} đã hoàn tất`,
            order: orderId,
            link: `/admin/orders/${orderId}`,
            actionType: "view_order",
            priority: "medium",
            role: "admin",
            metadata: {
              orderId,
              orderCode: order.code,
              customerName: customer?.username,
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to send order notification:", error);
      // Don't throw - notification failure shouldn't break the order flow
    }

    return {
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      order,
    };
  }

  async submitReturnRequest(
    orderId: string,
    userId: string,
    note: string,
    images: string[]
  ) {
    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      return { success: false, message: "Đơn hàng không tồn tại" };
    }

    // Kiểm tra order thuộc về user
    if (order.user.toString() !== userId) {
      return { success: false, message: "Bạn không có quyền trả hàng này" };
    }

    // Chỉ cho phép trả hàng nếu đơn đã được giao
    if (order.orderStatus !== "delivered" && order.orderStatus !== "completed") {
      return { 
        success: false, 
        message: "Chỉ có thể yêu cầu trả hàng khi đơn hàng đã được giao" 
      };
    }

    // Cập nhật trạng thái sang cancel_request
    order.orderStatus = "cancel_request";

    // Thêm vào history
    order.history.push({
      status: "cancel_request",
      date: new Date(),
      note: note,
      images: images,
    });

    await order.save();

    // Send notification to admin about return request
    try {
      const notificationService = container.resolve<NotificationService>(TOKENS.NotificationService);
      const UserModel = (await import("@/models/user.model")).default;
      const user = await UserModel.findById(userId);
      
      // Find all admin users
      const admins = await UserModel.find({ role: "admin" });
      
      // Send notification to all admins
      for (const admin of admins) {
        await notificationService.createReturnRequestNotification(
          admin!._id!.toString(),
          orderId,
          order!.code!,
          user?.username || "Khách hàng"
        );
      }
    } catch (error) {
      console.error("Failed to send return request notification:", error);
    }

    return {
      success: true,
      message: "Yêu cầu trả hàng đã được gửi, chúng tôi sẽ xử lý trong thời gian sớm nhất",
      order,
    };
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
