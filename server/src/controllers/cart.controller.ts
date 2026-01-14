import { catchErrors } from "@/errors";
import { ResponseUtil } from "@/utils";
import type CartService from "@/services/cart.service";

export default class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * @route GET /cart
   */
  getCart = catchErrors(async (req, res) => {

    const result = await this.cartService.getCart(req.userId.toString());
    return ResponseUtil.success(res, result);
  });

  /**
   * @route POST /cart/add
   */
  addToCart = catchErrors(async (req, res) => {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    const result = await this.cartService.addToCart({
      userId: userId.toString(),
      productId,
      quantity,
    });

    return ResponseUtil.success(res, result, "Thêm vào giỏ hàng thành công");
  });

  /**
   * @route PUT /cart/update
   */
  updateCartItem = catchErrors(async (req, res) => {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    const result = await this.cartService.updateCartItem({
      userId : userId.toString(),
      productId,
      quantity,
    });

    return ResponseUtil.success(res, result, "Cập nhật giỏ hàng thành công");
  });

  /**
   * @route DELETE /cart/remove
   */
  removeItem = catchErrors(async (req, res) => {
    const userId = req.userId.toString();
    const { productId } = req.body;

    const result = await this.cartService.removeItem(userId, productId);
    return ResponseUtil.success(res, result, "Đã xóa sản phẩm khỏi giỏ hàng");
  });

  /**
   * @route DELETE /cart/clear
   */
  clearCart = catchErrors(async (req, res) => {
    const userId = req.userId.toString();
    await this.cartService.clearCart(userId);
    return ResponseUtil.success(res, { message: "Đã xóa toàn bộ giỏ hàng" });
  });
}