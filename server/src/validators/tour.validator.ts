// src/validators/tour.validator.ts
import { z } from "zod";
import { mongoIdSchema, paginationSchema } from "./common.validator";

/**
 * =============================
 *  TOUR VALIDATION SCHEMAS
 * =============================
 */

// Schema con cho itinerary
const activitySchema = z.object({
  timeFrom: z.string().optional(),
  timeTo: z.string().optional(),
  description: z.string().min(1, "Mô tả hoạt động là bắt buộc"),
});

const itineraryDaySchema = z.object({
  day: z.number().min(1, "Ngày phải >= 1"),
  title: z.string().min(1, "Tiêu đề ngày là bắt buộc"),
  activities: z.array(activitySchema).optional(),
});

// Schema con cho price options
const priceOptionSchema = z.object({
  name: z.string().min(1, "Tên loại giá là bắt buộc"),
  price: z.number().min(0, "Giá phải >= 0"),
  minPeople: z.number().min(1).optional(),
  maxPeople: z.number().min(1).optional(),
});

// Schema con cho services/notes
const detailSchema = z.object({
  value: z.string().min(1, "Chi tiết không được để trống"),
});

const titledDetailsSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  details: z.array(detailSchema).optional(),
});

// =============================
// Create Tour
// =============================
export const createTourSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Tên tour là bắt buộc").max(255),
  slug: z.string().optional(),
  description: z.string().max(2000).optional(),

  durationDays: z.number().min(1, "Số ngày phải >= 1"),
  durationNights: z.number().min(0).optional(),
  stayType: z.string().min(1, "Loại lưu trú là bắt buộc"),
  transportation: z.string().min(1, "Phương tiện di chuyển là bắt buộc"),
  departurePoint: z.string().min(1, "Điểm khởi hành là bắt buộc"),
  departureFrequency: z.string().optional(),
  targetAudience: z.string().optional(),

  itinerary: z.array(itineraryDaySchema).optional(),
  priceOptions: z.array(priceOptionSchema).optional(),

  servicesIncluded: z.array(titledDetailsSchema).optional(),
  servicesExcluded: z.array(titledDetailsSchema).optional(),
  notes: z.array(titledDetailsSchema).optional(),

  images: z.array(z.string().url("Ảnh phải là URL hợp lệ")).optional(),
  isActive: z.boolean().optional().default(true),
});

// =============================
// Update Tour
// =============================
export const updateTourSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
  slug: z.string().optional(),
  description: z.string().max(2000).optional(),

  durationDays: z.number().min(1).optional(),
  durationNights: z.number().min(0).optional(),
  stayType: z.string().optional(),
  transportation: z.string().optional(),
  departurePoint: z.string().optional(),
  departureFrequency: z.string().optional(),
  targetAudience: z.string().optional(),

  itinerary: z.array(itineraryDaySchema).optional(),
  priceOptions: z.array(priceOptionSchema).optional(),

  servicesIncluded: z.array(titledDetailsSchema).optional(),
  servicesExcluded: z.array(titledDetailsSchema).optional(),
  notes: z.array(titledDetailsSchema).optional(),

  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional(),
});

// =============================
// Get, Delete, List
// =============================
export const getTourByIdSchema = z.object({
  id: mongoIdSchema,
});

export const deleteTourSchema = z.object({
  id: mongoIdSchema,
});

export const getToursSchema = paginationSchema.extend({
  search: z.string().optional(),
  departurePoint: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// =============================
// Export types
// =============================
export type CreateTourInput = z.infer<typeof createTourSchema>;
export type UpdateTourInput = z.infer<typeof updateTourSchema>;
export type GetTourByIdInput = z.infer<typeof getTourByIdSchema>;
export type DeleteTourInput = z.infer<typeof deleteTourSchema>;
export type GetToursInput = z.infer<typeof getToursSchema>;
