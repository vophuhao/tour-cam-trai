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
        const result = await this.ratingService.updateRating(id || "", req.body);
        return ResponseUtil.success(res, result, "Cập nhật đánh giá thành công");
    }

    );
    deleteRating = catchErrors(async (req, res) => {
        const { id } = req.params;
        const result = await this.ratingService.deleteRating(id!);
        return ResponseUtil.success(res, null, result.message);
    }
    );
    getAllRatings = catchErrors(async (req, res) => {
        const ratings = await this.ratingService.getAllRatings();
        return ResponseUtil.success(res, ratings, "Lấy tất cả đánh giá thành công");
    }
    );
    adminReplyToRating = catchErrors(async (req, res) => {  
        const { id } = req.params;
        const { message } = req.body;
        const result = await this.ratingService.adminReplyToRating(id!, message);
        return ResponseUtil.success(res, result, "Phản hồi đánh giá thành công");
    }
    );
}