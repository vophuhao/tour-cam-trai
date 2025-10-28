import mongoose from "mongoose";

export interface CommentDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  entityType: "PRODUCT" | "TOUR";
  entityId: mongoose.Types.ObjectId;
  content: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema<CommentDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    entityType: { type: String, enum: ["PRODUCT", "TOUR"], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

commentSchema.index({ entityType: 1, entityId: 1 });

const CommentModel = mongoose.model<CommentDocument>("Comment", commentSchema);
export default CommentModel;
