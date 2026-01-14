import { catchErrors } from "@/errors";
import NotificationService from "@/services/notification.service";
import { ResponseUtil } from "@/utils";

export default class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Lấy tất cả notifications của user
  getNotifications = catchErrors(async (req, res) => {
    const userId = req.userId.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === "true";

    const result = await this.notificationService.getNotificationsByUser(
      userId,
      page,
      limit,
      unreadOnly
    );

    return ResponseUtil.success(res, result, "Lấy danh sách thông báo thành công");
  });

  // Lấy số lượng notifications chưa đọc
  getUnreadCount = catchErrors(async (req, res) => {
    const userId = req.userId.toString();
    const result = await this.notificationService.getUnreadCount(userId);

    return ResponseUtil.success(res, result, "Lấy số lượng thông báo chưa đọc thành công");
  });

  // Đánh dấu notification đã đọc
  markAsRead = catchErrors(async (req, res) => {
    const userId = req.userId.toString();
    const { notificationId } = req.params;

    const notification = await this.notificationService.markAsRead(
      notificationId!,
      userId
    );

    return ResponseUtil.success(res, notification, "Đã đánh dấu thông báo là đã đọc");
  });

  // Đánh dấu tất cả notifications đã đọc
  markAllAsRead = catchErrors(async (req, res) => {
    const userId = req.userId.toString();
    const result = await this.notificationService.markAllAsRead(userId);

    return ResponseUtil.success(res, result, "Đã đánh dấu tất cả thông báo là đã đọc");
  });

  // Xóa notification
  deleteNotification = catchErrors(async (req, res) => {
    const userId = req.userId.toString();
    const { notificationId } = req.params;

    const result = await this.notificationService.deleteNotification(
      notificationId!,
      userId
    );

    return ResponseUtil.success(res, result, "Đã xóa thông báo thành công");
  });

  // Xóa tất cả notifications
  deleteAllNotifications = catchErrors(async (req, res) => {
    const userId = req.userId.toString();
    const result = await this.notificationService.deleteAllNotifications(userId);

    return ResponseUtil.success(res, result, "Đã xóa tất cả thông báo thành công");
  });

  // Tạo notification mới (Admin only hoặc system)
  createNotification = catchErrors(async (req, res) => {
    const notification = await this.notificationService.createNotification(req.body);

    return ResponseUtil.success(res, notification, "Tạo thông báo thành công");
  });
}
