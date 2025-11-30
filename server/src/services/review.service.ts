import { ErrorFactory } from "@/errors";
import { BookingModel, CampsiteModel, ReviewModel, type ReviewDocument } from "@/models";
import appAssert from "@/utils/app-assert";
import type {
  CreateReviewInput,
  HostResponseInput,
  SearchReviewInput,
} from "@/validators/review.validator";

export class ReviewService {
  /**
   * Create review (guest review campsite after stay)
   */
  async createReview(guestId: string, input: CreateReviewInput): Promise<ReviewDocument> {
    const { booking: bookingId, ratings, title, comment, pros, cons, images } = input;

    // Get booking
    const booking = await BookingModel.findById(bookingId);
    appAssert(booking, ErrorFactory.resourceNotFound("Booking"));
    appAssert(
      booking!.guest.toString() === guestId,
      ErrorFactory.forbidden("Bạn không phải guest của booking này")
    );
    appAssert(
      booking!.status === "completed",
      ErrorFactory.badRequest("Chỉ có thể review sau khi hoàn thành booking")
    );
    appAssert(!booking!.reviewed, ErrorFactory.conflict("Booking này đã được review"));

    // Create review
    const review = await ReviewModel.create({
      campsite: booking!.campsite,
      booking: bookingId,
      guest: guestId,
      host: booking!.host,
      ratings,
      title,
      comment,
      pros,
      cons,
      images,
      isVerified: true, // verified vì có booking thật
    });

    // Mark booking as reviewed
    booking!.reviewed = true;
    booking!.review = review._id as any;
    await booking!.save();

    // Update campsite rating
    await this.updateCampsiteRating(booking!.campsite.toString());

    return review;
  }

  /**
   * Get review by ID
   */
  async getReview(reviewId: string): Promise<ReviewDocument> {
    const review = await ReviewModel.findById(reviewId)
      .populate("campsite", "name slug images")
      .populate("guest", "name avatar")
      .populate("host", "name");

    appAssert(review, ErrorFactory.resourceNotFound("Review"));
    return review!;
  }

  /**
   * Add host response to review
   */
  async addHostResponse(
    reviewId: string,
    hostId: string,
    input: HostResponseInput
  ): Promise<ReviewDocument> {
    const review = await ReviewModel.findById(reviewId);
    appAssert(review, ErrorFactory.resourceNotFound("Review"));
    appAssert(
      review!.host.toString() === hostId,
      ErrorFactory.forbidden("Bạn không phải host của review này")
    );
    appAssert(!review!.hostResponse, ErrorFactory.conflict("Review này đã có response"));

    await review!.addHostResponse(input.comment);
    return review!;
  }

  /**
   * Search reviews with filters
   */
  async searchReviews(input: SearchReviewInput) {
    const { campsite, guest, minRating, isPublished, isFeatured, sort, page, limit } = input;

    // Build query
    const query: any = {};

    if (campsite) query.campsite = campsite;
    if (guest) query.guest = guest;
    if (minRating !== undefined) query["ratings.overall"] = { $gte: minRating };
    if (isPublished !== undefined) query.isPublished = isPublished;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;

    // Sorting
    let sortOption: any = {};
    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "highest-rating":
        sortOption = { "ratings.overall": -1, createdAt: -1 };
        break;
      case "lowest-rating":
        sortOption = { "ratings.overall": 1, createdAt: -1 };
        break;
      case "most-helpful":
        sortOption = { helpfulCount: -1, createdAt: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      ReviewModel.find(query)
        .populate("campsite", "name slug images")
        .populate("guest", "username avatarUrl")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      ReviewModel.countDocuments(query),
    ]);

    return {
      data: reviews as any[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get reviews for specific campsite
   */
  async getCampsiteReviews(campsiteId: string, page: number = 1, limit: number = 20) {
    return this.searchReviews({
      campsite: campsiteId,
      isPublished: true,
      sort: "newest",
      page,
      limit,
    });
  }

  /**
   * Vote review as helpful/not-helpful
   */
  async voteReview(reviewId: string, voteType: "helpful" | "not-helpful"): Promise<ReviewDocument> {
    const review = await ReviewModel.findById(reviewId);
    appAssert(review, ErrorFactory.resourceNotFound("Review"));

    if (voteType === "helpful") {
      review!.helpfulCount += 1;
    } else {
      review!.notHelpfulCount += 1;
    }

    await review!.save();
    return review!;
  }

  /**
   * Publish/unpublish review (admin only)
   */
  async togglePublish(reviewId: string, isPublished: boolean): Promise<ReviewDocument> {
    const review = await ReviewModel.findById(reviewId);
    appAssert(review, ErrorFactory.resourceNotFound("Review"));

    if (isPublished) {
      await review!.publish();
    } else {
      await review!.unpublish();
    }

    return review!;
  }

  /**
   * Feature/unfeature review (admin only)
   */
  async toggleFeature(reviewId: string, isFeatured: boolean): Promise<ReviewDocument> {
    const review = await ReviewModel.findById(reviewId);
    appAssert(review, ErrorFactory.resourceNotFound("Review"));

    review!.isFeatured = isFeatured;
    await review!.save();

    return review!;
  }

  /**
   * Update campsite rating based on all reviews
   */
  private async updateCampsiteRating(campsiteId: string): Promise<void> {
    const reviews = await ReviewModel.find({
      campsite: campsiteId,
      isPublished: true,
    });

    if (reviews.length === 0) return;

    // Calculate average ratings
    const totalRatings = reviews.reduce(
      (acc, review) => {
        acc.overall += review.ratings.overall;
        acc.cleanliness += review.ratings.cleanliness;
        acc.accuracy += review.ratings.accuracy;
        acc.location += review.ratings.location;
        acc.value += review.ratings.value;
        acc.communication += review.ratings.communication;
        return acc;
      },
      {
        overall: 0,
        cleanliness: 0,
        accuracy: 0,
        location: 0,
        value: 0,
        communication: 0,
      }
    );

    const count = reviews.length;
    const averageRating = {
      average: totalRatings.overall / count,
      count,
      breakdown: {
        cleanliness: totalRatings.cleanliness / count,
        accuracy: totalRatings.accuracy / count,
        location: totalRatings.location / count,
        value: totalRatings.value / count,
        communication: totalRatings.communication / count,
      },
    };

    // Update campsite
    await CampsiteModel.findByIdAndUpdate(campsiteId, {
      rating: averageRating,
    });
  }

  /**
   * Get review stats for campsite
   */
  async getCampsiteReviewStats(campsiteId: string): Promise<any> {
    const campsite = await CampsiteModel.findById(campsiteId);
    appAssert(campsite, ErrorFactory.resourceNotFound("Campsite"));

    const reviews = await ReviewModel.find({
      campsite: campsiteId,
      isPublished: true,
    });

    // Rating distribution (1-5 stars)
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      const rating = Math.floor(review.ratings.overall);
      if (rating >= 1 && rating <= 5) {
        distribution[rating - 1] += 1;
      }
    });

    return {
      totalReviews: reviews.length,
      averageRating: campsite!.rating?.average || 0,
      breakdown: campsite!.rating?.breakdown || {},
      distribution: {
        1: distribution[0],
        2: distribution[1],
        3: distribution[2],
        4: distribution[3],
        5: distribution[4],
      },
    };
  }
}
