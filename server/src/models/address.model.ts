import mongoose from "mongoose";

export interface Address {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
  isDefault?: boolean;
}

export interface UserAddressDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  addresses: Address[];

  addAddress(address: Address): Promise<UserAddressDocument>;
  removeAddress(index: number): Promise<UserAddressDocument>;
  setDefault(index: number): Promise<UserAddressDocument>;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new mongoose.Schema<Address>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String },
   
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userAddressSchema = new mongoose.Schema<UserAddressDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    addresses: {
      type: [addressSchema],
      default: [],
      validate: [(val: Address[]) => val.length <= 3, "{PATH} exceeds the limit of 3"],
    },
  },
  { timestamps: true }
);

// Methods
userAddressSchema.methods.addAddress = async function (address: Address) {
  if (this.addresses.length >= 3) throw new Error("Không thể thêm quá 3 địa chỉ");
  this.addresses.push(address);
  return this.save();
};

userAddressSchema.methods.removeAddress = async function (index: number) {
  if (index < 0 || index >= this.addresses.length) throw new Error("Index không hợp lệ");
  this.addresses.splice(index, 1);
  return this.save();
};

userAddressSchema.methods.setDefault = async function (index: number) {
  if (index < 0 || index >= this.addresses.length) throw new Error("Index không hợp lệ");
  this.addresses.forEach((addr : any, i : any) => (addr.isDefault = i === index));
  return this.save();
};

// Index
userAddressSchema.index({ user: 1 });

// JSON / Object options
userAddressSchema.set("toJSON", { virtuals: true });
userAddressSchema.set("toObject", { virtuals: true });

const UserAddressModel = mongoose.model<UserAddressDocument>("Address", userAddressSchema);

export default UserAddressModel;
