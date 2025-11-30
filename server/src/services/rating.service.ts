import { Rating } from "../models/rating.model";
import { OrderModel } from "@/models/order.model";


export default class RatingService {

 async createRating(data: any, userId: string) {
 
  console.log("User ID in service:",data );
  // Kiểm tra order có tồn tại và thuộc về user không
  const order = await OrderModel.findOne({
    _id: data.order,
  });

  if (!order) {
    throw new Error("Đơn hàng không tồn tại hoặc chưa hoàn thành");
  }

  // Kiểm tra đã đánh giá chưa
  if (order.hasRated) {
    throw new Error("Bạn đã đánh giá đơn hàng này rồi");
  }

  // Tạo danh sách ratings
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
  }
  order.hasRated = true;
  await order.save();

  return {
    success: true,
    message: "Đánh giá thành công",
    ratings: createdRatings,
  };
}

  async updateRating(userId: string, data : any) {
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

  async deleteRating( ratingId: string) {
    const rating = await Rating.findById(ratingId);
    if (!rating) throw new Error("Đánh giá không tồn tại");
    await rating.deleteOne();
    return {
      success: true,
      message: "Xoá đánh giá thành công",    
    }
  }

  async getRatingsByProductId(productId: string) {
    return Rating.find({ product: productId })
  }
  async getRatingsByUserId(userId: string) {
    return Rating.find({ user: userId })
  }
}
