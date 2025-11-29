import mongoose from "mongoose";

// Campsite là địa điểm cắm trại/glamping (thay thế Tour)
export interface CampsiteDocument extends mongoose.Document {
  // Basic Info
  name: string;
  slug: string;
  tagline?: string; // slogan ngắn
  description: string;
  host: mongoose.Types.ObjectId; // ref User (role: host)

  // Location
  location: {
    address: string;
    city: string;
    state: string; // tỉnh/thành
    country: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat] - GeoJSON format
    };
    accessInstructions?: string; // hướng dẫn đường đi
  };

  // Property Details
  propertyType: "tent" | "rv" | "cabin" | "glamping" | "treehouse" | "yurt" | "other";
  capacity: {
    maxGuests: number;
    maxVehicles?: number;
    maxPets?: number;
  };

  // Pricing
  pricing: {
    basePrice: number; // giá cơ bản/đêm
    weekendPrice?: number; // giá cuối tuần
    cleaningFee?: number;
    petFee?: number;
    extraGuestFee?: number; // phí mỗi khách thêm
    currency: string;
  };

  // Amenities & Features (ref to Amenity model)
  amenities: mongoose.Types.ObjectId[];

  // Activities available
  activities: mongoose.Types.ObjectId[];

  // Rules
  rules: {
    checkIn: string; // e.g., "2:00 PM"
    checkOut: string; // e.g., "11:00 AM"
    minNights: number;
    maxNights?: number;
    allowPets: boolean;
    allowChildren: boolean;
    allowSmoking: boolean;
    quietHours?: string; // e.g., "10 PM - 7 AM"
    customRules?: string[];
  };

  // Media
  images: string[];
  videos?: string[];

  // Availability
  isActive: boolean;
  isInstantBook: boolean; // đặt ngay không cần duyệt

  // Stats
  rating?: {
    average: number;
    count: number;
  };
  viewsCount: number;
  bookingsCount: number;
  favoriteCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  activate(): Promise<CampsiteDocument>;
  deactivate(): Promise<CampsiteDocument>;
  incrementViews(): Promise<CampsiteDocument>;
}

const campsiteSchema = new mongoose.Schema<CampsiteDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
      country: { type: String, required: true, default: "Vietnam" },
      coordinates: {
        type: { type: String, enum: ["Point"], required: true, default: "Point" },
        coordinates: { type: [Number], required: true }, // [lng, lat]
      },
      accessInstructions: { type: String, maxlength: 1000 },
    },

    propertyType: {
      type: String,
      required: true,
      enum: ["tent", "rv", "cabin", "glamping", "treehouse", "yurt", "other"],
      index: true,
    },

    capacity: {
      maxGuests: { type: Number, required: true, min: 1 },
      maxVehicles: { type: Number, min: 0 },
      maxPets: { type: Number, min: 0, default: 0 },
    },

    pricing: {
      basePrice: { type: Number, required: true, min: 0 },
      weekendPrice: { type: Number, min: 0 },
      cleaningFee: { type: Number, min: 0, default: 0 },
      petFee: { type: Number, min: 0, default: 0 },
      extraGuestFee: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: "VND" },
    },

    amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Amenity" }],
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],

    rules: {
      checkIn: { type: String, required: true, default: "14:00" },
      checkOut: { type: String, required: true, default: "11:00" },
      minNights: { type: Number, required: true, default: 1, min: 1 },
      maxNights: { type: Number, min: 1 },
      allowPets: { type: Boolean, default: false },
      allowChildren: { type: Boolean, default: true },
      allowSmoking: { type: Boolean, default: false },
      quietHours: { type: String },
      customRules: [{ type: String }],
    },

    images: [{ type: String, required: true }],
    videos: [{ type: String }],

    isActive: { type: Boolean, default: true, index: true },
    isInstantBook: { type: Boolean, default: false },

    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },

    viewsCount: { type: Number, default: 0, min: 0 },
    bookingsCount: { type: Number, default: 0, min: 0 },
    favoriteCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and performance
campsiteSchema.index({ name: "text", description: "text", tagline: "text" });
campsiteSchema.index({ "location.city": 1, "location.state": 1 });
campsiteSchema.index({ "location.coordinates": "2dsphere" }); // Geospatial index for $geoNear
campsiteSchema.index({ propertyType: 1, isActive: 1 });
campsiteSchema.index({ "pricing.basePrice": 1 });
campsiteSchema.index({ "rating.average": -1 });
campsiteSchema.index({ createdAt: -1 });

// Methods
campsiteSchema.methods.activate = async function (this: CampsiteDocument) {
  this.isActive = true;
  return this.save();
};

campsiteSchema.methods.deactivate = async function (this: CampsiteDocument) {
  this.isActive = false;
  return this.save();
};

campsiteSchema.methods.incrementViews = async function (this: CampsiteDocument) {
  this.viewsCount += 1;
  return this.save();
};

export const CampsiteModel = mongoose.model<CampsiteDocument>("Campsite", campsiteSchema);
