// ...existing code...
import SupportController from "@/controllers/directMessage.controller";
import { container } from "@/di";
import { TOKENS } from "@/di/tokens";
import SupportChatService from "@/services/directMessage.service";
import { Router } from "express";


const supportService = container.resolve<SupportChatService>(TOKENS.SupportChatService);
const supportController = new SupportController(supportService);


const supportRouter = Router();

supportRouter.post('/conversation/start', supportController.startSupportConversation);

// thêm các route message / messages / admin / close / stats
supportRouter.post('/conversation/:conversationId/message', supportController.sendSupportMessage);
supportRouter.get('/conversation/:conversationId/messages', supportController.getSupportMessages);
supportRouter.get('/admin/conversations', supportController.listSupportConversationsForAdmin);
supportRouter.put('/conversation/:conversationId/close', supportController.closeConversation);
supportRouter.get('/stats', supportController.getStats);

export default supportRouter;
// ...existing code...