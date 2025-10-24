import { z } from "zod";
import { mongoIdSchema, paginationSchema } from "./common.validator";

/**
 * Product validation schemas
 */

// Create Product
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters")
    .trim(),
  description: z.string().max(1000, "Description too long").optional(),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  stock: z.number().min(0, "Stock must be greater than or equal to 0").default(0),
  images: z.array(z.string().url("Image must be a valid URL")).optional(),
  category: mongoIdSchema, // liên kết Category
  isActive: z.boolean().optional().default(true),
});

// Update Product
export const updateProductSchema = z.object({
  id: mongoIdSchema, // product id cần update
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters")
    .trim()
    .optional(),
  description: z.string().max(1000).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  category: mongoIdSchema.optional(),
  isActive: z.boolean().optional(),
});

// Get Product by ID
export const getProductByIdSchema = z.object({
  id: mongoIdSchema,
});

export const getProductBySlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

// Delete Product
export const deleteProductSchema = z.object({
  id: mongoIdSchema,
});

// Get Products (with pagination + optional filters)
export const getProductsSchema = paginationSchema.extend({
  search: z.string().optional(),
  category: mongoIdSchema.optional(),
});

// Export types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductByIdInput = z.infer<typeof getProductByIdSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
export type GetProductsInput = z.infer<typeof getProductsSchema>;
