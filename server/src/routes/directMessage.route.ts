import DirectMessageController from "@/controllers/directMessage.controller";
import { container } from "@/di";
import { TOKENS } from "@/di/tokens";
import DirectMessageService from "@/services/directMessage.service";
import { Router } from "express";
import { authenticate } from "@/middleware";

const messageService = container.resolve<DirectMessageService>(TOKENS.DirectMessageService);
const messageController = new DirectMessageController(messageService);

const messageRouter = Router();

// Tất cả routes yêu cầu authentication
messageRouter.use(authenticate);

// Conversations
messageRouter.post("/conversations", messageController.getOrCreateConversation);
messageRouter.get("/conversations", messageController.getUserConversations);
messageRouter.delete("/:conversationId", messageController.deleteConversation);
messageRouter.put("/:conversationId/archive", messageController.archiveConversation);

// Messages
messageRouter.post("/:conversationId", messageController.sendMessage);
messageRouter.get("/:conversationId", messageController.getMessages);
messageRouter.put("/:conversationId/read", messageController.markAsRead);

// Unread count
messageRouter.get("/unread-count", messageController.getUnreadCount);

export default messageRouter;