import mongoose from "mongoose";

// Amenity model - Tiện nghi campsite
export interface AmenityDocument extends mongoose.Document {
  name: string;
  description?: string;
  icon?: string; // tên icon hoặc URL
  category: "basic" | "comfort" | "safety" | "outdoor" | "special";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const amenitySchema = new mongoose.Schema<AmenityDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 500 },
    icon: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["basic", "comfort", "safety", "outdoor", "special"],
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Index for filtering
amenitySchema.index({ category: 1, isActive: 1 });

export const AmenityModel = mongoose.model<AmenityDocument>("Amenity", amenitySchema);

// Activity model - Hoạt động có thể làm tại campsite
export interface ActivityDocument extends mongoose.Document {
  name: string;
  description?: string;
  icon?: string;
  category: "water" | "hiking" | "wildlife" | "winter" | "adventure" | "relaxation" | "other";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new mongoose.Schema<ActivityDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 500 },
    icon: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["water", "hiking", "wildlife", "winter", "adventure", "relaxation", "other"],
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Index for filtering
activitySchema.index({ category: 1, isActive: 1 });

export const ActivityModel = mongoose.model<ActivityDocument>("Activity", activitySchema);
