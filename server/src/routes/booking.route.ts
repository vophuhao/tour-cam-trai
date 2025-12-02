import BookingController from "@/controllers/booking.controller";
import { container, TOKENS } from "@/di";
import { authenticate, requireAdmin } from "@/middleware";
import type { BookingService } from "@/services/booking.service";
import { Router } from "express";

const bookingRoutes = Router();

const bookingService = container.resolve<BookingService>(TOKENS.BookingService);
const bookingController = new BookingController(bookingService);

// Booking management
bookingRoutes.post("/",authenticate, bookingController.createBooking);
bookingRoutes.get("/", authenticate, bookingController.searchBookings);
bookingRoutes.get("/:id", authenticate, bookingController.getBooking);
bookingRoutes.get("/my/list", authenticate, bookingController.getMyBookings);
// Booking actions
bookingRoutes.post("/:id/confirm", authenticate, bookingController.confirmBooking);
bookingRoutes.post("/:id/cancel", authenticate, bookingController.cancelBooking);
bookingRoutes.post("/:id/complete", authenticate, bookingController.completeBooking);
// Booking by code
bookingRoutes.post("/:code/code", authenticate, bookingController.getBookingByCode);
bookingRoutes.post("/payos/webhook", bookingController.handlePayOSWebhook);

// Payment (admin only)
bookingRoutes.patch("/:id/payment", authenticate, requireAdmin, bookingController.updatePayment);

export default bookingRoutes;
