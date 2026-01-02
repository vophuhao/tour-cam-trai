import OrderController from "@/controllers/order.controller";
import { container, TOKENS } from "@/di";
import { authenticate, requireAdmin } from "@/middleware";
import OrderService from "@/services/order.service";
import { Router } from "express";

const router = Router();
const orderService = container.resolve<OrderService>(TOKENS.OrderService);
const orderController = new OrderController(orderService);

router.get("/", requireAdmin, orderController.getAllOrders);
router.post("/", authenticate, orderController.createOrder);

// Webhook PayOS
router.post("/payos/webhook", orderController.payOSWebhook);

router.get("/user", authenticate, orderController.getOrdersByUser);

router.patch("/:orderId/status", requireAdmin, orderController.updateStatusOrder);

router.get("/:orderId", authenticate, orderController.getOrderById);

router.post("/:orderId/cancel", authenticate, orderController.cancelOrder);

router.post("/:orderId/update-status", orderController.updateOrderStatus);

router.post("/:orderId/return-request", authenticate, orderController.submitReturnRequest);

router.post("/:orderId/approve-refund", requireAdmin, orderController.approveRefundRequest);

router.post("/:orderId/reject-refund", requireAdmin, orderController.rejectRefundRequest);

router.post("/:orderId/admin-cancel", requireAdmin, orderController.adminCancelOrder);

export default router;
