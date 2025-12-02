
import { catchErrors } from "@/errors";
import OrderService from "@/services/order.service";
import { ResponseUtil } from "@/utils";

export default class OrderController {
  constructor(private readonly orderService: OrderService) { }

  getAllOrders = catchErrors(async (req, res) => {
    const orders = await this.orderService.getAllOrders();
    return ResponseUtil.success(res, orders, "Lấy danh sách đơn hàng thành công");
  });

  createOrder = catchErrors(async (req, res) => {
    const result = await this.orderService.createOrder(req.body, req.userId.toString());
    if (!result.success) {
      return ResponseUtil.success(res, result.order, "OUT_OF_STOCK");      
    }
    console.log("✅ Đặt hàng thành công:", result.order);
    return ResponseUtil.success(res, result.order, result.message);
  });

  payOSWebhook = catchErrors(async (req, res) => {
    const result = await this.orderService.handlePayOSWebhook(req.body);
    return res.status(200).json(result);
  });
  getOrdersByUser = catchErrors(async (req, res) => {
    const orders = await this.orderService.getOrdersByUser(req.userId.toString());
    return ResponseUtil.success(res, orders, "Lấy danh sách đơn hàng thành công");
  });
  updateStatusOrder = catchErrors(async (req, res) => {
    const { orderId } = req.params;
    const result = await this.orderService.updateStatusOrder(orderId?.toString() || "");

    return ResponseUtil.success(res, result.order, result.message);
  });
  getOrderById = catchErrors(async (req, res) => {
    const { orderId } = req.params;
    const order = await this.orderService.getOrderById(orderId?.toString() || "");
    return ResponseUtil.success(res, order, "Lấy chi tiết đơn hàng thành công");
  });
  cancelOrder = catchErrors(async (req, res) => {
    const { orderId } = req.params;
    const result = await this.orderService.cancelOrder(orderId?.toString() || "");
    return ResponseUtil.success(res, result.order, result.message);
  });
  updateOrderStatus = catchErrors(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const result = await this.orderService.updateOrderStatus(orderId?.toString() || "", status);
    return ResponseUtil.success(res, result.order, result.message);
  });
}