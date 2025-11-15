// src/routes/tour.routes.ts
import TourController from "@/controllers/tour.controller";
import { container, TOKENS } from "@/di";
import { requireAdmin } from "@/middleware";
import type TourService from "@/services/tour.service";
import { Router } from "express";

const tourRoutes = Router();

// Resolve dependencies via DI container
const tourService = container.resolve<TourService>(TOKENS.TourService);
const tourController = new TourController(tourService);

tourRoutes.post("/", requireAdmin, tourController.createTour);
tourRoutes.get("/", tourController.getToursPaginated);
tourRoutes.get("/all", tourController.getAllTours);
tourRoutes.get("/:id", tourController.getTourById);
tourRoutes.put("/:id", requireAdmin, tourController.updateTour);
tourRoutes.delete("/:id", requireAdmin, tourController.deleteTour);
tourRoutes.patch("/:id/activate", requireAdmin, tourController.activateTour);
tourRoutes.patch("/:id/deactivate", requireAdmin, tourController.deactivateTour);
tourRoutes.get("/slug/:slug", tourController.getTourBySlug);

export default tourRoutes;
