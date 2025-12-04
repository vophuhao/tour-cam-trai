import PropertyController from "@/controllers/property.controller";
import ReviewController from "@/controllers/review.controller";
import { container, TOKENS } from "@/di";
import { authenticate } from "@/middleware";
import type { PropertyService } from "@/services/property.service";
import type { ReviewService } from "@/services/review.service";
import { Router } from "express";

const propertyRoutes = Router();

const propertyService = container.resolve<PropertyService>(TOKENS.PropertyService);
const propertyController = new PropertyController(propertyService);

const reviewService = container.resolve<ReviewService>(TOKENS.ReviewService);
const reviewController = new ReviewController(reviewService);

// Public routes - ORDER MATTERS! Specific routes must come before dynamic params

// Search endpoint (must be first to avoid matching "search" as ID)
propertyRoutes.get("/search", propertyController.searchProperties);
propertyRoutes.get("/", propertyController.searchProperties); // Alias

// Featured and nearby (must be before /:idOrSlug)
propertyRoutes.get("/featured/list", propertyController.getFeaturedProperties);
propertyRoutes.get("/nearby/:idOrSlug", propertyController.getNearbyProperties);

// My properties (must be before /:idOrSlug to avoid matching "my" as ID)
propertyRoutes.get("/my/list", authenticate, propertyController.getMyProperties);

// Property reviews routes (must be before /:idOrSlug)
propertyRoutes.get("/:propertyId/reviews", reviewController.getPropertyReviews);
propertyRoutes.get("/:propertyId/reviews/stats", reviewController.getPropertyReviewStats);

// Property stats (must be before /:idOrSlug)
propertyRoutes.get("/:id/stats", authenticate, propertyController.getPropertyStats);

// Property with sites (must be before /:idOrSlug)
propertyRoutes.get("/:idOrSlug/with-sites", propertyController.getPropertyWithSites);

// Property details (MUST BE LAST among GET routes)
propertyRoutes.get("/:idOrSlug", propertyController.getProperty);

// Protected routes (host/admin)
propertyRoutes.post("/", authenticate, propertyController.createProperty);
propertyRoutes.patch("/:id", authenticate, propertyController.updateProperty);
propertyRoutes.delete("/:id", authenticate, propertyController.deleteProperty);
propertyRoutes.post("/:id/activate", authenticate, propertyController.activateProperty);
propertyRoutes.post("/:id/deactivate", authenticate, propertyController.deactivateProperty);

export default propertyRoutes;
