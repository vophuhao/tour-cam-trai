import cron from "node-cron";
import { OrderModel } from "@/models/order.model";
import ProductModel from "@/models/product.model";
import mongoose from "mongoose";

/**
 * 🔄 Xóa đơn COD chưa thanh toán sau 15 phút
 */
cron.schedule("*/5 * * * *", async () => {
  const timeoutMinutes = 15;
  const now = new Date(Date.now() - timeoutMinutes * 60000);

  const expiredOrders = await OrderModel.find({
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "pending",
    createdAt: { $lt: now },
  });

  for (const order of expiredOrders) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Hoàn stock
      for (const item of order.items) {
        await ProductModel.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      // Xóa đơn
      await OrderModel.deleteOne({ _id: order._id }, { session });

      await session.commitTransaction();
      console.log(`🕒 Đã xóa đơn COD hết hạn: ${order._id}`);
    } catch (err) {
      await session.abortTransaction();
      console.error(`❌ Lỗi khi xóa đơn COD ${order._id}:`, err);
    } finally {
      session.endSession();
    }
  }
});
