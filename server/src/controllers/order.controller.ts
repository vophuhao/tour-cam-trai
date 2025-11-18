import { catchErrors } from "@/errors";
import OrderService from "@/services/order.service";
import { ResponseUtil } from "@/utils";

export default class OrderController {
  constructor(private readonly orderService: OrderService) {}

  getAllOrders = catchErrors(async (req, res) => {
    const orders = await this.orderService.getAllOrders();
    return ResponseUtil.success(res, orders, "Lấy danh sách đơn hàng thành công");
  });

  createOrder = catchErrors(async (req, res) => {
    const result = await this.orderService.createOrder(req.body, req.userId.toString());

    if (!result.success) {
      console.error("❌ Đặt hàng lỗi:", result.message);
      return ResponseUtil.error(res, result.code, result.message);
    }
    console.log("✅ Đặt hàng thành công:", result.order);
    console.log("result.message", result.message);
    return ResponseUtil.success(res, result.order, result.message);
  });

  payOSWebhook = catchErrors(async (req, res) => {
    const result = await this.orderService.handlePayOSWebhook(req.body);
    return res.status(200).json(result);
  });
}
