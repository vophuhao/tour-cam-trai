import ProductModel from "@/models/product.model";
import { Rating } from "../models/rating.model";
import { OrderModel } from "@/models/order.model";
import mongoose from "mongoose";

export default class RatingService {

  async createRating(data: any, userId: string) {

    const order = await OrderModel.findOne({ _id: data.order });
    if (!order) throw new Error("Đơn hàng không tồn tại hoặc chưa hoàn thành");

    if (order.hasRated) throw new Error("Bạn đã đánh giá đơn hàng này rồi");

    const createdRatings = [];

    for (const ratingData of data.ratings) {
      // Tạo rating mới
      const newRating = await Rating.create({
        user: userId,
        product: ratingData.product._id,
        order: data.order,
        rating: ratingData.rating,
        review: ratingData.review,
      });

      createdRatings.push(newRating);

      // 👉 Cập nhật lại rating của product sau khi tạo rating
      await this.updateProductRating(ratingData.product._id);
    }

    order.hasRated = true;
    await order.save();

    return {
      success: true,
      message: "Đánh giá thành công",
      ratings: createdRatings,
    };
  }
  async updateProductRating(productId: string) {
    // Lấy tất cả đánh giá của product
    const stats = await Rating.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          average: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await ProductModel.findByIdAndUpdate(productId, {
        rating: {
          average: stats[0].average,
          count: stats[0].count
        }
      });
    } else {
      // Nếu chưa có rating nào -> reset về 0
      await ProductModel.findByIdAndUpdate(productId, {
        rating: {
          average: 0,
          count: 0
        }
      });
    }
  }


  async updateRating(userId: string, data: any) {
    const rating = await Rating.findById(data.ratings!);
    if (!rating) throw new Error("Đánh giá không tồn tại");

    if (rating.user.toString() !== userId.toString())
      throw new Error("Bạn không có quyền sửa đánh giá này");

    const diff = Date.now() - rating.createdAt.getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (diff > sevenDays) {
      throw new Error("Đánh giá đã quá hạn 7 ngày, không thể sửa.");
    }

    Object.assign(rating, data);
    return rating.save();

  }

  async deleteRating(ratingId: string) {
    const rating = await Rating.findById(ratingId);
    if (!rating) throw new Error("Đánh giá không tồn tại");
    await rating.deleteOne();
    return {
      success: true,
      message: "Xoá đánh giá thành công",
    }
  }

  async getRatingsByProductId(productId: string) {
    return Rating.find({ product: productId }).populate('user', "_id username avatarUrl ");
  }
  async getRatingsByUserId(userId: string) {
    return Rating.find({ user: userId }).populate('user', "_id username avatarUrl ");
  }

  async getAllRatings() {
    return Rating.find()
    .populate('user', "_id username avatarUrl ")
    .populate('product', "name _id images")
    .populate('order', "_id code");
  }

  async adminReplyToRating(ratingId: string, message: string) {
    const rating = await Rating.findById(ratingId);
    if (!rating) throw new Error("Đánh giá không tồn tại");
    rating.adminReply = {
      message,
      repliedAt: new Date(),
    };
    return rating.save();
  } 
}
