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

router.get("/", authenticate, orderController.getOrdersByUser);

export default router;
