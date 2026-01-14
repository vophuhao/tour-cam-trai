/* eslint-disable @typescript-eslint/no-explicit-any */
export type NotificationType =
  // Guest/Customer notifications
  | "order_confirmed"
  | "order_shipping"
  | "order_delivered"
  | "order_cancelled"
  | "order_return_request"
  | "booking_confirmed"
  | "booking_cancelled"
  | "review_reply"
  | "product_available"
  | "promotion"
  | "system"
  // Host notifications
  | "new_booking_request"
  | "booking_payment_received"
  | "guest_checked_in"
  | "guest_checked_out"
  | "guest_cancelled_booking"
  | "new_review_received"
  | "property_approved"
  | "property_rejected"
  | "payout_processed"
  | "booking_reminder"
  | "guest_message"
  | "property_performance";

export type NotificationActionType =
  | "view_order"
  | "view_booking"
  | "view_product"
  | "view_review"
  | "view_property"
  | "view_message"
  | "none";

export type NotificationPriority = "low" | "medium" | "high";

export type NotificationRole = "guest" | "host" | "admin" | "all";

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
    email: string;
  };
  type: NotificationType;
  title: string;
  message: string;

  // References
  order?: {
    _id: string;
    code: string;
    orderStatus: string;
  };
  booking?: {
    _id: string;
    code: string;
    status: string;
  };
  product?: {
    _id: string;
    name: string;
    images: string[];
  };
  review?: {
    _id: string;
    rating: number;
    comment: string;
  };
  property?: {
    _id: string;
    name: string;
    images: string[];
  };

  isRead: boolean;
  readAt?: string;
  link?: string;
  actionType: NotificationActionType;
  priority: NotificationPriority;
  role: NotificationRole;

  metadata?: {
    orderId?: string;
    orderCode?: string;
    bookingCode?: string;
    productName?: string;
    propertyName?: string;
    guestName?: string;
    amount?: number;
    rating?: number;
    [key: string]: any;
  };

  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
