import { z } from "zod";

// Validator cho tạo booking
export const createBookingSchema = z
  .object({
    campsite: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid campsite ID"),

    // Dates
    checkIn: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid check-in date",
    }),
    checkOut: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid check-out date",
    }),

    // Guest details
    numberOfGuests: z.number().int().min(1).max(50),
    numberOfPets: z.number().int().min(0).max(10).default(0),
    numberOfVehicles: z.number().int().min(0).max(20).default(1),

    // Optional message to host
    guestMessage: z.string().max(1000).optional(),

    // Payment method
    paymentMethod: z.enum(["card", "bank_transfer", "momo", "zalopay"]).default("card"),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      return checkOut > checkIn;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOut"],
    }
  );

// Validator cho confirm booking (host)
export const confirmBookingSchema = z.object({
  hostMessage: z.string().max(1000).optional(),
});

// Validator cho cancel booking
export const cancelBookingSchema = z.object({
  cancellationReason: z.string().min(10).max(500),
});

// Validator cho search bookings
export const searchBookingSchema = z.object({
  // Filter by status
  status: z.enum(["pending", "confirmed", "cancelled", "completed", "refunded"]).optional(),

  // Filter by dates
  checkInFrom: z.string().optional(),
  checkInTo: z.string().optional(),

  // Filter by user role
  role: z.enum(["guest", "host"]).optional(), // xem booking as guest hay host

  // Sorting
  sort: z.enum(["newest", "oldest", "check-in"]).default("newest"),

  // Pagination (coerce string to number for query params)
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Validator cho update payment
export const updatePaymentSchema = z.object({
  paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]),
  transactionId: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type SearchBookingInput = z.infer<typeof searchBookingSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
