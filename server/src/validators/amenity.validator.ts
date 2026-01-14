import { z } from "zod";

// Validator cho Amenity
export const createAmenitySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  category: z.enum(["basic", "comfort", "safety", "outdoor", "special"]),
});

export const updateAmenitySchema = createAmenitySchema.partial();

// Validator cho Activity
export const createActivitySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  category: z.enum(["water", "hiking", "wildlife", "winter", "adventure", "relaxation", "other"]),
});

export const updateActivitySchema = createActivitySchema.partial();

export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;
export type UpdateAmenityInput = z.infer<typeof updateAmenitySchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
