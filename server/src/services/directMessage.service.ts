import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { getIO } from "@/socket";
import UserModel from "@/models/user.model";
import { SupportMessage, SupportConversation } from "@/models/directMessage.model";

type SendMessagePayload = {
  message: string;
  messageType?: string;
  attachments?: Array<{ url?: string; type?: string }>;
  productRef?: string | null;
};

export default class SupportChatService {
  getOrCreateConversation = async (customerId: string) => {
    const customer = await UserModel.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    let conversation = await SupportConversation.findOne({
      customerId,
      status: "active",
    });

    if (!conversation) {
      conversation = await SupportConversation.create({
        conversationId: uuidv4(),
        customerId: new Types.ObjectId(customerId),
        customerName: (customer as any).full_name || (customer as any).username || "",
        customerAvatar: (customer as any).avatar || null,
      });
    }

    return conversation;
  };

  sendMessage = async (
    conversationId: string,
    senderId: string,
    senderModel: "User" | "Seller",
    messageData: SendMessagePayload
  ) => {
    const { message, messageType = "text", attachments = [], productRef = null } = messageData;

    const sender = await UserModel.findById(senderId);
    if (!sender) throw new Error("Sender not found");

    // create message
    const newMessage = await SupportMessage.create({
      conversationId,
      senderId: new Types.ObjectId(senderId),
      senderModel,
      senderName: (sender as any)?.full_name || (sender as any)?.username || "",
      senderAvatar: (sender as any)?.avatar || null,
      message,
      messageType,
      attachments,
      productRef: productRef ? new Types.ObjectId(productRef) : null,
    });

    // update conversation metadata
    const updateData: any = {
      lastMessage: message,
      lastMessageAt: new Date(),
    };

    if (senderModel === "User") {
      await SupportConversation.findOneAndUpdate(
        { conversationId },
        {
          ...updateData,
          $inc: { unreadCountSeller: 1 },
        }
      );
    } else {
      await SupportConversation.findOneAndUpdate(
        { conversationId },
        {
          ...updateData,
          $inc: { unreadCountCustomer: 1 },
          sellerId: new Types.ObjectId(senderId),
        }
      );
    }

    // populate product if present
    if (productRef) {
      await newMessage.populate("productRef", "name price images slug");
    }

    // emit socket events (best-effort)
    try {
      const io = getIO();
      const roomName = `support:${conversationId}`;

      const room = (io as any).sockets?.adapter?.rooms?.get(roomName) ?? null;
      const clientCount = room ? room.size : 0;

      const payload = newMessage.toObject ? newMessage.toObject() : newMessage;
      if (clientCount > 0) {
        io.to(roomName).emit("support_new_message", payload);
      }

      io.to("seller").emit("support_conversation_update", {
        conversationId,
        lastMessage: message,
        lastMessageAt: new Date(),
        senderModel,
      });
    } catch (err) {
      console.warn("[SupportChatService] emit error:", (err as Error).message);
    }

    return newMessage;
  };

  getMessages = async (conversationId: string, page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    const messages = await SupportMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("productRef", "name price images slug");

    const total = await SupportMessage.countDocuments({ conversationId });

    return {
      messages: messages.reverse(),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  };

  markAsRead = async (conversationId: string, userType: "customer" | "seller") => {
    const result = await SupportMessage.updateMany(
      {
        conversationId,
        senderModel: userType === "customer" ? "Seller" : "User",
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    const updateField = userType === "customer" ? { unreadCountCustomer: 0 } : { unreadCountSeller: 0 };
    await SupportConversation.findOneAndUpdate({ conversationId }, updateField);

    try {
      const io = getIO();
      io.to(`support:${conversationId}`).emit("support_messages_read", {
        conversationId,
        userType,
        readCount: result.modifiedCount,
      });
    } catch (err) {
      console.warn("[SupportChatService] emit read event error:", (err as Error).message);
    }

    return result;
  };

  getConversations = async (filters: { status?: string } = {}, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const query: any = { status: filters.status || "active" };

    const conversations = await SupportConversation.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customerId", "full_name avatar email")
      .populate("sellerId", "full_name avatar");

    const total = await SupportConversation.countDocuments(query);

    return {
      conversations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  };

  closeConversation = async (conversationId: string) => {
    const conversation = await SupportConversation.findOneAndUpdate(
      { conversationId },
      { status: "closed" },
      { new: true }
    );
    if (!conversation) throw new Error("Conversation not found");

    try {
      const io = getIO();
      io.to(`support:${conversationId}`).emit("support_conversation_closed", {
        conversationId,
        closedAt: new Date(),
      });
      io.to("seller").emit("support_conversation_update", {
        conversationId,
        status: "closed",
      });
    } catch (err) {
      console.warn("[SupportChatService] emit close event error:", (err as Error).message);
    }

    return conversation;
  };

  getStats = async () => {
    const active = await SupportConversation.countDocuments({ status: "active" });
    const closed = await SupportConversation.countDocuments({ status: "closed" });

    const totalUnreadResult = await SupportConversation.aggregate([
      { $match: { status: "active", unreadCountSeller: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$unreadCountSeller" } } },
    ]);

    const totalUnread = totalUnreadResult[0]?.total || 0;

    return {
      activeConversations: active,
      closedConversations: closed,
      totalUnread,
    };
  };
}
