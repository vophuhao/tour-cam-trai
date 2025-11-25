import { z } from "zod";

export const createLocationSchema = z.object({
  name: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const updateLocationSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const getLocationByIdSchema = z.object({
  id: z.string(),
});

export const deleteLocationSchema = z.object({
  id: z.string(),
});

export const searchSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  q: z.string().optional(),
});
