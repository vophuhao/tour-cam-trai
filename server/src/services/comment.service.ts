import CommentModel, { CommentDocument } from "@/models/comment.model";
import ProductModel from "@/models/product.model";
import TourModel from "@/models/tour.model";

export default class CommentService {
  createComment = async (data: {
    userId: string;
    entityType: "PRODUCT" | "TOUR";
    entityId: string;
    content: string;
    rating?: number;
  }): Promise<CommentDocument> => {
    const { entityType, entityId, userId, content, rating } = data;

    // Kiểm tra entity tồn tại
    let entity: any;
    if (entityType === "PRODUCT") {
      entity = await ProductModel.findById(entityId);
    } else {
      entity = await TourModel.findById(entityId);
    }
    if (!entity) throw new Error(`${entityType} không tồn tại`);

    // Tạo comment
    const comment = await CommentModel.create({
      user: userId,
      entityType,
      entityId,
      content,
      rating,
    });

    // Nếu có rating thì cập nhật điểm trung bình
    if (rating) {
      const comments = await CommentModel.find({ entityType, entityId, rating: { $ne: null } });
      const avg = comments.reduce((sum, c) => sum + (c.rating ?? 0), 0) / comments.length;

      entity.rating = {
        average: avg,
        count: comments.length,
      };

      await entity.save();
    }

    return comment;
  };

  /**
   * Lấy danh sách bình luận theo entity
   */
  getCommentsByEntity = async (
    entityType: "PRODUCT" | "TOUR",
    entityId: string
  ): Promise<CommentDocument[]> => {
    return CommentModel.find({ entityType, entityId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .exec();
  };

  /**
   * Xóa bình luận
   */
  deleteComment = async (commentId: string): Promise<boolean> => {
    const comment = await CommentModel.findById(commentId);
    if (!comment) return false;

    await comment.deleteOne();
    return true;
  };
}
