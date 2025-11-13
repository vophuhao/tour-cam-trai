import { Product } from "./product";

export interface CartItem {
  product: Pick<Product, "_id" | "name" | "price" | "deal" | "images">; 
  quantity: number;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartPayload {
  productId: string;
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
  totalQuantity: number;
  totalPrice?: number; // nếu muốn hiển thị giá
}
