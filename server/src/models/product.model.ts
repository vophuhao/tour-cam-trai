import mongoose from "mongoose";

// Interface cho document Product
export interface ProductDocument extends mongoose.Document {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  deal?:number,
  stock: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  decreaseStock(quantity: number): Promise<ProductDocument>;
  increaseStock(quantity: number): Promise<ProductDocument>;
}

const productSchema = new mongoose.Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
      index: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
      deal: {
      type: Number,
      required: false,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes để tối ưu tìm kiếm
productSchema.index({ name: "text", description: "text" });

// Methods
productSchema.methods.decreaseStock = async function (quantity: number) {
  if (this.stock < quantity) {
    throw new Error("Không đủ hàng trong kho");
  }
  this.stock -= quantity;
  return this.save();
};

productSchema.methods.increaseStock = async function (quantity: number) {
  this.stock += quantity;
  return this.save();
};

// Serialize virtual fields
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const ProductModel = mongoose.model<ProductDocument>("Product", productSchema);
export default ProductModel;
