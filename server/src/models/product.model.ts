import mongoose from "mongoose";

// ====== Interface phụ ======

// Biến thể (size)
interface ProductVariant {
  size: string;
  expandedSize: string;
  foldedSize: string;
  loadCapacity: string;
  weight: string;
}

// Đặc tính chung
interface ProductSpecification {
  label: string;
  value: string;
}

// Chi tiết sản phẩm con (ví dụ: "Khung: Hợp kim nhôm")
interface ProductDetailItem {
  label: string; // tên chi tiết
}

// Nhóm chi tiết (ví dụ: "Thông số kỹ thuật")
interface ProductDetailSection {
  title: string; // tiêu đề nhóm
  items: ProductDetailItem[]; // danh sách chi tiết con
}

// ====== Interface chính ======
export interface ProductDocument extends mongoose.Document {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  deal?: number;
  stock: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  details: ProductDetailSection[]; // ✅ Thêm phần chi tiết dạng phân cấp
  guide: string[]; // ✅ Hướng dẫn sử dụng từng bước
  warnings: string[]; // ✅ Lưu ý từng bước
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  rating ?: {
    average: number;
    count: number;
  };
  count: number;

  decreaseStock(quantity: number): Promise<ProductDocument>;
  increaseStock(quantity: number): Promise<ProductDocument>;
}

// ====== Schema phụ ======
const variantSchema = new mongoose.Schema<ProductVariant>(
  {
    size: { type: String, required: true },
    expandedSize: { type: String },
    foldedSize: { type: String },
    loadCapacity: { type: String },
    weight: { type: String },
  },
  { _id: false }
);

const specificationSchema = new mongoose.Schema<ProductSpecification>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const detailItemSchema = new mongoose.Schema<ProductDetailItem>(
  {
    label: { type: String, required: true },
  },
  { _id: false }
);

const detailSectionSchema = new mongoose.Schema<ProductDetailSection>(
  {
    title: { type: String, required: true }, // tiêu đề nhóm
    items: [detailItemSchema], // danh sách các dòng chi tiết con
  },
  { _id: false }
);

// ====== Schema chính ======
const productSchema = new mongoose.Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255, index: true },
    slug: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    deal: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [{ type: String, trim: true }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    specifications: [specificationSchema],
    variants: [variantSchema],
    details: [detailSectionSchema], // ✅ Thêm phần chi tiết
    guide: [{ type: String, trim: true }],
    warnings: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ====== Index và methods ======
productSchema.index({ name: "text", description: "text" });

productSchema.methods.decreaseStock = async function (quantity: number) {
  if (this.stock < quantity) throw new Error("Không đủ hàng trong kho");
  this.stock -= quantity;
  return this.save();
};

productSchema.methods.increaseStock = async function (quantity: number) {
  this.stock += quantity;
  return this.save();
};

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const ProductModel = mongoose.model<ProductDocument>("Product", productSchema);
export default ProductModel;
