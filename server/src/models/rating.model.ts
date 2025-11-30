import mongoose from "mongoose";

export interface RatingDocument extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    rating: number;
    order: mongoose.Types.ObjectId;
    review?: string;
    files?: string[];
    adminReply?: {
        message: string;
        repliedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ratingSchema = new mongoose.Schema<RatingDocument>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        rating: { type: Number, required: true, min: 1, max: 5 },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        review: { type: String },
        files: [{ type: String }],

        // NEW: admin reply
        adminReply: {
            message: { type: String },
            repliedAt: { type: Date },
        },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Rating = mongoose.model<RatingDocument>("Rating", ratingSchema);
