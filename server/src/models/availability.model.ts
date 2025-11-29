import mongoose from "mongoose";

// Availability model - Quản lý lịch trống/đã book của campsite
export interface AvailabilityDocument extends mongoose.Document {
  campsite: mongoose.Types.ObjectId;

  // Date range
  date: Date; // ngày cụ thể
  isAvailable: boolean; // có sẵn hay không

  // Pricing override
  price?: number; // giá custom cho ngày này (nếu khác basePrice)
  minNights?: number; // số đêm tối thiểu cho ngày này

  // Block types
  blockType?: "booked" | "blocked" | "maintenance" | "seasonal"; // loại block
  reason?: string; // lý do block

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new mongoose.Schema<AvailabilityDocument>(
  {
    campsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campsite",
      required: true,
      index: true,
    },

    date: { type: Date, required: true, index: true },
    isAvailable: { type: Boolean, default: true, index: true },

    price: { type: Number, min: 0 },
    minNights: { type: Number, min: 1 },

    blockType: {
      type: String,
      enum: ["booked", "blocked", "maintenance", "seasonal"],
    },
    reason: { type: String, trim: true, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

// Indexes
availabilitySchema.index({ campsite: 1, date: 1 }, { unique: true }); // mỗi campsite chỉ có 1 record cho 1 ngày
availabilitySchema.index({ campsite: 1, date: 1, isAvailable: 1 });

export const AvailabilityModel = mongoose.model<AvailabilityDocument>(
  "Availability",
  availabilitySchema
);

// Favorite model - Wishlist campsite của user
export interface FavoriteDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  campsite: mongoose.Types.ObjectId;
  notes?: string; // ghi chú cá nhân
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new mongoose.Schema<FavoriteDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    campsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campsite",
      required: true,
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

// Indexes
favoriteSchema.index({ user: 1, campsite: 1 }, { unique: true }); // mỗi user chỉ favorite 1 lần
favoriteSchema.index({ user: 1, createdAt: -1 }); // list favorites của user

export const FavoriteModel = mongoose.model<FavoriteDocument>("Favorite", favoriteSchema);
