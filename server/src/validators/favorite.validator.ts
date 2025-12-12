import { z } from "zod";

// MongoDB ObjectId regex pattern
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createFavoriteSchema = z
  .object({
    property: z.string().regex(objectIdRegex, "Invalid property ID").optional(),
    site: z.string().regex(objectIdRegex, "Invalid site ID").optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.property || data.site, {
    message: "Must provide either property or site ID",
    path: ["property"],
  })
  .refine((data) => !(data.property && data.site), {
    message: "Cannot favorite both property and site - choose one",
    path: ["property"],
  });

export const updateFavoriteNotesSchema = z.object({
  notes: z.string().trim().max(500).optional(),
});

export const getFavoritesQuerySchema = z.object({
  type: z.enum(["property", "site", "all"]).optional().default("all"),
  page: z.coerce.number().min(1).optional().default(1),
  // Accept client-provided limit but clamp it to a safe maximum (50) to avoid errors
  // and protect the server from very large requests. We coerce to number, set a
  // sensible default, and then transform the parsed value to Math.min(value, 50).
  limit: z.coerce
    .number()
    .min(1)
    .optional()
    .default(20)
    .transform((v) => Math.min(v, 50)),
});

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export type UpdateFavoriteNotesInput = z.infer<typeof updateFavoriteNotesSchema>;
export type GetFavoritesQuery = z.infer<typeof getFavoritesQuerySchema>;
