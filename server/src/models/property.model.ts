import mongoose from "mongoose";

// Property Model - Tài sản/khu đất tổng thể của host
export interface PropertyDocument extends mongoose.Document {
  // Ownership
  host: mongoose.Types.ObjectId; // Reference to User (role: host)

  // Basic Info
  name: string;
  slug: string; // URL-friendly, unique
  tagline?: string;
  description: string;

  // Location (Property-level)
  location: {
    address: string;
    city: string;
    state: string; // tỉnh/thành
    country: string;
    zipCode?: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat] - property center
    };
    directions?: string; // Hướng dẫn đến property
    parkingInstructions?: string;
  };

  // Property Details
  landSize?: {
    value: number;
    unit: "acres" | "hectares" | "square_meters";
  };
  terrain?: string; // "forest", "beach", "mountain", "desert", "farm"
  propertyType: string; // "private_land", "farm", "ranch", "campground"

  // Property-wide Photos
  photos: Array<{
    url: string;
    caption?: string;
    isCover: boolean;
    order: number;
    uploadedAt?: Date;
  }>;

  // Shared Amenities (property-wide)
  sharedAmenities: {
    toilets?: {
      type: "none" | "portable" | "flush" | "vault" | "composting";
      count: number;
      isShared: boolean;
    };
    showers?: {
      type: "none" | "outdoor" | "indoor" | "hot" | "cold";
      count: number;
      isShared: boolean;
    };
    potableWater: boolean;
    waterSource?: "tap" | "well" | "stream" | "none";
    parkingType?: "drive_in" | "walk_in" | "nearby";
    parkingSpaces?: number;
    commonAreas?: string[]; // ["fire_pit_area", "picnic_area", "kitchen"]
    laundry: boolean;
    wifi: boolean;
    cellService?: "excellent" | "good" | "limited" | "none";
    electricityAvailable: boolean;
  };

  // Property-wide Activities
  activities: mongoose.Types.ObjectId[]; // References to Activity model
  nearbyAttractions?: Array<{
    name: string;
    distance: number; // km
    type: string; // "national_park", "lake", "town", "restaurant"
  }>;

  // Property Rules & Policies
  rules: Array<{
    text: string;
    category: "pets" | "noise" | "fire" | "general";
    order: number;
  }>;

  checkInInstructions?: string;
  checkOutInstructions?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    instructions?: string;
  };

  // Policies
  cancellationPolicy: {
    type: "flexible" | "moderate" | "strict";
    description?: string;
    refundRules: Array<{
      daysBeforeCheckIn: number;
      refundPercentage: number; // 0-100
    }>;
  };

  petPolicy: {
    allowed: boolean;
    maxPets?: number;
    fee?: number;
    rules?: string;
  };

  childrenPolicy: {
    allowed: boolean;
    ageRestrictions?: string;
  };

  // Stats (aggregated from sites)
  stats: {
    totalSites: number;
    activeSites: number;
    totalBookings: number;
    totalReviews: number;
    averageRating: number;
    ratings: {
      location: number;
      communication: number;
      value: number;
    };
    responseRate?: number; // 0-100
    responseTime?: number; // minutes
    viewCount: number;
  };

  // Rating (for compatibility with review aggregation)
  rating?: {
    average: number;
    count: number;
    breakdown: {
      location: number;
      communication: number;
      value: number;
    };
  };

  // Status
  status: "active" | "inactive" | "pending_approval" | "suspended";
  isActive: boolean;
  isFeatured: boolean;
  featuredUntil?: Date;
  isVerified: boolean;
  verifiedAt?: Date;

  // Settings
  settings: {
    instantBookEnabled: boolean; // Apply to all sites
    requireApproval: boolean;
    minimumAdvanceNotice: number; // hours
    bookingWindow: number; // days in advance
    allowWholePropertyBooking: boolean;
  };

  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastBookedAt?: Date;

  // Methods
  activate(): Promise<PropertyDocument>;
  deactivate(): Promise<PropertyDocument>;
  incrementViews(): Promise<PropertyDocument>;
  updateStats(): Promise<PropertyDocument>;
}

const propertySchema = new mongoose.Schema<PropertyDocument>(
  {
    // Ownership
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Basic Info
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },

    // Location
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
      country: { type: String, required: true, default: "Vietnam" },
      zipCode: { type: String },
      coordinates: {
        type: { type: String, enum: ["Point"], required: true, default: "Point" },
        coordinates: { type: [Number], required: true }, // [lng, lat]
      },
      directions: { type: String, maxlength: 1000 },
      parkingInstructions: { type: String, maxlength: 500 },
    },

    // Property Details
    landSize: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ["acres", "hectares", "square_meters"] },
    },
    terrain: { type: String, maxlength: 100 },
    propertyType: {
      type: String,
      required: true,
      index: true,
      enum: ["private_land", "farm", "ranch", "campground"],
    },

    // Photos
    photos: [
      {
        url: { type: String, required: true },
        caption: { type: String, maxlength: 200 },
        isCover: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Shared Amenities
    sharedAmenities: {
      toilets: {
        type: { type: String, enum: ["none", "portable", "flush", "vault", "composting"] },
        count: { type: Number, min: 0, default: 0 },
        isShared: { type: Boolean, default: true },
      },
      showers: {
        type: { type: String, enum: ["none", "outdoor", "indoor", "hot", "cold"] },
        count: { type: Number, min: 0, default: 0 },
        isShared: { type: Boolean, default: true },
      },
      potableWater: { type: Boolean, default: false },
      waterSource: { type: String, enum: ["tap", "well", "stream", "none"] },
      parkingType: { type: String, enum: ["drive_in", "walk_in", "nearby"] },
      parkingSpaces: { type: Number, min: 0 },
      commonAreas: [{ type: String }],
      laundry: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      cellService: { type: String, enum: ["excellent", "good", "limited", "none"] },
      electricityAvailable: { type: Boolean, default: false },
    },

    // Activities
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
    nearbyAttractions: [
      {
        name: { type: String, required: true },
        distance: { type: Number, required: true, min: 0 },
        type: { type: String, required: true },
      },
    ],

    // Rules
    rules: [
      {
        text: { type: String, required: true, maxlength: 500 },
        category: { type: String, enum: ["pets", "noise", "fire", "general"], default: "general" },
        order: { type: Number, default: 0 },
      },
    ],

    checkInInstructions: { type: String, maxlength: 2000 },
    checkOutInstructions: { type: String, maxlength: 2000 },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      instructions: { type: String, maxlength: 500 },
    },

    // Policies
    cancellationPolicy: {
      type: {
        type: String,
        enum: ["flexible", "moderate", "strict"],
        default: "moderate",
      },
      description: { type: String, maxlength: 1000 },
      refundRules: [
        {
          daysBeforeCheckIn: { type: Number, required: true, min: 0 },
          refundPercentage: { type: Number, required: true, min: 0, max: 100 },
        },
      ],
    },

    petPolicy: {
      allowed: { type: Boolean, default: false },
      maxPets: { type: Number, min: 0 },
      fee: { type: Number, min: 0 },
      rules: { type: String, maxlength: 500 },
    },

    childrenPolicy: {
      allowed: { type: Boolean, default: true },
      ageRestrictions: { type: String, maxlength: 200 },
    },

    // Stats
    stats: {
      totalSites: { type: Number, default: 0, min: 0 },
      activeSites: { type: Number, default: 0, min: 0 },
      totalBookings: { type: Number, default: 0, min: 0 },
      totalReviews: { type: Number, default: 0, min: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      ratings: {
        location: { type: Number, default: 0, min: 0, max: 5 },
        communication: { type: Number, default: 0, min: 0, max: 5 },
        value: { type: Number, default: 0, min: 0, max: 5 },
      },
      responseRate: { type: Number, min: 0, max: 100 },
      responseTime: { type: Number, min: 0 },
      viewCount: { type: Number, default: 0, min: 0 },
    },

    // Rating (for review aggregation compatibility)
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
      breakdown: {
        location: { type: Number, default: 0, min: 0, max: 5 },
        communication: { type: Number, default: 0, min: 0, max: 5 },
        value: { type: Number, default: 0, min: 0, max: 5 },
      },
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "pending_approval", "suspended"],
      default: "active",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    featuredUntil: { type: Date },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },

    // Settings
    settings: {
      instantBookEnabled: { type: Boolean, default: false },
      requireApproval: { type: Boolean, default: true },
      minimumAdvanceNotice: { type: Number, default: 24, min: 0 }, // hours
      bookingWindow: { type: Number, default: 365, min: 1 }, // days
      allowWholePropertyBooking: { type: Boolean, default: false },
    },

    // SEO
    seo: {
      metaTitle: { type: String, maxlength: 100 },
      metaDescription: { type: String, maxlength: 200 },
      keywords: [{ type: String }],
    },

    // Timestamps
    publishedAt: { type: Date },
    lastBookedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
propertySchema.index({ host: 1, isActive: 1 });
propertySchema.index({ "location.coordinates": "2dsphere" }); // Geospatial index
propertySchema.index({ propertyType: 1, isActive: 1 });
propertySchema.index({ isFeatured: 1, "stats.averageRating": -1 });
propertySchema.index({ createdAt: -1 });

// Text search index
propertySchema.index({
  name: "text",
  description: "text",
  tagline: "text",
  "location.city": "text",
  "location.state": "text",
});

// Methods
propertySchema.methods.activate = async function (this: PropertyDocument) {
  this.status = "active";
  this.isActive = true;
  return this.save();
};

propertySchema.methods.deactivate = async function (this: PropertyDocument) {
  this.status = "inactive";
  this.isActive = false;
  return this.save();
};

propertySchema.methods.incrementViews = async function (this: PropertyDocument) {
  this.stats.viewCount += 1;
  return this.save();
};

propertySchema.methods.updateStats = async function (this: PropertyDocument) {
  // This will be implemented to aggregate stats from sites
  // For now, just save
  return this.save();
};

export const PropertyModel = mongoose.model<PropertyDocument>("Property", propertySchema);
