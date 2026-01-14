
declare interface CartItem {
  product: Pick<Product, "_id" | "name" | "price" | "deal" | "images">; 
  quantity: number;
  finalPrice?: number; // giá sau giảm giá nếu có
}

declare interface AddToCartPayload {
  productId: string;
  quantity: number;
}

declare interface UpdateCartPayload {
  productId: string;
  quantity: number;
}

declare interface CartResponse {
  items: CartItem[];
  totalQuantity: number;
  totalPrice?: number; // nếu muốn hiển thị giá
}
