
import { Router } from "express";
import OrderController from "@/controllers/order.controller";
import { container, TOKENS } from "@/di";
import OrderService from "@/services/order.service";
import { authenticate } from "@/middleware";

const router = Router();
const orderService = container.resolve<OrderService>(TOKENS.OrderService);
const orderController = new OrderController(orderService);

router.post("/", authenticate,orderController.createOrder);

// Webhook PayOS
router.post("/payos/webhook", orderController.payOSWebhook);

export default router;
