import { catchErrors, ErrorFactory } from "@/errors";
import CommentService from "@/services/comment.service";
import { appAssert, ResponseUtil } from "@/utils";

export default class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * @route POST /comments/:entityType/:entityId
   * @desc Tạo bình luận cho TOUR hoặc PRODUCT
   */
  createCommentHandler = catchErrors(async (req, res) => {
    const { entityType, entityId } = req.params;
    const { content, rating } = req.body;

    const userId = req.userId;
    //if (!userId) return ResponseUtil.unauthorized(res, "Người dùng chưa đăng nhập");
    appAssert(userId, ErrorFactory.invalidCredentials("Người dùng chưa đăng nhập"));

    const comment = await this.commentService.createComment({
      userId: userId!.toString(),
      entityType: entityType?.toUpperCase() as "PRODUCT" | "TOUR",
      entityId: entityId!,
      content,
      rating,
    });

    return ResponseUtil.success(res, comment, "Thêm bình luận thành công");
  });

  /**
   * @route GET /comments/:entityType/:entityId
   * @desc Lấy danh sách bình luận của TOUR hoặc PRODUCT
   */
  getCommentsHandler = catchErrors(async (req, res) => {
    const { entityType, entityId } = req.params;
    const comments = await this.commentService.getCommentsByEntity(
      entityType?.toUpperCase() as "PRODUCT" | "TOUR",
      entityId!
    );
    return ResponseUtil.success(res, comments, "Lấy danh sách bình luận thành công");
  });

  /**
   * @route DELETE /comments/:id
   * @desc Xóa bình luận
   */
  deleteCommentHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const deleted = await this.commentService.deleteComment(id as string);
    //if (!deleted) return ResponseUtil.notFound(res, "Không tìm thấy bình luận để xóa");
    appAssert(deleted, ErrorFactory.resourceNotFound("Không tìm thấy bình luận để xóa"));
    return ResponseUtil.success(res, null, "Xóa bình luận thành công");
  });
}
