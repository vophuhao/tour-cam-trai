import mongoose, { Schema, Document } from "mongoose";

export interface OrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  totalPrice: number;
  quantity: number;
  image?: string;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  province: string;
  district?: string;
}

export interface OrderDocument extends Document {
  user: mongoose.Types.ObjectId;
  code?: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  paymentMethod: "cod" | "card";
  shippingMethod: "standard" | "express";
  itemsTotal: number;
  shippingFee: number;
  tax: number;
  discount?: number;
  grandTotal: number;
  promoCode?: string;
  hasRated: boolean;
  orderNote?: string;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "confirmed" | "shipping" | "delivered" |  "completed" | "cancelled" | "cancel_request";
  payOSOrderCode?: number;
  payOSCheckoutUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  history: [
      {
        status: String,
        date: Date,
        note?: String,
        images? : String[]
      },
    ],
}

const orderItemSchema = new Schema<OrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  name: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  image: { type: String },
});

const orderAddressSchema = new Schema<OrderAddress>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine: { type: String, required: true },
  province: { type: String, required: true },
  district: String,
});

const orderSchema = new Schema<OrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String},
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: orderAddressSchema, required: true },

    paymentMethod: {
      type: String,
      enum: ["cod", "card"],
      default: "cod",
    },

    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },

    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    promoCode: { type: String },
   
    orderNote: String,
    hasRated: { type: Boolean, default: false },

    payOSOrderCode: Number,
    payOSCheckoutUrl: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing" , "confirmed", "shipping", "delivered", "completed", "cancelled", "cancel_request"],
      default: "pending",
    },
    history: [
      {
        status: { type: String, required: true },
        date: { type: Date, required: true, default: Date.now },
        note: String,
        images : [String]
      },
    ],
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<OrderDocument>("Order", orderSchema);