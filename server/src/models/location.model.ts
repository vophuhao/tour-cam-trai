import mongoose from "mongoose";


// Interface cho document Location
export interface LocationDocument extends mongoose.Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Virtual field: danh sách sản phẩm
  products?: mongoose.Types.ObjectId[];

  // Methods
  activate(): Promise<LocationDocument>;
  deactivate(): Promise<LocationDocument>;
}

const locationSchema = new mongoose.Schema<LocationDocument>(
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
locationSchema.methods.activate = async function () {
  this.isActive = true;
  return this.save();
};

locationSchema.methods.deactivate = async function () {
  this.isActive = false;
  return this.save();
};

// Virtual populate cho products
locationSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "location", // field location trong Product
  options: { sort: { createdAt: -1 } },
});

// Serialize virtual fields
locationSchema.set("toJSON", { virtuals: true });
locationSchema.set("toObject", { virtuals: true });

const LocationModel = mongoose.model<LocationDocument>("Location", locationSchema);

export default LocationModel;
