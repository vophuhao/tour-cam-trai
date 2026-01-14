import CartModel, { CartDocument } from "@/models/cart.model";
import ProductModel from "@/models/product.model";
import mongoose from "mongoose";

export type AddToCartInput = {
  userId: string;
  productId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  userId: string;
  productId: string;
  quantity: number;
};

export default class CartService {
  // ✅ Lấy giỏ hàng người dùng
 async getCart(userId: string): Promise<CartDocument | null> {
  return CartModel.findOne({ user: userId })
    .populate("items.product", "_id name price deal images") // chỉ lấy các trường này
    .exec();
}


  // ✅ Thêm sản phẩm vào giỏ hàng
  async addToCart(data: AddToCartInput): Promise<CartDocument> {
    const { userId, productId, quantity } = data;

    let cart = await CartModel.findOne({ user: userId });

    // ✅ Nếu chưa có cart, tạo mới
    if (!cart) {
      cart = await CartModel.create({
        user: userId,
        items: [],
      });
    }

    // ✅ Kiểm tra sản phẩm tồn tại
    const product = await ProductModel.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");

    // ✅ Kiểm tra item đã tồn tại trong giỏ chưa
    const existing = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        product: product._id as mongoose.Types.ObjectId,
        quantity,
      });
    }

    await cart.save();
    return cart.populate("items.product");
  }

  // ✅ Cập nhật số lượng item
  async updateCartItem(data: UpdateCartItemInput): Promise<CartDocument | null> {
    const { userId, productId, quantity } = data;

    const cart = await CartModel.findOne({ user: userId });
    if (!cart) return null;

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) return null;

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => i.product.toString() !== productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    return cart.populate("items.product");
  }

  // ✅ Xóa item ra khỏi giỏ
  async removeItem(userId: string, productId: string): Promise<CartDocument | null> {
    const cart = await CartModel.findOne({ user: userId });
    if (!cart) return null;

    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );

    await cart.save();
    return cart.populate("items.product");
  }

  // ✅ Xóa toàn bộ giỏ hàng
  async clearCart(userId: string): Promise<boolean> {
    const cart = await CartModel.findOne({ user: userId });
    if (!cart) return false;

    cart.items = [];
    await cart.save();
    return true;
  }
}