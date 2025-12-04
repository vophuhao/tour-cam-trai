import { z } from "zod";

// Site-specific amenities sub-schema
const siteAmenitiesSchema = z.object({
  electrical: z
    .object({
      available: z.boolean().default(false),
      amperage: z.enum(["15", "20", "30", "50"]).optional(),
      plugType: z.enum(["standard", "rv", "both"]).optional(),
    })
    .optional(),
  waterHookup: z
    .object({
      available: z.boolean().default(false),
      type: z.enum(["potable", "non-potable"]).optional(),
    })
    .optional(),
  sewerHookup: z
    .object({
      available: z.boolean().default(false),
      type: z.enum(["full", "gray-only"]).optional(),
    })
    .optional(),
  firePit: z
    .object({
      available: z.boolean().default(false),
      type: z.enum(["ground", "ring", "grill", "none"]).optional(),
    })
    .optional(),
  furniture: z
    .object({
      available: z.boolean().default(false),
      items: z.array(z.enum(["picnic-table", "chairs", "benches", "hammock"])).optional(),
    })
    .optional(),
  bedding: z
    .object({
      available: z.boolean().default(false),
      type: z.enum(["mattress", "cot", "platform", "none"]).optional(),
      bedCount: z.number().int().min(0).optional(),
    })
    .optional(),
  kitchen: z
    .object({
      available: z.boolean().default(false),
      items: z.array(z.enum(["stove", "refrigerator", "sink", "cookware", "utensils"])).optional(),
    })
    .optional(),
  privateBathroom: z
    .object({
      available: z.boolean().default(false),
      hasShower: z.boolean().optional(),
      hasToilet: z.boolean().optional(),
      isIndoor: z.boolean().optional(),
    })
    .optional(),
  climateControl: z
    .object({
      heating: z.boolean().default(false),
      cooling: z.boolean().default(false),
      type: z.enum(["wood-stove", "electric", "propane", "ac", "fan"]).optional(),
    })
    .optional(),
  wifi: z.boolean().default(false),
  tv: z.boolean().default(false),
  accessibility: z
    .object({
      wheelchairAccessible: z.boolean().default(false),
      adaCompliant: z.boolean().default(false),
      features: z.array(z.string()).optional(),
    })
    .optional(),
});

// Capacity sub-schema
const capacitySchema = z.object({
  maxGuests: z.number().int().min(1).max(100),
  maxAdults: z.number().int().min(0).optional(),
  maxChildren: z.number().int().min(0).optional(),
  maxInfants: z.number().int().min(0).optional(),
  maxPets: z.number().int().min(0).optional(),
  maxVehicles: z.number().int().min(0).optional(),
  maxTents: z.number().int().min(0).optional(),
  maxRVs: z.number().int().min(0).optional(),
  rvMaxLength: z.number().min(0).optional(), // feet

  // Concurrent Bookings (designated vs undesignated)
  // 1 = designated (only 1 booking at a time)
  // 2+ = undesignated (multiple concurrent bookings, "X sites left")
  maxConcurrentBookings: z.number().int().min(1).max(100).default(1),
});

// Dimensions sub-schema
const dimensionsSchema = z.object({
  length: z.number().min(0).optional(), // meters
  width: z.number().min(0).optional(), // meters
  area: z.number().min(0).optional(), // square meters
  isPaved: z.boolean().default(false),
  isLevel: z.boolean().default(false),
  shadeLevel: z.enum(["none", "partial", "full"]).optional(),
});

// Pricing sub-schema
const pricingSchema = z.object({
  basePrice: z.number().min(0),
  weekendPrice: z.number().min(0).optional(),
  currency: z.string().default("VND"),
  seasonalPricing: z
    .array(
      z.object({
        name: z.string().max(100),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        price: z.number().min(0),
      })
    )
    .optional(),
  discounts: z
    .object({
      weekly: z.number().min(0).max(100).optional(), // percentage
      monthly: z.number().min(0).max(100).optional(),
    })
    .optional(),
  fees: z
    .object({
      cleaningFee: z.number().min(0).optional(),
      petFee: z.number().min(0).optional(),
      extraGuestFee: z.number().min(0).optional(),
      extraVehicleFee: z.number().min(0).optional(),
    })
    .optional(),
});

// Booking settings sub-schema
const bookingSettingsSchema = z.object({
  minNights: z.number().int().min(1).default(1),
  maxNights: z.number().int().min(1).optional(),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  allowInstantBook: z.boolean().default(false),
  requireApproval: z.boolean().default(true),
});

// Validator cho tạo site
export const createSiteSchema = z.object({
  // Property reference (required)
  property: z.string(),

  // Basic Info
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(20).max(3000).optional(),

  // Accommodation Type
  accommodationType: z.enum([
    "tent",
    "rv",
    "cabin",
    "yurt",
    "treehouse",
    "glamping-tent",
    "tiny-house",
    "a-frame",
    "dome",
    "van",
    "other",
  ]),

  lodgingProvided: z.boolean().default(false),

  // Location (within property)
  siteLocation: z
    .object({
      description: z.string().max(500).optional(),
      coordinates: z
        .object({
          type: z.literal("Point").default("Point"),
          coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
        })
        .optional(),
      distanceFromParking: z.number().min(0).optional(), // meters
      distanceFromWater: z.number().min(0).optional(),
      distanceFromToilets: z.number().min(0).optional(),
    })
    .optional(),

  // Capacity
  capacity: capacitySchema,

  // Dimensions
  dimensions: dimensionsSchema.optional(),

  // Pricing
  pricing: pricingSchema,

  // Booking Settings
  bookingSettings: bookingSettingsSchema,

  // Media
  photos: z.array(z.string()).min(0).max(50).optional(),
  videos: z.array(z.string()).max(10).optional(),
  coverPhoto: z.string().optional(),

  // Site-specific amenities
  amenities: siteAmenitiesSchema.optional(),

  // What's included
  included: z.array(z.string()).optional(),

  // What to bring
  whatToBring: z.array(z.string()).optional(),

  // Site-specific rules
  siteRules: z.array(z.string()).optional(),

  // Status
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
});

export const updateSiteSchema = createSiteSchema.partial();

// Validator cho search/filter sites
export const searchSiteSchema = z.object({
  // Property filter (required for listing sites within a property)
  property: z.string().optional(),

  // Search
  search: z.string().optional(),

  // Accommodation type filter
  accommodationType: z
    .union([
      z.enum([
        "tent",
        "rv",
        "cabin",
        "yurt",
        "treehouse",
        "glamping-tent",
        "tiny-house",
        "a-frame",
        "dome",
        "van",
        "other",
      ]),
      z.array(
        z.enum([
          "tent",
          "rv",
          "cabin",
          "yurt",
          "treehouse",
          "glamping-tent",
          "tiny-house",
          "a-frame",
          "dome",
          "van",
          "other",
        ])
      ),
    ])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return [val];
      return val;
    }),

  // Capacity filters
  minGuests: z.coerce.number().int().min(1).optional(),
  maxGuests: z.coerce.number().int().min(1).optional(),
  allowPets: z.coerce.boolean().optional(),
  allowRVs: z.coerce.boolean().optional(),

  // Price range
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),

  // Amenity filters
  hasElectrical: z.coerce.boolean().optional(),
  hasWaterHookup: z.coerce.boolean().optional(),
  hasSewerHookup: z.coerce.boolean().optional(),
  hasFirePit: z.coerce.boolean().optional(),
  hasBedding: z.coerce.boolean().optional(),
  hasKitchen: z.coerce.boolean().optional(),
  hasPrivateBathroom: z.coerce.boolean().optional(),
  hasWifi: z.coerce.boolean().optional(),
  wheelchairAccessible: z.coerce.boolean().optional(),

  // Availability filters
  checkIn: z.string().optional(), // ISO date
  checkOut: z.string().optional(),

  // Booking settings
  instantBookOnly: z.coerce.boolean().optional(),

  // Status filters
  isActive: z.coerce.boolean().optional(),
  isAvailable: z.coerce.boolean().optional(),

  // Rating filter
  minRating: z.coerce.number().min(0).max(5).optional(),

  // Sorting
  sortBy: z
    .enum(["newest", "oldest", "price-low", "price-high", "rating", "name", "capacity"])
    .optional()
    .default("newest"),

  // Pagination
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Validator cho query single site
export const getSiteSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  property: z.string().optional(), // property ID for slug lookup
});

// Type exports
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type SearchSiteInput = z.infer<typeof searchSiteSchema>;
export type GetSiteInput = z.infer<typeof getSiteSchema>;
