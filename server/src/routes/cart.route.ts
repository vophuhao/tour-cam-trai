// src/routes/cart.routes.ts
import CartController from "@/controllers/cart.controller";
import { container, TOKENS } from "@/di";
import type CartService from "@/services/cart.service";
import { Router } from "express";

const cartRoutes = Router();

// Resolve dependencies via DI container
const cartService = container.resolve<CartService>(TOKENS.CartService);
const cartController = new CartController(cartService);

/* ==========================
 * 🛒 Cart Routes
 * ========================== */

// Lấy giỏ hàng
cartRoutes.get("/", cartController.getCart);

// Thêm vào giỏ hàng
cartRoutes.post("/add", cartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
cartRoutes.put("/update", cartController.updateCartItem);

// Xóa 1 sản phẩm khỏi giỏ hàng
cartRoutes.delete("/remove", cartController.removeItem);

// Xóa toàn bộ giỏ hàng
cartRoutes.delete("/clear", cartController.clearCart);

export default cartRoutes;