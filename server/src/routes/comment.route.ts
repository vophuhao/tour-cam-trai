import express, { Router } from "express";
import {
  createCommentHandler,
  getCommentsHandler,
  deleteCommentHandler,
} from "@/controllers/comment.controller";

const commentRoutes = Router();

commentRoutes.post("/:entityType/:entityId", createCommentHandler);
commentRoutes.get("/:entityType/:entityId", getCommentsHandler);
commentRoutes.delete("/:id", deleteCommentHandler);

export default commentRoutes;
