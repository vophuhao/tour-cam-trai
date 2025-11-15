import mongoose from "mongoose";

export interface CartItem {
  product: mongoose.Types.ObjectId; // chỉ lưu productId
  quantity: number;

}

export interface CartDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new mongoose.Schema<CartItem>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema<CartDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // mỗi user chỉ có 1 cart
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const CartModel = mongoose.model<CartDocument>("Cart", cartSchema);
export default CartModel;