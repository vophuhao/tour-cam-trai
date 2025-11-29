import mongoose from "mongoose";

// Review model - đánh giá campsite
export interface ReviewDocument extends mongoose.Document {
  // References
  campsite: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId; // người đánh giá
  host: mongoose.Types.ObjectId; // chủ campsite

  // Ratings (1-5 stars)
  ratings: {
    overall: number; // tổng quan
    cleanliness: number; // vệ sinh
    accuracy: number; // đúng mô tả
    location: number; // vị trí
    value: number; // giá trị
    communication: number; // giao tiếp với host
  };

  // Review Content
  title?: string;
  comment: string;
  pros?: string[]; // điểm tốt
  cons?: string[]; // điểm chưa tốt

  // Media
  images?: string[];

  // Host Response
  hostResponse?: {
    comment: string;
    respondedAt: Date;
  };

  // Status
  isPublished: boolean;
  isFeatured: boolean; // review nổi bật
  isVerified: boolean; // đã xác minh đặt chỗ

  // Helpful votes
  helpfulCount: number;
  notHelpfulCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  publish(): Promise<ReviewDocument>;
  unpublish(): Promise<ReviewDocument>;
  addHostResponse(response: string): Promise<ReviewDocument>;
  calculateOverallRating(): number;
}

const reviewSchema = new mongoose.Schema<ReviewDocument>(
  {
    campsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campsite",
      required: true,
      index: true,
    },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    ratings: {
      overall: { type: Number, required: true, min: 1, max: 5 },
      cleanliness: { type: Number, required: true, min: 1, max: 5 },
      accuracy: { type: Number, required: true, min: 1, max: 5 },
      location: { type: Number, required: true, min: 1, max: 5 },
      value: { type: Number, required: true, min: 1, max: 5 },
      communication: { type: Number, required: true, min: 1, max: 5 },
    },

    title: { type: String, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    pros: [{ type: String, maxlength: 200 }],
    cons: [{ type: String, maxlength: 200 }],

    images: [{ type: String }],

    hostResponse: {
      comment: { type: String, trim: true, maxlength: 1000 },
      respondedAt: { type: Date },
    },

    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isVerified: { type: Boolean, default: true }, // auto true nếu có booking

    helpfulCount: { type: Number, default: 0, min: 0 },
    notHelpfulCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ campsite: 1, isPublished: 1, createdAt: -1 });
reviewSchema.index({ guest: 1, createdAt: -1 });
reviewSchema.index({ "ratings.overall": -1, isPublished: 1 });
reviewSchema.index({ isFeatured: 1, isPublished: 1 });

// Methods
reviewSchema.methods.publish = async function (this: ReviewDocument) {
  this.isPublished = true;
  return this.save();
};

reviewSchema.methods.unpublish = async function (this: ReviewDocument) {
  this.isPublished = false;
  return this.save();
};

reviewSchema.methods.addHostResponse = async function (this: ReviewDocument, response: string) {
  this.hostResponse = {
    comment: response,
    respondedAt: new Date(),
  };
  return this.save();
};

reviewSchema.methods.calculateOverallRating = function (this: ReviewDocument): number {
  const { cleanliness, accuracy, location, value, communication } = this.ratings;
  return (cleanliness + accuracy + location + value + communication) / 5;
};

// Auto-calculate overall rating before save
reviewSchema.pre("save", function (next) {
  if (this.isModified("ratings")) {
    this.ratings.overall = this.calculateOverallRating();
  }
  next();
});

export const ReviewModel = mongoose.model<ReviewDocument>("Review", reviewSchema);
