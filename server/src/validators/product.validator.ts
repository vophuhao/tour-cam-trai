import { z } from "zod";
import { mongoIdSchema, paginationSchema } from "./common.validator";
import { count } from "console";

/**
 * Sub Schemas
 */

// Biến thể (size)
const productVariantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  expandedSize: z.string().optional(),
  foldedSize: z.string().optional(),
  loadCapacity: z.string().optional(),
  weight: z.string().optional(),
});

// Đặc tính chung
const productSpecificationSchema = z.object({
  label: z.string().min(1, "Specification label is required"),
  value: z.string().min(1, "Specification value is required"),
});

// Chi tiết sản phẩm con
const productDetailItemSchema = z.object({
  label: z.string().min(1, "Detail label is required"),
});

// Nhóm chi tiết
const productDetailSectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  items: z.array(productDetailItemSchema).optional().default([]),
});

/**
 * Product validation schemas
 */

// Create Product
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255).trim(),
  slug: z.string().optional(),
  description: z.string().max(1000, "Description too long").optional(),
  price: z.number().min(0, "Price must be >= 0"),
  deal: z.number().min(0, "Deal must be >= 0").optional(),
  stock: z.number().min(0, "Stock must be >= 0").default(0),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  category: mongoIdSchema,
  specifications: z.array(productSpecificationSchema).optional().default([]),
  variants: z.array(productVariantSchema).optional().default([]),
  details: z.array(productDetailSectionSchema).optional().default([]),
  guide: z.array(z.string().min(1)).optional().default([]),
  warnings: z.array(z.string().min(1)).optional().default([]),
  isActive: z.boolean().optional().default(true),
  rating: z
    .object({
      average: z.number().min(0).max(5).optional().default(0),
      count: z.number().min(0).optional().default(0),
    })
    .optional(),
  count: z.number().min(0).optional().default(0),
});

// Update Product
export const updateProductSchema = createProductSchema.partial().extend({
 
});

// Get Product by ID
export const getProductByIdSchema = z.object({
  id: mongoIdSchema,
});

// Get Product by Slug
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
