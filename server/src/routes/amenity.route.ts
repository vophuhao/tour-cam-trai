import AmenityController from "@/controllers/amenity.controller";
import { container, TOKENS } from "@/di";
import { requireAdmin } from "@/middleware";
import type { AmenityService, ActivityService } from "@/services/amenity.service";
import { Router } from "express";

const amenityRoutes = Router();
const activityRoutes = Router();

const amenityService = container.resolve<AmenityService>(TOKENS.AmenityService);
const activityService = container.resolve<ActivityService>(TOKENS.ActivityService);
const amenityController = new AmenityController(amenityService, activityService);

// ========== AMENITY ROUTES ==========
// Public routes
amenityRoutes.get("/", amenityController.getAllAmenities);
amenityRoutes.get("/category/:category", amenityController.getAmenitiesByCategory);

// Admin routes
amenityRoutes.post("/", requireAdmin, amenityController.createAmenity);
amenityRoutes.patch("/:id", requireAdmin, amenityController.updateAmenity);
amenityRoutes.delete("/:id", requireAdmin, amenityController.deleteAmenity);
amenityRoutes.patch("/:id/toggle-active", requireAdmin, amenityController.toggleAmenityActive);

// ========== ACTIVITY ROUTES ==========
// Public routes
activityRoutes.get("/", amenityController.getAllActivities);
activityRoutes.get("/category/:category", amenityController.getActivitiesByCategory);

// Admin routes
activityRoutes.post("/", requireAdmin, amenityController.createActivity);
activityRoutes.patch("/:id", requireAdmin, amenityController.updateActivity);
activityRoutes.delete("/:id", requireAdmin, amenityController.deleteActivity);
activityRoutes.patch("/:id/toggle-active", requireAdmin, amenityController.toggleActivityActive);

export { amenityRoutes, activityRoutes };
