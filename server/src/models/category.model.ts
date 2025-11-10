import mongoose from "mongoose";

// Interface cho document Category
export interface CategoryDocument extends mongoose.Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Virtual field: danh sách sản phẩm
  products?: mongoose.Types.ObjectId[];

  // Methods
  activate(): Promise<CategoryDocument>;
  deactivate(): Promise<CategoryDocument>;
}

const categorySchema = new mongoose.Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Methods
categorySchema.methods.activate = async function () {
  this.isActive = true;
  return this.save();
};

categorySchema.methods.deactivate = async function () {
  this.isActive = false;
  return this.save();
};

// Virtual populate cho products
categorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "category", // field category trong Product
  options: { sort: { createdAt: -1 } },
});

// Serialize virtual fields
categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

const CategoryModel = mongoose.model<CategoryDocument>("Category", categorySchema);
export default CategoryModel;
