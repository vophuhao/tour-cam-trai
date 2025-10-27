import { z } from "zod";
import { mongoIdSchema, paginationSchema } from "./common.validator";

/**
 * Category validation schemas
 */

// Create Category
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters")
    .trim(),
  parentCategory: mongoIdSchema.optional(), // hỗ trợ sub-category
  isActive: z.boolean().optional().default(true),
});

// Update Category
export const updateCategorySchema = z.object({
  id: mongoIdSchema, // category id cần update
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters")
    .trim()
    .optional(),
  parentCategory: mongoIdSchema.optional(),
  isActive: z.boolean().optional(),
});

// Get Category by ID
export const getCategoryByIdSchema = z.object({
  id: mongoIdSchema,
});

// Delete Category
export const deleteCategorySchema = z.object({
  id: mongoIdSchema,
});

// Get Categories (with pagination)
export const getCategoriesSchema = paginationSchema;

// Export types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoryByIdInput = z.infer<typeof getCategoryByIdSchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>;
