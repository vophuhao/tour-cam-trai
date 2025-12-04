import mongoose from "mongoose";

// Site Model - Vị trí cắm trại cụ thể trong property (new Campsite)
export interface SiteDocument extends mongoose.Document {
  // Reference to Property (CRITICAL!)
  property: mongoose.Types.ObjectId; // Reference to Property

  // Site Identification
  name: string; // "Riverside Tent Site", "RV Spot #3"
  slug: string; // property-slug + site-slug
  description?: string;

  // Site Type
  siteType: "designated" | "undesignated";
  // designated = guests chọn site cụ thể khi book
  // undesignated = guests chọn bất kỳ site nào trong group khi arrive

  // Accommodation Type
  accommodationType:
    | "tent"
    | "rv"
    | "cabin"
    | "yurt"
    | "treehouse"
    | "tiny_home"
    | "safari_tent"
    | "bell_tent"
    | "glamping_pod"
    | "dome"
    | "airstream"
    | "vintage_trailer"
    | "van";

  lodgingProvided: "bring_your_own" | "structure_provided" | "vehicle_provided";

  // Site-specific Location
  siteLocation?: {
    coordinates?: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat] - specific site location
    };
    mapPinLabel?: string; // "Site A", "1"
    relativeDescription?: string; // "Near the river", "In the meadow"
  };

  // Capacity
  capacity: {
    maxGuests: number;
    maxAdults?: number;
    maxChildren?: number;
    maxInfants?: number;
    maxPets?: number;
    maxVehicles?: number;
    maxTents?: number;
    maxRVs?: number;
    rvMaxLength?: number; // feet
  };

  // Site Dimensions
  dimensions?: {
    length?: number; // feet
    width?: number;
    area?: number; // square feet
    isPaved: boolean;
    isLevel: boolean;
    shade: "full" | "partial" | "none";
  };

  // Pricing (per-site)
  pricing: {
    basePrice: number; // Per night
    weekendPrice?: number;
    weeklyDiscount?: number; // percentage
    monthlyDiscount?: number;
    additionalGuestFee?: number; // Per guest over base
    petFee?: number;
    vehicleFee?: number;
    cleaningFee?: number;
    depositAmount?: number;
    currency: string;

    // Seasonal pricing
    seasonalPricing?: Array<{
      name: string; // "Summer", "Winter"
      startDate: Date;
      endDate: Date;
      price: number;
    }>;
  };

  // Booking Settings
  bookingSettings: {
    minimumNights: number;
    maximumNights?: number;
    checkInTime: string; // "14:00"
    checkOutTime: string; // "11:00"
    instantBook: boolean;
    advanceNotice: number; // hours
    preparationTime?: number; // days between bookings
    allowSameDayBooking: boolean;
  };

  // Site-specific Photos
  photos: Array<{
    url: string;
    caption?: string;
    isCover: boolean;
    order: number;
    uploadedAt?: Date;
  }>;

  // Site-specific Amenities
  amenities: {
    // Electrical
    electrical?: {
      available: boolean;
      amperage?: number; // 15, 30, 50
      outlets?: number;
    };

    // Water
    water?: {
      hookup: boolean;
      nearby: boolean;
      distance?: number; // feet if nearby
    };

    // Sewer
    sewer?: {
      hookup: boolean;
      dumpStation: boolean;
      distance?: number;
    };

    // Fire
    firePit: boolean;
    fireRing: boolean;
    firewood?: "provided" | "available_for_purchase" | "bring_your_own" | "not_allowed";

    // Furniture
    furniture?: string[]; // ["picnic_table", "chairs", "hammock", "grill"]

    // Shelter
    shelter?: {
      type: "none" | "tent_pad" | "platform" | "covered_area";
      size?: string;
    };

    // Bedding (for structures)
    bedding?: {
      provided: boolean;
      bedType?: "king" | "queen" | "twin" | "bunk";
      bedCount?: number;
    };

    // Kitchen (for cabins/structures)
    kitchen?: {
      available: boolean;
      appliances?: string[]; // ["stove", "refrigerator", "microwave"]
      cookware: boolean;
      dishes: boolean;
    };

    // Private Bathroom
    privateBathroom?: {
      available: boolean;
      indoor: boolean;
      toilet: boolean;
      shower: boolean;
      hotWater: boolean;
    };

    // Climate Control
    climateControl?: {
      heating: boolean;
      airConditioning: boolean;
      fan: boolean;
    };

    // Connectivity
    wifi: boolean;
    tv: boolean;

    // Accessibility
    accessible: boolean;
    wheelchairAccessible: boolean;

    // Other
    other?: string[];
  };

  // What's included (glamping)
  included?: string[]; // ["towels", "linens", "toiletries", "coffee"]

  // What to bring
  guestsShouldBring?: string[]; // ["sleeping_bag", "tent", "cooking_equipment"]

  // Site-specific Rules
  siteSpecificRules?: string[];

  // Accessibility
  accessibility?: {
    wheelchairAccessible: boolean;
    mobilityAidAccessible: boolean;
    serviceAnimalsAllowed: boolean;
    accessibilityNotes?: string;
  };

  // Stats
  stats: {
    totalBookings: number;
    totalReviews: number;
    averageRating: number;
    ratings: {
      cleanliness: number;
      accuracy: number;
    };
    occupancyRate?: number;
    viewCount: number;
  };

  // Rating (for review aggregation compatibility)
  rating?: {
    average: number;
    count: number;
    breakdown: {
      cleanliness: number;
      accuracy: number;
      amenities: number;
    };
  };

  // Status
  status: "active" | "inactive" | "maintenance" | "suspended";
  isActive: boolean;
  isAvailableForBooking: boolean;
  unavailableReason?: string;

  // Grouped Sites (for undesignated)
  groupedSiteInfo?: {
    isGrouped: boolean;
    groupId?: mongoose.Types.ObjectId; // ID of listing umbrella
    totalSitesInGroup?: number;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastBookedAt?: Date;

  // Methods
  activate(): Promise<SiteDocument>;
  deactivate(): Promise<SiteDocument>;
  incrementViews(): Promise<SiteDocument>;
  updateStats(): Promise<SiteDocument>;
}

const siteSchema = new mongoose.Schema<SiteDocument>(
  {
    // Reference to Property
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    // Site Identification
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, index: true },
    description: { type: String, maxlength: 2000 },

    // Site Type
    siteType: {
      type: String,
      enum: ["designated", "undesignated"],
      required: true,
      default: "designated",
      index: true,
    },

    // Accommodation Type
    accommodationType: {
      type: String,
      required: true,
      enum: [
        "tent",
        "rv",
        "cabin",
        "yurt",
        "treehouse",
        "tiny_home",
        "safari_tent",
        "bell_tent",
        "glamping_pod",
        "dome",
        "airstream",
        "vintage_trailer",
        "van",
      ],
      index: true,
    },

    lodgingProvided: {
      type: String,
      enum: ["bring_your_own", "structure_provided", "vehicle_provided"],
      required: true,
    },

    // Site Location
    siteLocation: {
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number] }, // [lng, lat]
      },
      mapPinLabel: { type: String, maxlength: 50 },
      relativeDescription: { type: String, maxlength: 200 },
    },

    // Capacity
    capacity: {
      maxGuests: { type: Number, required: true, min: 1 },
      maxAdults: { type: Number, min: 0 },
      maxChildren: { type: Number, min: 0 },
      maxInfants: { type: Number, min: 0 },
      maxPets: { type: Number, min: 0, default: 0 },
      maxVehicles: { type: Number, min: 0 },
      maxTents: { type: Number, min: 0 },
      maxRVs: { type: Number, min: 0 },
      rvMaxLength: { type: Number, min: 0 }, // feet
    },

    // Dimensions
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      area: { type: Number, min: 0 },
      isPaved: { type: Boolean, default: false },
      isLevel: { type: Boolean, default: true },
      shade: { type: String, enum: ["full", "partial", "none"], default: "partial" },
    },

    // Pricing
    pricing: {
      basePrice: { type: Number, required: true, min: 0, index: true },
      weekendPrice: { type: Number, min: 0 },
      weeklyDiscount: { type: Number, min: 0, max: 100 }, // percentage
      monthlyDiscount: { type: Number, min: 0, max: 100 },
      additionalGuestFee: { type: Number, min: 0, default: 0 },
      petFee: { type: Number, min: 0, default: 0 },
      vehicleFee: { type: Number, min: 0, default: 0 },
      cleaningFee: { type: Number, min: 0, default: 0 },
      depositAmount: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: "VND" },

      seasonalPricing: [
        {
          name: { type: String, required: true },
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
          price: { type: Number, required: true, min: 0 },
        },
      ],
    },

    // Booking Settings
    bookingSettings: {
      minimumNights: { type: Number, required: true, default: 1, min: 1 },
      maximumNights: { type: Number, min: 1 },
      checkInTime: { type: String, required: true, default: "14:00" },
      checkOutTime: { type: String, required: true, default: "11:00" },
      instantBook: { type: Boolean, default: false },
      advanceNotice: { type: Number, default: 24, min: 0 }, // hours
      preparationTime: { type: Number, min: 0, default: 0 }, // days
      allowSameDayBooking: { type: Boolean, default: false },
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

    // Site Amenities
    amenities: {
      electrical: {
        available: { type: Boolean, default: false },
        amperage: { type: Number, min: 0 },
        outlets: { type: Number, min: 0 },
      },
      water: {
        hookup: { type: Boolean, default: false },
        nearby: { type: Boolean, default: false },
        distance: { type: Number, min: 0 },
      },
      sewer: {
        hookup: { type: Boolean, default: false },
        dumpStation: { type: Boolean, default: false },
        distance: { type: Number, min: 0 },
      },
      firePit: { type: Boolean, default: false },
      fireRing: { type: Boolean, default: false },
      firewood: {
        type: String,
        enum: ["provided", "available_for_purchase", "bring_your_own", "not_allowed"],
      },
      furniture: [{ type: String }],
      shelter: {
        type: { type: String, enum: ["none", "tent_pad", "platform", "covered_area"] },
        size: { type: String },
      },
      bedding: {
        provided: { type: Boolean, default: false },
        bedType: { type: String, enum: ["king", "queen", "twin", "bunk"] },
        bedCount: { type: Number, min: 0 },
      },
      kitchen: {
        available: { type: Boolean, default: false },
        appliances: [{ type: String }],
        cookware: { type: Boolean, default: false },
        dishes: { type: Boolean, default: false },
      },
      privateBathroom: {
        available: { type: Boolean, default: false },
        indoor: { type: Boolean, default: false },
        toilet: { type: Boolean, default: false },
        shower: { type: Boolean, default: false },
        hotWater: { type: Boolean, default: false },
      },
      climateControl: {
        heating: { type: Boolean, default: false },
        airConditioning: { type: Boolean, default: false },
        fan: { type: Boolean, default: false },
      },
      wifi: { type: Boolean, default: false },
      tv: { type: Boolean, default: false },
      accessible: { type: Boolean, default: false },
      wheelchairAccessible: { type: Boolean, default: false },
      other: [{ type: String }],
    },

    // What's included
    included: [{ type: String }],

    // What to bring
    guestsShouldBring: [{ type: String }],

    // Site-specific Rules
    siteSpecificRules: [{ type: String, maxlength: 500 }],

    // Accessibility
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      mobilityAidAccessible: { type: Boolean, default: false },
      serviceAnimalsAllowed: { type: Boolean, default: true },
      accessibilityNotes: { type: String, maxlength: 500 },
    },

    // Stats
    stats: {
      totalBookings: { type: Number, default: 0, min: 0 },
      totalReviews: { type: Number, default: 0, min: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      ratings: {
        cleanliness: { type: Number, default: 0, min: 0, max: 5 },
        accuracy: { type: Number, default: 0, min: 0, max: 5 },
      },
      occupancyRate: { type: Number, min: 0, max: 100 },
      viewCount: { type: Number, default: 0, min: 0 },
    },

    // Rating (for review aggregation compatibility)
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
      breakdown: {
        cleanliness: { type: Number, default: 0, min: 0, max: 5 },
        accuracy: { type: Number, default: 0, min: 0, max: 5 },
        amenities: { type: Number, default: 0, min: 0, max: 5 },
      },
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance", "suspended"],
      default: "active",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isAvailableForBooking: { type: Boolean, default: true },
    unavailableReason: { type: String, maxlength: 500 },

    // Grouped Sites
    groupedSiteInfo: {
      isGrouped: { type: Boolean, default: false },
      groupId: { type: mongoose.Schema.Types.ObjectId },
      totalSitesInGroup: { type: Number, min: 0 },
    },

    // Timestamps
    lastBookedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
siteSchema.index({ property: 1, isActive: 1 });
siteSchema.index({ "siteLocation.coordinates": "2dsphere" }); // Geospatial index
siteSchema.index({ accommodationType: 1, isActive: 1 });
siteSchema.index({ "stats.averageRating": -1 });
siteSchema.index({ createdAt: -1 });

// Compound index for property + slug uniqueness
siteSchema.index({ property: 1, slug: 1 }, { unique: true });

// Methods
siteSchema.methods.activate = async function (this: SiteDocument) {
  this.status = "active";
  this.isActive = true;
  this.isAvailableForBooking = true;
  return this.save();
};

siteSchema.methods.deactivate = async function (this: SiteDocument) {
  this.status = "inactive";
  this.isActive = false;
  this.isAvailableForBooking = false;
  return this.save();
};

siteSchema.methods.incrementViews = async function (this: SiteDocument) {
  this.stats.viewCount += 1;
  return this.save();
};

siteSchema.methods.updateStats = async function (this: SiteDocument) {
  // This will be implemented to aggregate stats from bookings and reviews
  // For now, just save
  return this.save();
};

export const SiteModel = mongoose.model<SiteDocument>("Site", siteSchema);
