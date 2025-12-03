import mongoose from "mongoose";

export interface HostDocument extends mongoose.Document {
  name: string;
  user ?: mongoose.Types.ObjectId;
  gmail : string;
  phone ?: string;
  status : "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}
const hostSchema = new mongoose.Schema<HostDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    phone: { type: String, trim: true, maxlength: 20 },
    gmail: { type: String, required: true, trim: true, maxlength: 255 },
    status: { type: String, enum: ["pending", "approved", "rejected"], required: true ,default:"pending"},
  },
  { timestamps: true }
);

const HostModel = mongoose.model<HostDocument>("Host", hostSchema);
export default HostModel;