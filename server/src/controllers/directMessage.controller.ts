import { catchErrors, ErrorFactory } from "@/errors";
import SupportChatService from "@/services/directMessage.service";
import { appAssert, ResponseUtil } from "@/utils";

export default class SupportController {
  constructor(private readonly supportService: SupportChatService) {}

  /**
   * POST /support/start
   * Tạo hoặc lấy conversation cho user hiện tại
   */
  startSupportConversation = catchErrors(async (req, res) => {
    const userId = req.userId;
    appAssert(userId, ErrorFactory.invalidCredentials("Người dùng chưa đăng nhập"));

    const conv = await this.supportService.getOrCreateConversation(userId!.toString());
    return ResponseUtil.success(res, conv, "Conversation started");
  });

  /**
   * POST /support/:conversationId/message
   * Gửi message vào support conversation
   */
  sendSupportMessage = catchErrors(async (req, res) => {
    const userId = req.userId;
    appAssert(userId, ErrorFactory.invalidCredentials("Người dùng chưa đăng nhập"));

    const { conversationId } = req.params;
    const { message, messageType, attachments, productRef } = req.body;
    

    const userRole = (req as any).user?.role;
    const senderModel = userRole === "seller" ? "Seller" : "User";

    const newMessage = await this.supportService.sendMessage(
      conversationId!,
      userId!.toString(),
      senderModel,
      { message, messageType, attachments, productRef }
    );

    return ResponseUtil.created(res, newMessage, "Message sent");
  });

  /**
   * GET /support/:conversationId/messages
   * Lấy messages (paginate) và đánh dấu đã đọc
   */
 getSupportMessages = catchErrors(async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query as any;

    const result = await this.supportService.getMessages(
      conversationId!,
      Number(page),
      Number(limit)
    );

    const userRole = (req as any).user?.role;
    const userType = userRole === "seller" ? "seller" : "customer";
    await this.supportService.markAsRead(conversationId!, userType);

    const pagination = buildPagination(Number(page), Number(limit), result.pagination?.total ?? 0);
    return ResponseUtil.paginated(res, result.messages ?? [], pagination);
  });

  /**
   * GET /support/admin/conversations
   * Seller: danh sách conversation được gán
   */
  listSupportConversationsForAdmin = catchErrors(async (req, res) => {
    // ...existing code...
    const { page = 1, limit = 50 } = req.query as any;
    const result = await this.supportService.getConversations(
      { status: "active" },
      Number(page),
      Number(limit)
    );

    const conversations = result.conversations ?? [];
    const transformed = (conversations as any[]).map((conv: any) => {
      const obj = conv.toObject ? conv.toObject() : conv;
      return {
        ...obj,
        customerName: obj.customerName || obj.customerId?.full_name || obj.customerId?.email || "Khách hàng",
        customerAvatar: obj.customerAvatar || obj.customerId?.avatar || null,
      };
    });

    const total = result.pagination?.total ?? result.conversations?.length ?? 0;
    const pagination = buildPagination(Number(page), Number(limit), total);

    return ResponseUtil.paginated(res, transformed, pagination);
  });
  /**
   * PUT /support/:conversationId/close
   */
  closeConversation = catchErrors(async (req, res) => {
    const { conversationId } = req.params;
    const userRole = (req as any).user?.role;
   

    const conversation = await this.supportService.closeConversation(conversationId!);
    return ResponseUtil.success(res, conversation, "Conversation closed");
  });

  /**
   * GET /support/stats
   */
  getStats = catchErrors(async (req, res) => {
    const userRole = (req as any).user?.role;
    

    const stats = await this.supportService.getStats();
    return ResponseUtil.success(res, stats, "Stats retrieved");
  });
}

export function buildPagination(page: number, limit: number, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}