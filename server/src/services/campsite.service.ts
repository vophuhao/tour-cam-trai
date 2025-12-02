import { ErrorFactory } from "@/errors";
import { AvailabilityModel, BookingModel, CampsiteModel, type CampsiteDocument } from "@/models";
import appAssert from "@/utils/app-assert";
import type {
  CreateCampsiteInput,
  SearchCampsiteInput,
  UpdateCampsiteInput,
} from "@/validators/campsite.validator";
import { isValidObjectId } from "mongoose";

export class CampsiteService {
  /**
   * Create new campsite (chỉ user có role host hoặc admin)
   */
  async createCampsite(hostId: string, input: CreateCampsiteInput): Promise<CampsiteDocument> {
    // Auto-generate slug nếu không có
    const slug = input.slug || this.generateSlug(input.name);

    // Check duplicate slug
    const existingCampsite = await CampsiteModel.findOne({ slug });
    appAssert(!existingCampsite, ErrorFactory.conflict("Slug đã tồn tại"));

    const campsite = await CampsiteModel.create({
      ...input,
      slug,
      host: hostId,
    });

    return campsite;
  }

  /**
   * Get campsite by ID or slug
   */

  async getCampsite(idOrSlug: string): Promise<CampsiteDocument> {
    const query = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

    const campsite = await CampsiteModel.findOne(query)
      .populate("host", "name email avatar")
      .populate("amenities")
      .populate("activities");

    appAssert(campsite, ErrorFactory.resourceNotFound("Campsite"));

    return campsite!;
  }

  /**
   * Update campsite (chỉ host hoặc admin)
   */
  async updateCampsite(
    campsiteId: string,
    hostId: string,
    input: UpdateCampsiteInput
  ): Promise<CampsiteDocument> {
    const campsite = await CampsiteModel.findById(campsiteId);
    console.log('Updating campsite:', campsiteId, 'with input:', input);
    appAssert(campsite, ErrorFactory.resourceNotFound("Campsite"));
    appAssert(
      campsite!.host.toString() === hostId,
      ErrorFactory.forbidden("Bạn không có quyền chỉnh sửa campsite này")
    );

    // Update slug if name changed
    if (input.name && input.name !== campsite!.name) {
      input.slug = this.generateSlug(input.name);
    }

    Object.assign(campsite, input);
    await campsite!.save();

    return campsite;
  }

  /**
   * Delete campsite (soft delete - chỉ deactivate)
   */
  async deleteCampsite(campsiteId: string, hostId: string): Promise<void> {
    const campsite = await CampsiteModel.findById(campsiteId);
    appAssert(campsite, ErrorFactory.resourceNotFound("Campsite"));
    appAssert(
      campsite.host.toString() === hostId,
      ErrorFactory.forbidden("Bạn không có quyền xóa campsite này")
    );

    await campsite.deactivate();
  }

  /**
   * Search and filter campsites with pagination
   */
  async searchCampsites(input: SearchCampsiteInput) {
    const {
      search,
      city,
      state,
      lat,
      lng,
      radius,
      propertyType,
      minGuests,
      minPrice,
      maxPrice,
      amenities,
      activities,
      allowPets,
      isInstantBook,
      checkIn,
      checkOut,
      sort,
      page,
      limit,
    } = input;

    // SPECIAL CASE: Geospatial search requires aggregation pipeline
    if (lat && lng && radius) {
      return this.searchCampsitesWithGeoNear(input);
    }

    // Build query for normal search
    const query: any = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location filters
    if (city) query["location.city"] = new RegExp(city, "i");
    if (state) query["location.state"] = new RegExp(state, "i");

    // Property filters
    if (propertyType) {
      query.propertyType = Array.isArray(propertyType) ? { $in: propertyType } : propertyType;
    }
    if (minGuests) query["capacity.maxGuests"] = { $gte: minGuests };

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query["pricing.basePrice"] = {};
      if (minPrice !== undefined) query["pricing.basePrice"].$gte = minPrice;
      if (maxPrice !== undefined) query["pricing.basePrice"].$lte = maxPrice;
    }

    // Amenities filter - $in means has at least one of the selected amenities
    if (amenities && amenities.length > 0) {
      query.amenities = { $in: amenities };
    }

    // Activities filter - $in means has at least one of the selected activities
    if (activities && activities.length > 0) {
      query.activities = { $in: activities };
    }

    // Preferences
    if (allowPets !== undefined) query["rules.allowPets"] = allowPets;
    if (isInstantBook !== undefined) query.isInstantBook = isInstantBook;

    // Date availability check
    if (checkIn && checkOut) {
      const unavailableCampsites = await this.getUnavailableCampsites(checkIn, checkOut);
      if (unavailableCampsites.length > 0) {
        query._id = { $nin: unavailableCampsites };
      }
    }

    // Sorting
    let sortOption: any = {};
    switch (sort) {
      case "price-asc":
        sortOption = { "pricing.basePrice": 1 };
        break;
      case "price-desc":
        sortOption = { "pricing.basePrice": -1 };
        break;
      case "rating":
        sortOption = { "rating.average": -1, "rating.count": -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "popular":
      default:
        sortOption = { bookingsCount: -1, "rating.average": -1 };
        break;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [campsites, total] = await Promise.all([
      CampsiteModel.find(query)
        .populate("host", "name avatar")
        .populate("amenities", "name icon category")
        .populate("activities", "name icon category")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      CampsiteModel.countDocuments(query),
    ]);

    return {
      data: campsites,
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
   * Search campsites with geospatial near query using aggregation
   */
  private async searchCampsitesWithGeoNear(input: SearchCampsiteInput) {
    const {
      search,
      // city and state are ignored in geospatial search
      // city,
      // state,
      lat,
      lng,
      radius,
      propertyType,
      minGuests,
      minPrice,
      maxPrice,
      amenities,
      activities,
      allowPets,
      isInstantBook,
      checkIn,
      checkOut,
      sort,
      page,
      limit,
    } = input;

    const pipeline: any[] = [];

    // $geoNear must be the first stage in aggregation
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng!, lat!], // [longitude, latitude]
        },
        distanceField: "distance",
        maxDistance: radius! * 1000, // convert km to meters
        spherical: true,
        query: { isActive: true }, // Base filter
      },
    });

    // Build match conditions for other filters
    const matchConditions: any = {};

    // Text search (not supported with $geoNear, use $text in query above or filter after)
    if (search) {
      matchConditions.$text = { $search: search };
    }

    // NOTE: When using geospatial search, we don't filter by city/state
    // because coordinates already define the location and radius.
    // The city/state params are only for display purposes.

    // Property filters
    if (propertyType) matchConditions.propertyType = propertyType;
    if (minGuests) matchConditions["capacity.maxGuests"] = { $gte: minGuests };

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      matchConditions["pricing.basePrice"] = {};
      if (minPrice !== undefined) matchConditions["pricing.basePrice"].$gte = minPrice;
      if (maxPrice !== undefined) matchConditions["pricing.basePrice"].$lte = maxPrice;
    }

    // Amenities filter
    if (amenities && amenities.length > 0) {
      matchConditions.amenities = { $all: amenities };
    }

    // Activities filter
    if (activities && activities.length > 0) {
      matchConditions.activities = { $all: activities };
    }

    // Preferences
    if (allowPets !== undefined) matchConditions["rules.allowPets"] = allowPets;
    if (isInstantBook !== undefined) matchConditions.isInstantBook = isInstantBook;

    // Date availability check
    if (checkIn && checkOut) {
      const unavailableCampsites = await this.getUnavailableCampsites(checkIn, checkOut);
      if (unavailableCampsites.length > 0) {
        matchConditions._id = { $nin: unavailableCampsites };
      }
    }

    // Add match stage if there are conditions
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Sorting (distance is default from $geoNear)
    let sortOption: any = { distance: 1 }; // Default: nearest first
    switch (sort) {
      case "price-asc":
        sortOption = { "pricing.basePrice": 1, distance: 1 };
        break;
      case "price-desc":
        sortOption = { "pricing.basePrice": -1, distance: 1 };
        break;
      case "rating":
        sortOption = { "rating.average": -1, "rating.count": -1, distance: 1 };
        break;
      case "newest":
        sortOption = { createdAt: -1, distance: 1 };
        break;
      case "popular":
        sortOption = { bookingsCount: -1, "rating.average": -1, distance: 1 };
        break;
      // case "distance" or default
      default:
        sortOption = { distance: 1 };
        break;
    }
    pipeline.push({ $sort: sortOption });

    // Count total (before pagination)
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await CampsiteModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Populate (using $lookup)
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "host",
          foreignField: "_id",
          as: "host",
          pipeline: [{ $project: { name: 1, avatar: 1 } }],
        },
      },
      { $unwind: { path: "$host", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "amenities",
          localField: "amenities",
          foreignField: "_id",
          as: "amenities",
          pipeline: [{ $project: { name: 1, icon: 1, category: 1 } }],
        },
      },
      {
        $lookup: {
          from: "activities",
          localField: "activities",
          foreignField: "_id",
          as: "activities",
          pipeline: [{ $project: { name: 1, icon: 1, category: 1 } }],
        },
      }
    );

    // Execute aggregation
    const campsites = await CampsiteModel.aggregate(pipeline);

    return {
      data: campsites as any[],
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
   * Get campsites của 1 host cụ thể
   */
  async getHostCampsites(hostId: string): Promise<CampsiteDocument[]> {
    const campsites = await CampsiteModel.find({ host: hostId })
      .populate("amenities", "name icon")
      .populate("activities", "name icon")
      .sort({ createdAt: -1 });

    return campsites;
  }

  /**
   * Increment views count
   */
  async incrementViews(campsiteId: string): Promise<void> {
    const query = isValidObjectId(campsiteId) ? { _id: campsiteId } : { slug: campsiteId };
    const campsite = await CampsiteModel.findOne(query);
    if (campsite) {
      await campsite.incrementViews();
    }
  }

  /**
   * Get all availability records for a campsite (for calendar display)
   */
  async getCampsiteAvailability(campsiteId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get next 365 days of availability
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 365);

    const availabilityRecords = await AvailabilityModel.find({
      campsite: campsiteId,
      date: { $gte: today, $lte: endDate },
    }).sort({ date: 1 });

    return availabilityRecords;
  }

  /**
   * Check availability cho date range
   */
  async checkAvailability(campsiteId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw ErrorFactory.badRequest("Invalid date format");
    }

    // Check in Availability collection
    const blockedDates = await AvailabilityModel.countDocuments({
      campsite: campsiteId,
      date: { $gte: checkInDate, $lt: checkOutDate },
      isAvailable: false,
    });

    if (blockedDates > 0) return false;

    // Check overlapping bookings
    const overlappingBooking = await BookingModel.findOne({
      campsite: campsiteId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    return !overlappingBooking;
  }

  /**
   * Get list of unavailable campsite IDs for date range
   */
  private async getUnavailableCampsites(checkIn: string, checkOut: string): Promise<string[]> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Get campsites with blocked dates
    const blockedCampsites = await AvailabilityModel.distinct("campsite", {
      date: { $gte: checkInDate, $lt: checkOutDate },
      isAvailable: false,
    });

    // Get campsites with overlapping bookings
    const bookedCampsites = await BookingModel.distinct("campsite", {
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    // Combine and deduplicate
    return Array.from(
      new Set([...blockedCampsites, ...bookedCampsites].map((id) => id.toString()))
    );
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
