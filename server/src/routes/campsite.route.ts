import CampsiteController from "@/controllers/campsite.controller";
import ReviewController from "@/controllers/review.controller";
import { container, TOKENS } from "@/di";
import { authenticate, requireAdmin } from "@/middleware";
import type { CampsiteService } from "@/services/campsite.service";
import type { ReviewService } from "@/services/review.service";
import { Router } from "express";

const campsiteRoutes = Router();

const campsiteService = container.resolve<CampsiteService>(TOKENS.CampsiteService);
const campsiteController = new CampsiteController(campsiteService);

const reviewService = container.resolve<ReviewService>(TOKENS.ReviewService);
const reviewController = new ReviewController(reviewService);

// Public routes
campsiteRoutes.get("/", campsiteController.searchCampsites);

// Campsite reviews routes (must be before /:idOrSlug)
campsiteRoutes.get("/:campsiteId/reviews", reviewController.getCampsiteReviews);
campsiteRoutes.get("/:campsiteId/reviews/stats", reviewController.getCampsiteReviewStats);

campsiteRoutes.get("/:idOrSlug", campsiteController.getCampsite);
campsiteRoutes.get("/:id/availability", campsiteController.checkAvailability);

// Protected routes (host/admin)
campsiteRoutes.post("/", authenticate, campsiteController.createCampsite);
campsiteRoutes.get("/my/list", authenticate, campsiteController.getMyCampsites);
campsiteRoutes.patch("/:id", authenticate, campsiteController.updateCampsite);
campsiteRoutes.delete("/:id", authenticate, campsiteController.deleteCampsite);

export default campsiteRoutes;
