import { ResponseUtil } from "@/utils";
import { catchErrors } from "@/errors";
import OrderService from "@/services/order.service";

export default class OrderController {
  constructor(private readonly orderService: OrderService) {}

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

    if (!result.success) {
      console.error("❌ Webhook lỗi:", result.message);
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  });
}
