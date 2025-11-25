import { Router } from "express";
import TourBController from "@/controllers/tourB.controller";
import { container, TOKENS } from "@/di";
import { requireAdmin } from "@/middleware";
import type TourBService from "@/services/tourB.service";

const tourBRoute = Router();

// Resolve dependencies via DI container
const tourBService = container.resolve<TourBService>(TOKENS.TourBService);
const tourBController = new TourBController(tourBService);

tourBRoute.post("/", tourBController.createBooking);
tourBRoute.get("/user", tourBController.getBookingsByUser);
tourBRoute.get("/:bookingId", tourBController.getBookingById);
tourBRoute.patch("/:bookingId/cancel", tourBController.cancelBooking);
tourBRoute.get("/", requireAdmin, tourBController.getAllBookings);
tourBRoute.patch("/:bookingId/status", requireAdmin, tourBController.updateStatusBooking);
tourBRoute.post("/:bookingId/update", tourBController.updateCustomerInfo);

export default tourBRoute;