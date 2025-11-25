
import mongoose from "mongoose";
import { Document } from "mongoose";
export interface PriceQDocument extends Document {

    fullname: string;
    phone: string;
    email: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    children: number;
    adults: number;
    babies: number;
    status : "pending" | "contacted" | "closed";

}

const priceQSchema = new mongoose.Schema<PriceQDocument>(
    {
        fullname: { type: String, required: true }, 
        phone: { type: String, required: true },
        email: { type: String, required: false },
        content: { type: String, required: false },
        children: { type: Number, required: true },
        adults: { type: Number, required: true },
    },
    { timestamps: true }
);
const PriceQModel = mongoose.model<PriceQDocument>("PriceQ", priceQSchema);
export default PriceQModel;