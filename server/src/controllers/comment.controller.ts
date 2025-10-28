import type { Response } from "express";
import type { AuthenticatedRequest } from "@/types";
import catchErrors from "@/utils/catchErrors";
import { ResponseUtil } from "@/utils/response";
import CommentService from "@/services/comment.service";

/**
 * @route POST /comments/:entityType/:entityId
 * @desc Tạo bình luận cho TOUR hoặc PRODUCT
 */
export const createCommentHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { entityType, entityId } = req.params;
  const { content, rating } = req.body;

  const  userId  = req.userId ;
  if (!userId) return ResponseUtil.unauthorized(res, "Người dùng chưa đăng nhập");

  const comment = await CommentService.createComment({
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
export const getCommentsHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { entityType, entityId } = req.params;
  const comments = await CommentService.getCommentsByEntity(
    entityType?.toUpperCase() as "PRODUCT" | "TOUR",
    entityId!
  );
  return ResponseUtil.success(res, comments, "Lấy danh sách bình luận thành công");
});

/**
 * @route DELETE /comments/:id
 * @desc Xóa bình luận
 */
export const deleteCommentHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = await CommentService.deleteComment(id as string);
  if (!deleted) return ResponseUtil.notFound(res, "Không tìm thấy bình luận để xóa");
  return ResponseUtil.success(res, null, "Xóa bình luận thành công");
});
