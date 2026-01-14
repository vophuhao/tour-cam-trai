import { container, TOKENS } from '@/di';
import RatingService  from '@/services/rating.service';
import { Router } from "express";
import RatingController from '@/controllers/rating.controller';
import authenticate from '@/middleware/authenticate';


const ratingRoutes = Router();

const ratingService= container.resolve<RatingService>(TOKENS.RatingService);
const ratingController = new RatingController(ratingService);

ratingRoutes.post("/", authenticate, ratingController.createRating);
ratingRoutes.get("/product/:productId", ratingController.getRatingsByProductId);
ratingRoutes.get("/user/:userId", ratingController.getRatingsByUserId);
ratingRoutes.put("/:id", ratingController.updateRating);
ratingRoutes.delete("/:id", ratingController.deleteRating);
ratingRoutes.get("/all", ratingController.getAllRatings);
ratingRoutes.post("/admin/reply/:id", ratingController.adminReplyToRating);
export default ratingRoutes;
