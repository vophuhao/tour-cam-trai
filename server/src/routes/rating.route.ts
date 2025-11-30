import { container, TOKENS } from '@/di';
import RatingService  from '@/services/rating.service';
import { Router } from "express";
import RatingController from '@/controllers/rating.controller';


const ratingRoutes = Router();

const ratingService= container.resolve<RatingService>(TOKENS.RatingService);
const ratingController = new RatingController(ratingService);

ratingRoutes.post("/", ratingController.createRating);
ratingRoutes.get("/product/:productId", ratingController.getRatingsByProductId);
ratingRoutes.get("/user/:userId", ratingController.getRatingsByUserId);
ratingRoutes.put("/:id", ratingController.updateRating);
ratingRoutes.delete("/:id", ratingController.deleteRating);

export default ratingRoutes;
