import { z } from "zod";

// Shared amenities sub-schema - matches Property model
const sharedAmenitiesSchema = z.object({
  toilets: z
    .object({
      type: z.enum(["none", "portable", "flush", "vault", "composting"]),
      count: z.number().int().min(0),
      isShared: z.boolean(),
    })
    .optional(),
  showers: z
    .object({
      type: z.enum(["none", "outdoor", "indoor", "hot", "cold"]),
      count: z.number().int().min(0),
      isShared: z.boolean(),
    })
    .optional(),
  potableWater: z.boolean().optional(),
  waterSource: z.enum(["tap", "well", "stream", "none"]).optional(),
  parkingType: z.enum(["drive_in", "walk_in", "nearby"]).optional(),
  parkingSpaces: z.number().int().min(0).optional(),
  commonAreas: z.array(z.string()).optional(),
  laundry: z.boolean().optional(),
  wifi: z.boolean().optional(),
  cellService: z.enum(["excellent", "good", "limited", "none"]).optional(),
  electricityAvailable: z.boolean().optional(),
});

// Cancellation policy sub-schema
const cancellationPolicySchema = z.object({
  type: z.enum(["flexible", "moderate", "strict", "non-refundable"]),
  description: z.string().max(1000).optional(),
  refundRules: z
    .array(
      z.object({
        daysBeforeCheckIn: z.number().int().min(0),
        refundPercentage: z.number().min(0).max(100),
      })
    )
    .optional(),
});

// Pet policy sub-schema
const petPolicySchema = z.object({
  allowed: z.boolean().default(false),
  maxPets: z.number().int().min(0).optional(),
  additionalFee: z.number().min(0).optional(),
  restrictions: z.array(z.string()).optional(),
});

// Children policy sub-schema
const childrenPolicySchema = z.object({
  allowed: z.boolean().default(true),
  ageRestriction: z.number().int().min(0).optional(),
  requireSupervision: z.boolean().optional(),
});

export const createPropertySchema = z.object({
  // Ownership
  host: z.string().optional(),

  // Basic Info
  name: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).optional(),
  tagline: z.string().max(150).optional(),
  description: z.string().min(0).max(5000),

  // Location
  location: z.object({
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    country: z.string().default("Vietnam"),
    zipCode: z.string().optional(),

    coordinates: z.object({
      type: z.literal("Point").default("Point"),
      coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    }),

    directions: z.string().max(1000).optional(),
    parkingInstructions: z.string().max(500).optional(),
  }),

  // Land size
  landSize: z
    .object({
      value: z.number().min(0),
      unit: z.enum(["acres", "hectares", "square_meters"]),
    })
    .optional(),

  // Terrain
  terrain: z.string().max(100).optional(),

  // Property Type
  propertyType: z.enum(["private_land", "farm", "ranch", "campground"]),

  // Photos
  photos: z
    .array(
      z.object({
        url: z.string(),
        caption: z.string().max(200).optional(),
        isCover: z.boolean().default(false),
        order: z.number().default(0),
      })
    )
    .min(1),

  // Shared Amenities
  sharedAmenities: z
    .object({
      toilets: z
        .object({
          type: z.enum(["none", "portable", "flush", "vault", "composting"]),
          count: z.number().min(0),
          isShared: z.boolean(),
        })
        .optional(),

      showers: z
        .object({
          type: z.enum(["none", "outdoor", "indoor", "hot", "cold"]),
          count: z.number().min(0),
          isShared: z.boolean(),
        })
        .optional(),

      potableWater: z.boolean().optional(),
      waterSource: z.enum(["tap", "well", "stream", "none"]).optional(),
      parkingType: z.enum(["drive_in", "walk_in", "nearby"]).optional(),
      parkingSpaces: z.number().min(0).optional(),
      commonAreas: z.array(z.string()).optional(),
      laundry: z.boolean().optional(),
      wifi: z.boolean().optional(),
      cellService: z.enum(["excellent", "good", "limited", "none"]).optional(),
      electricityAvailable: z.boolean().optional(),
    })
    .optional(),

  // Activities
  activities: z.array(z.string()).optional(),

  // Nearby attractions
  nearbyAttractions: z
    .array(
      z.object({
        name: z.string(),
        distance: z.number().min(0),
        type: z.string(),
      })
    )
    .optional(),

  // Rules
  rules: z
    .array(
      z.object({
        text: z.string().max(500),
        category: z.enum(["pets", "noise", "fire", "general"]).default("general"),
        order: z.number().default(0),
      })
    )
    .optional(),

  checkInInstructions: z.string().max(2000).optional(),
  checkOutInstructions: z.string().max(2000).optional(),

  emergencyContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      instructions: z.string().max(500).optional(),
    })
    .optional(),

  // Cancellation Policy
  cancellationPolicy: z
    .object({
      type: z.enum(["flexible", "moderate", "strict"]),
      description: z.string().max(1000).optional(),
      refundRules: z.array(
        z.object({
          daysBeforeCheckIn: z.number().min(0),
          refundPercentage: z.number().min(0).max(100),
        })
      ),
    })
    .optional(),

  // Pet Policy
  petPolicy: z
    .object({
      allowed: z.boolean(),
      maxPets: z.number().min(0).optional(),
      fee: z.number().min(0).optional(),
      rules: z.string().max(500).optional(),
    })
    .optional(),

  // Children Policy
  childrenPolicy: z
    .object({
      allowed: z.boolean(),
      ageRestrictions: z.string().max(200).optional(),
    })
    .optional(),

  // SEO
  seo: z
    .object({
      metaTitle: z.string().max(100).optional(),
      metaDescription: z.string().max(200).optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),

  // Settings
  settings: z
    .object({
      instantBookEnabled: z.boolean().optional(),
      requireApproval: z.boolean().optional(),
      minimumAdvanceNotice: z.number().min(0).optional(),
      bookingWindow: z.number().min(1).optional(),
      allowWholePropertyBooking: z.boolean().optional(),
    })
    .optional(),

  // Status flags
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});


export const updatePropertySchema = createPropertySchema.partial();

// Validator cho search/filter properties
export const searchPropertySchema = z.object({
  // Search
  search: z.string().optional(),

  // Location filters
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),

  // Date range filters - for availability checking
  checkIn: z.string().optional(), // ISO date string (YYYY-MM-DD)
  checkOut: z.string().optional(), // ISO date string (YYYY-MM-DD)

  // Capacity filters
  guests: z.coerce.number().int().min(1).optional(), // Total guests
  pets: z.coerce.number().int().min(0).optional(), // Number of pets

  // Geospatial search
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0).max(500).optional(), // km

  // Property type filter
  propertyType: z
    .union([
      z.enum([
        "private-land",
        "farm",
        "ranch",
        "vineyard",
        "orchard",
        "campground",
        "retreat-center",
        "other",
      ]),
      z.array(
        z.enum([
          "private-land",
          "farm",
          "ranch",
          "vineyard",
          "orchard",
          "campground",
          "retreat-center",
          "other",
        ])
      ),
    ])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return [val];
      return val;
    }),

  // Terrain filter
  terrain: z
    .union([
      z.enum([
        "flat",
        "hilly",
        "mountainous",
        "forest",
        "desert",
        "beach",
        "riverside",
        "lakeside",
      ]),
      z.array(
        z.enum([
          "flat",
          "hilly",
          "mountainous",
          "forest",
          "desert",
          "beach",
          "riverside",
          "lakeside",
        ])
      ),
    ])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return [val];
      return val;
    }),

  // Accommodation filter (accepts simplified types: tent, rv, glamping)
  // "glamping" will be expanded to all glamping accommodation types in service
  campingStyle: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      // Handle comma-separated string from URL query params
      return val
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    })
    .refine(
      (val) => {
        if (!val) return true;
        return val.every((v) => ["tent", "rv", "glamping"].includes(v));
      },
      { message: "Invalid accommodation filter. Expected 'tent', 'rv', or 'glamping'" }
    ),

  // Amenity filters (shared amenities)
  hasToilets: z.coerce.boolean().optional(),
  hasShowers: z.coerce.boolean().optional(),
  hasParking: z.coerce.boolean().optional(),
  hasWifi: z.coerce.boolean().optional(),
  hasElectricity: z.coerce.boolean().optional(),
  hasWater: z.coerce.boolean().optional(),

  // Amenities (comma-separated string or array of amenity IDs)
  amenities: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return val.split(",").map((v) => v.trim());
      return val;
    }),

  // Activities (comma-separated string or array)
  activities: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return val.split(",").map((v) => v.trim());
      return val;
    }),

  // Policy filters
  allowPets: z.coerce.boolean().optional(),
  allowChildren: z.coerce.boolean().optional(),
  instantBooking: z.coerce.boolean().optional(),
  instantBook: z.coerce.boolean().optional(), // Alias for instantBooking (from frontend)

  // Status filters
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isVerified: z.coerce.boolean().optional(),

  // Host filter
  host: z.string().optional(), // host user ID

  // Rating filter
  minRating: z.coerce.number().min(0).max(5).optional(),

  // Sorting
  sortBy: z
    .enum([
      "newest",
      "oldest",
      "rating",
      "reviewCount",
      "minPrice-asc",
      "minPrice-desc",
      "name",
      "totalSites",
      "nearestFirst", // requires lat/lng
    ])
    .optional()
    .default("reviewCount"),

  // Pagination
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Validator cho query single property
export const getPropertySchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
});

// Type exports
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type SearchPropertyInput = z.infer<typeof searchPropertySchema>;
export type GetPropertyInput = z.infer<typeof getPropertySchema>;
