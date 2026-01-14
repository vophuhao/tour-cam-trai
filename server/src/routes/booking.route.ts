import BookingController from "@/controllers/booking.controller";
import { container, TOKENS } from "@/di";
import { authenticate, requireAdmin } from "@/middleware";
import type { BookingService } from "@/services/booking.service";
import { Router } from "express";

const bookingRoutes = Router();

const bookingService = container.resolve<BookingService>(TOKENS.BookingService);
const bookingController = new BookingController(bookingService);

// Webhook (MUST be first - no auth)
bookingRoutes.post("/payos/webhook", bookingController.handlePayOSWebhook);

// Fixed routes BEFORE param routes
bookingRoutes.post("/", authenticate, bookingController.createBooking);
bookingRoutes.get("/", authenticate, bookingController.searchBookings);
bookingRoutes.get("/my/list", authenticate, bookingController.getMyBookings);

// Specific action routes (use POST with specific path segment)
bookingRoutes.post("/:id/cancel-payment", authenticate, bookingController.userCancelPayment);
bookingRoutes.post("/:id/confirm", authenticate, bookingController.confirmBooking);
bookingRoutes.post("/:id/cancel", authenticate, bookingController.cancelBooking);
bookingRoutes.post("/:id/complete", authenticate, bookingController.completeBooking);
bookingRoutes.post("/:id/refund", authenticate, bookingController.refundBooking);
bookingRoutes.post("/:code/code", authenticate, bookingController.getBookingByCode);
bookingRoutes.patch("/:id/payment", authenticate, requireAdmin, bookingController.updatePayment);

// Generic GET by ID (LAST)
bookingRoutes.get("/:id", authenticate, bookingController.getBooking);

export default bookingRoutes;