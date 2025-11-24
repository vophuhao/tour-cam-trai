import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type MessageType = "text" | "image" | "product";
export type ConversationStatus = "active" | "closed";

export interface Attachment {
  url?: string;
  type?: string;
}

export interface ISupportMessage {
  conversationId: string;
  senderId: Types.ObjectId;
  senderModel: "User" | "Admin";
  senderName?: string;
  senderAvatar?: string;
  message: string;
  messageType?: MessageType;
  attachments?: Attachment[];
  productRef?: Types.ObjectId | null;
  isRead?: boolean;
  readAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISupportConversation {
  conversationId: string;
  customerId: Types.ObjectId;
  customerName?: string;
  customerAvatar?: string;
  sellerId?: Types.ObjectId | null;
  status?: ConversationStatus;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCountCustomer?: number;
  unreadCountSeller?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupportMessageDocument extends ISupportMessage, Document {}
export interface SupportConversationDocument extends ISupportConversation, Document {}

const AttachmentSchema = new Schema<Attachment>(
  {
    url: String,
    type: String,
  },
  { _id: false }
);

const SupportMessageSchema = new Schema<SupportMessageDocument>(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, required: true, refPath: "senderModel" },
    senderModel: { type: String, required: true, enum: ["User", "Seller"] },
    senderName: String,
    senderAvatar: String,
    message: { type: String, required: true, trim: true },
    messageType: { type: String, enum: ["text", "image", "product"], default: "text" },
    attachments: { type: [AttachmentSchema], default: [] },
    productRef: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const SupportConversationSchema = new Schema<SupportConversationDocument>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: String,
    customerAvatar: String,
    sellerId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    status: { type: String, enum: ["active", "closed"], default: "active", index: true },
    lastMessage: String,
    lastMessageAt: { type: Date, default: Date.now },
    unreadCountCustomer: { type: Number, default: 0 },
    unreadCountSeller: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
SupportMessageSchema.index({ conversationId: 1, createdAt: -1 });
SupportConversationSchema.index({ status: 1, lastMessageAt: -1 });

export const SupportMessage: Model<SupportMessageDocument> = mongoose.model<SupportMessageDocument>(
  "SupportMessage",
  SupportMessageSchema
);

export const SupportConversation: Model<SupportConversationDocument> = mongoose.model<SupportConversationDocument>(
  "SupportConversation",
  SupportConversationSchema
);
