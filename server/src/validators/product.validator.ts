import { z } from "zod";
import { mongoIdSchema, paginationSchema } from "./common.validator";

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
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Giá phải >= 0"),
  deal: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  images: z.array(z.string().url("URL hình ảnh không hợp lệ")).optional(),
  category: mongoIdSchema,
  isActive: z.boolean().optional(),

  specifications: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .optional(),

  variants: z
    .array(
      z.object({
        size: z.string(),
        expandedSize: z.string(),
        foldedSize: z.string(),
        loadCapacity: z.string(),
        weight: z.string(),
      })
    )
    .optional(),

  details: z
    .array(
      z.object({
        title: z.string().min(1),
        items: z.array(
          z.object({
            label: z.string().min(1),
          })
        ),
      })
    )
    .optional(),

  guide: z.array(z.string()).optional(),

  warnings: z.array(z.string()).optional(),

  rating: z
    .object({
      average: z.number().min(0).max(5),
      count: z.number().min(0),
    })
    .optional(),

  count: z.number().min(0).optional(),
});

// Update Product
export const updateProductSchema = z.object({
  id: mongoIdSchema,

  slug: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  deal: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),

  images: z.array(z.string().url("URL hình ảnh không hợp lệ")).optional(),

  category: mongoIdSchema.optional(),
  isActive: z.boolean().optional(),

  specifications: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .optional(),

  variants: z
    .array(
      z.object({
        size: z.string(),
        expandedSize: z.string(),
        foldedSize: z.string(),
        loadCapacity: z.string(),
        weight: z.string(),
      })
    )
    .optional(),

  details: z
    .array(
      z.object({
        title: z.string().min(1),
        items: z.array(
          z.object({
            label: z.string().min(1),
          })
        ),
      })
    )
    .optional(),

  guide: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
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
export const getProductSchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  categories: z
    .union([mongoIdSchema, z.array(mongoIdSchema)])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return Array.isArray(val) ? val : [val];
    }),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sort: z.enum(["price-asc", "price-desc", "name-asc", "name-desc"]).optional(),
});

// Export types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductByIdInput = z.infer<typeof getProductByIdSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
export type GetProductsInput = z.infer<typeof getProductSchema>;
