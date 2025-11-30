import { catchErrors } from "@/errors";
import type RatingService from "@/services/rating.service";

import ResponseUtil from "@/utils/response";


export default class RatingController {

    constructor(private readonly ratingService: RatingService) { }

    createRating = catchErrors(async (req, res) => {
        const result = await this.ratingService.createRating(req.body, req.userId.toString());

        return ResponseUtil.success(res, result.ratings, result.message);
    }
    );
    getRatingsByProductId = catchErrors(async (req, res) => {
        const { productId } = req.params;
        const ratings = await this.ratingService.getRatingsByProductId(productId!.toString());
        return ResponseUtil.success(res, ratings, "Lấy đánh giá thành công");
    }
    );
    getRatingsByUserId = catchErrors(async (req, res) => {
        const { userId } = req.params;
        const ratings = await this.ratingService.getRatingsByUserId(userId!.toString());
        return ResponseUtil.success(res, ratings, "Lấy đánh giá thành công");
    }
    );
    updateRating = catchErrors(async (req, res) => {
        const { id } = req.params;
        const result = await this.ratingService.updateRating(id, req.body);
        return ResponseUtil.success(res, result.rating, result.message);
    }

    );
    deleteRating = catchErrors(async (req, res) => {
        const { id } = req.params;
        const result = await this.ratingService.deleteRating(id!);
        return ResponseUtil.success(res, null, result.message);
    }
    );
}