import mongoose, { Document } from "mongoose";

export interface Member {
    fullname: string;
    age: number;
    type: "adult" | "child" | "baby";
}

export interface CustomerInfo {
    representative: {
        fullname: string;
        phone: string;
        age?: number;
        type?: "adult" | "child" | "baby";
        email?: string;
        notes?: string;
    };
    members: Member[]; // danh sách thành viên đi cùng
    paymentStatus: "pending" | "paid" | "failed";
    totalAdults: number;
    totalChildren: number;
    totalBabies: number;
    totalPeople: number;
}

export interface TourBDocument  extends Document {
    code : string
    tour : mongoose.Types.ObjectId;
    dateFrom : Date;
    dateTo :Date;
    availableSeats : number;
    totalSeats ?: number;
    note ?: string;
    customers : CustomerInfo[];
    status : "pending" | "completed" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}
const memberSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        age: { type: Number, required: true },
        type: { type: String, enum: ["adult", "child", "baby"], required: true },
    },
    { _id: false }
);

const representativeSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        phone: { type: String, required: true },
        age: { type: Number }, // optional
        type: { type: String, enum: ["adult", "child", "baby"], default: "adult" }, // optional, default adult
        email: { type: String },
        notes: { type: String },
    },
    { _id: false }
);

const customerInfoSchema = new mongoose.Schema(
    {
        representative: { type: representativeSchema, required: true },

        members: { type: [memberSchema], default: [] },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        },

        totalAdults: { type: Number, required: true, min: 0 },
        totalChildren: { type: Number, required: true, min: 0 },
        totalBabies: { type: Number, required: true, min: 0 },
        totalPeople: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const tourBSchema = new mongoose.Schema(
    {
        tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
        code: { type: String, required: true, unique: true },

        customers: { type: [customerInfoSchema], default: [] },

        status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },

        dateFrom: { type: Date, required: true },
        dateTo: { type: Date, required: true },

        availableSeats: { type: Number, required: true },
        totalSeats: { type: Number, required: true },
        note: { type: String },

    },
    { timestamps: true }
);

const TourBModel = mongoose.model<TourBDocument>("TourB", tourBSchema);
export default TourBModel;