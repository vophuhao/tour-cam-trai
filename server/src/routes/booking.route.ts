import BookingController from "@/controllers/booking.controller";
import { container, TOKENS } from "@/di";
import { authenticate, requireAdmin } from "@/middleware";
import type { BookingService } from "@/services/booking.service";
import { Router } from "express";

const bookingRoutes = Router();

const bookingService = container.resolve<BookingService>(TOKENS.BookingService);
const bookingController = new BookingController(bookingService);

// All routes require authentication
bookingRoutes.use(authenticate);

// Booking management
bookingRoutes.post("/", bookingController.createBooking);
bookingRoutes.get("/", bookingController.searchBookings);
bookingRoutes.get("/:id", bookingController.getBooking);

// Booking actions
bookingRoutes.post("/:id/confirm", bookingController.confirmBooking);
bookingRoutes.post("/:id/cancel", bookingController.cancelBooking);
bookingRoutes.post("/:id/complete", bookingController.completeBooking);

// Payment (admin only)
bookingRoutes.patch("/:id/payment", requireAdmin, bookingController.updatePayment);

export default bookingRoutes;
