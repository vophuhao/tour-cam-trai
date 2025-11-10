import CommentController from "@/controllers/comment.controller";
import { container, TOKENS } from "@/di";
import type { CommentService } from "@/services";
import { Router } from "express";

const commentRoutes = Router();

const commentService = container.resolve<CommentService>(TOKENS.CommentService);
const commentController = new CommentController(commentService);

// prefix: /comments
commentRoutes.post("/:entityType/:entityId", commentController.createCommentHandler);
commentRoutes.get("/:entityType/:entityId", commentController.getCommentsHandler);
commentRoutes.delete("/:id", commentController.deleteCommentHandler);

export default commentRoutes;
