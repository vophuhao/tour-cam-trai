import AmenityController from "@/controllers/amenity.controller";
import { container, TOKENS } from "@/di";
import { requireAdmin } from "@/middleware";
import type { AmenityService } from "@/services/amenity.service";
import { Router } from "express";

const amenityRoutes = Router();

const amenityService = container.resolve<AmenityService>(TOKENS.AmenityService);
const amenityController = new AmenityController(amenityService);

// ========== AMENITY ROUTES ==========
// Public routes
amenityRoutes.get("/", amenityController.getAllAmenities);
amenityRoutes.get("/category/:category", amenityController.getAmenitiesByCategory);

// Admin routes
amenityRoutes.post("/", requireAdmin, amenityController.createAmenity);
amenityRoutes.patch("/:id", requireAdmin, amenityController.updateAmenity);
amenityRoutes.delete("/:id", requireAdmin, amenityController.deleteAmenity);
amenityRoutes.patch("/:id/toggle-active", requireAdmin, amenityController.toggleAmenityActive);

export { amenityRoutes };
