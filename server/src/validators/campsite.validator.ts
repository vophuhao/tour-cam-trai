import { z } from "zod";

// Validator cho tạo/update campsite
export const createCampsiteSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).optional(), // auto-generate if not provided
  tagline: z.string().min(10).max(200).optional(),
  description: z.string().min(50).max(5000),

  // Location
  location: z.object({
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    country: z.string().default("Vietnam"),
    zipCode: z.string().max(20).optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    accessInstructions: z.string().max(1000).optional(),
  }),

  // Property details
  propertyType: z.enum(["tent", "rv", "cabin", "glamping", "treehouse", "yurt", "other"]),
  capacity: z.object({
    maxGuests: z.number().int().min(1).max(50),
    maxVehicles: z.number().int().min(0).max(20).optional(),
    maxPets: z.number().int().min(0).max(10).optional(),
  }),

  // Pricing
  pricing: z.object({
    basePrice: z.number().min(0),
    weekendPrice: z.number().min(0).optional(),
    cleaningFee: z.number().min(0).optional(),
    petFee: z.number().min(0).optional(),
    extraGuestFee: z.number().min(0).optional(),
  }),

  // Amenities & Activities
  amenities: z.array(z.string()).optional(), // array of amenity IDs
  activities: z.array(z.string()).optional(), // array of activity IDs

  // Rules
  rules: z.object({
    checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
    checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    minNights: z.number().int().min(1).default(1),
    maxNights: z.number().int().min(1).optional(),
    allowPets: z.boolean().default(false),
    allowChildren: z.boolean().default(true),
    allowSmoking: z.boolean().default(false),
    customRules: z.array(z.string()).optional(),
  }),

  // Media
  images: z.array(z.string()).min(1).max(50).optional(),
  videos: z.array(z.string()).max(10).optional(),

  // Settings
  isInstantBook: z.boolean().default(false),
});

export const updateCampsiteSchema = createCampsiteSchema.partial();

// Validator cho search/filter campsites
export const searchCampsiteSchema = z.object({
  // Search
  search: z.string().optional(),

  // Location filters
  city: z.string().optional(),
  state: z.string().optional(),

  // Near location (geospatial search)
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0).max(500).optional(), // km

  // Property filters
  propertyType: z
    .enum(["tent", "rv", "cabin", "glamping", "treehouse", "yurt", "other"])
    .optional(),
  minGuests: z.coerce.number().int().min(1).optional(),

  // Price range
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),

  // Features
  amenities: z.array(z.string()).optional(), // filter by amenity IDs
  activities: z.array(z.string()).optional(), // filter by activity IDs

  // Preferences
  allowPets: z.coerce.boolean().optional(),
  isInstantBook: z.coerce.boolean().optional(),

  // Date availability
  checkIn: z.string().optional(), // ISO date string
  checkOut: z.string().optional(),

  // Sorting
  sort: z.enum(["price-asc", "price-desc", "rating", "newest", "popular"]).default("popular"),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Validator cho activate/deactivate
export const campsiteStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateCampsiteInput = z.infer<typeof createCampsiteSchema>;
export type UpdateCampsiteInput = z.infer<typeof updateCampsiteSchema>;
export type SearchCampsiteInput = z.infer<typeof searchCampsiteSchema>;
export type CampsiteStatusInput = z.infer<typeof campsiteStatusSchema>;
