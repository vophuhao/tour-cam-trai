import { ErrorFactory } from "@/errors";
import {
  BookingModel,
  PropertyModel,
  ReviewModel,
  SiteModel,
  type PropertyDocument,
} from "@/models";
import appAssert from "@/utils/app-assert";
import type {
  CreatePropertyInput,
  SearchPropertyInput,
  UpdatePropertyInput,
} from "@/validators/property.validator";
import mongoose, { isValidObjectId } from "mongoose";

export class PropertyService {
  /**
   * Create new property (host or admin only)
   */
  async createProperty(hostId: string, input: CreatePropertyInput): Promise<PropertyDocument> {
    // Auto-generate slug if not provided
    const slug = input.slug || this.generateSlug(input.name);

    // Check duplicate slug
    const existingProperty = await PropertyModel.findOne({ slug });
    appAssert(!existingProperty, ErrorFactory.conflict("Slug đã tồn tại"));

    const property = await PropertyModel.create({
      ...input,
      slug,
      host: hostId,
      isActive: false, // Start inactive until sites are added
    });

    return property;
  }

  /**
   * Get property by ID or slug
   */
  async getProperty(idOrSlug: string): Promise<PropertyDocument> {
    const query = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

    const property = await PropertyModel.findOne(query).populate(
      "host",
      "name email avatar phoneNumber"
    );

    appAssert(property, ErrorFactory.resourceNotFound("Property"));

    // Increment view count
    await property!.incrementViews();

    return property!;
  }

  /**
   * Get property with sites
   */
  async getPropertyWithSites(idOrSlug: string) {
    const property = await this.getProperty(idOrSlug);

    // Get all active sites for this property
    const sites = await SiteModel.find({
      property: property._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    return {
      property,
      sites,
      siteCount: sites.length,
    };
  }

  /**
   * Update property (host or admin only)
   */
  async updateProperty(
    propertyId: string,
    hostId: string,
    input: UpdatePropertyInput,
    isAdmin = false
  ): Promise<PropertyDocument> {
    const property = await PropertyModel.findById(propertyId);
    appAssert(property, ErrorFactory.resourceNotFound("Property"));

    // Check ownership unless admin
    if (!isAdmin) {
      appAssert(
        property!.host.toString() === hostId,
        ErrorFactory.forbidden("Bạn không có quyền chỉnh sửa property này")
      );
    }

    // Update slug if name changed
    if (input.name && input.name !== property!.name) {
      input.slug = this.generateSlug(input.name);
    }

    Object.assign(property, input);
    await property!.save();

    return property;
  }

  /**
   * Delete property (soft delete - deactivate only)
   */
  async deleteProperty(propertyId: string, hostId: string, isAdmin = false): Promise<void> {
    const property = await PropertyModel.findById(propertyId);
    appAssert(property, ErrorFactory.resourceNotFound("Property"));

    // Check ownership unless admin
    if (!isAdmin) {
      appAssert(
        property.host.toString() === hostId,
        ErrorFactory.forbidden("Bạn không có quyền xóa property này")
      );
    }

    // Deactivate property and all its sites
    await property.deactivate();
    await SiteModel.updateMany({ property: propertyId }, { isActive: false });
  }

  /**
   * Activate property
   */
  async activateProperty(
    propertyId: string,
    hostId: string,
    isAdmin = false
  ): Promise<PropertyDocument> {
    const property = await PropertyModel.findById(propertyId);
    appAssert(property, ErrorFactory.resourceNotFound("Property"));

    // Check ownership unless admin
    if (!isAdmin) {
      appAssert(
        property.host.toString() === hostId,
        ErrorFactory.forbidden("Bạn không có quyền kích hoạt property này")
      );
    }

    // Check if property has at least one active site
    const siteCount = await SiteModel.countDocuments({ property: propertyId, isActive: true });
    appAssert(siteCount > 0, ErrorFactory.badRequest("Property phải có ít nhất 1 site hoạt động"));

    await property.activate();
    return property;
  }

  /**
   * Search and filter properties with pagination
   */
  async searchProperties(input: SearchPropertyInput) {
    const {
      search,
      city,
      state,
      country,
      checkIn,
      checkOut,
      guests,
      pets,
      lat,
      lng,
      radius,
      propertyType,
      campingStyle,
      amenities,
      instantBooking,
      instantBook, // Alias from frontend
      isActive,
      isFeatured,
      isVerified,
      host,
      minRating,
      sortBy,
      page,
      limit,
    } = input;

    // Use instantBook if instantBooking not provided (frontend sends instantBook)
    const shouldFilterInstantBook = instantBook ?? instantBooking;

    const query: any = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location filters
    if (city) query["location.city"] = new RegExp(city, "i");
    if (state) query["location.state"] = new RegExp(state, "i");
    if (country) query["location.country"] = country;

    // Geospatial search (near location)
    // Use $near ONLY when sorting by distance (or no sort)
    // Use $geoWithin when sorting by other fields (MongoDB restriction)
    if (lat && lng && radius) {
      const useNearSort = !sortBy || sortBy === "nearestFirst";

      if (useNearSort) {
        query["location.coordinates"] = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat], // [lng, lat]
            },
            $maxDistance: radius * 1000, // convert km to meters
          },
        };
      } else {
        // Use $geoWithin for filtering without geospatial sort
        query["location.coordinates"] = {
          $geoWithin: {
            $centerSphere: [[lng, lat], radius / 6378.1], // radius in km, Earth radius in km
          },
        };
      }
    }

    // Property type filter
    if (propertyType && propertyType.length > 0) {
      query.propertyType = { $in: propertyType };
    }

    // Note: Amenity filters like hasToilets, hasShowers, hasParking, hasWifi, hasElectricity, hasWater
    // are no longer applicable at Property level since sharedAmenities field was removed.
    // These filters should be handled at Site level instead.

    // Amenities filter - CRITICAL ARCHITECTURE NOTE:
    // - Property model has NO 'amenities' field
    // - Amenities are stored at Site level as ObjectId[] refs to Amenity model
    // - Strategy: Query Sites with matching amenity IDs, get Property IDs
    let amenityPropertyIds: mongoose.Types.ObjectId[] | undefined;
    if (amenities && amenities.length > 0) {
      // Query sites that have any of the requested amenities
      const sitesWithAmenities = await SiteModel.find({
        amenities: { $in: amenities.filter((id) => isValidObjectId(id)) },
        isActive: true,
      })
        .select("property")
        .lean();

      amenityPropertyIds = [...new Set(sitesWithAmenities.map((s) => s.property))];

      // If no sites match, return empty results
      if (amenityPropertyIds.length === 0) {
        return {
          properties: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        };
      }

      // Add to query - merge with existing _id filter if present
      if (query._id) {
        // Merge with existing filters
        const existingIds = query._id.$in || [];
        query._id = { $in: existingIds.filter((id: any) => amenityPropertyIds!.includes(id)) };

        // If no overlap, return empty
        if (query._id.$in.length === 0) {
          return {
            properties: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0,
            },
          };
        }
      } else {
        query._id = { $in: amenityPropertyIds };
      }
    }

    // Date range & capacity availability filter
    // Strategy: Query sites that are available and have sufficient capacity,
    // then filter properties that have those sites
    let availabilityPropertyIds: mongoose.Types.ObjectId[] | undefined;
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Validate dates
      if (checkInDate >= checkOutDate) {
        return {
          properties: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        };
      }

      // Calculate number of nights
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Build site query for availability
      const siteQuery: any = { isActive: true };

      // Capacity filters
      if (guests) {
        siteQuery["capacity.maxGuests"] = { $gte: guests };
      }
      if (pets && pets > 0) {
        siteQuery["capacity.maxPets"] = { $gte: pets };
      }

      // Booking settings filters - nights must be within min/max range
      siteQuery["bookingSettings.minimumNights"] = { $lte: nights };
      // maximumNights is optional, so only filter if it exists and is set
      siteQuery.$or = [
        { "bookingSettings.maximumNights": { $exists: false } },
        { "bookingSettings.maximumNights": null },
        { "bookingSettings.maximumNights": { $gte: nights } },
      ];

      // Find all potentially available sites
      const candidateSites = await SiteModel.find(siteQuery).select("_id property").lean();

      if (candidateSites.length === 0) {
        return {
          properties: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        };
      }

      const candidateSiteIds = candidateSites.map((s) => s._id);

      // Find conflicting bookings for these sites
      const conflictingBookings = await BookingModel.find({
        site: { $in: candidateSiteIds },
        status: { $in: ["pending", "confirmed"] }, // Only active bookings
        $or: [
          // Booking starts during search period
          { checkIn: { $gte: checkInDate, $lt: checkOutDate } },
          // Booking ends during search period
          { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
          // Booking spans entire search period
          { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
        ],
      })
        .select("site")
        .lean();

      const bookedSiteIds = new Set(conflictingBookings.map((b) => b.site.toString()));

      // Filter out booked sites
      const availableSites = candidateSites.filter((s) => !bookedSiteIds.has(s._id.toString()));

      if (availableSites.length === 0) {
        return {
          properties: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        };
      }

      availabilityPropertyIds = [...new Set(availableSites.map((s) => s.property))];

      // Merge with existing filters
      if (query._id) {
        const existingIds = query._id.$in || [];
        query._id = { $in: existingIds.filter((id: any) => availabilityPropertyIds!.includes(id)) };

        if (query._id.$in.length === 0) {
          return {
            properties: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0,
            },
          };
        }
      } else {
        query._id = { $in: availabilityPropertyIds };
      }
    } else if (guests || (pets && pets > 0)) {
      // No date range but have capacity requirements
      // Query sites with sufficient capacity
      const capacityQuery: any = { isActive: true };

      if (guests) {
        capacityQuery["capacity.maxGuests"] = { $gte: guests };
      }
      if (pets && pets > 0) {
        capacityQuery["capacity.maxPets"] = { $gte: pets };
      }

      const sitesWithCapacity = await SiteModel.find(capacityQuery).select("property").lean();

      if (sitesWithCapacity.length === 0) {
        return {
          properties: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        };
      }

      const capacityPropertyIds = [...new Set(sitesWithCapacity.map((s) => s.property))];

      // Merge with existing filters
      if (query._id) {
        const existingIds = query._id.$in || [];
        query._id = { $in: existingIds.filter((id: any) => capacityPropertyIds.includes(id)) };

        if (query._id.$in.length === 0) {
          return {
            properties: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0,
            },
          };
        }
      } else {
        query._id = { $in: capacityPropertyIds };
      }
    }

    // AccommodationType filter - query sites and get matching property IDs
    // Frontend sends: "tent", "rv", or "glamping"
    // "glamping" expands to all glamping accommodation types
    let accommodationPropertyIds: mongoose.Types.ObjectId[] | undefined;
    if (campingStyle && campingStyle.length > 0) {
      // Map simplified types to actual accommodationTypes
      const glampingTypes = [
        "cabin",
        "yurt",
        "treehouse",
        "tiny_home",
        "safari_tent",
        "bell_tent",
        "glamping_pod",
        "dome",
        "airstream",
        "vintage_trailer",
        "van",
      ];

      const accommodationTypes: string[] = [];
      campingStyle.forEach((style) => {
        if (style === "tent") {
          accommodationTypes.push("tent");
        } else if (style === "rv") {
          accommodationTypes.push("rv");
        } else if (style === "glamping") {
          accommodationTypes.push(...glampingTypes);
        }
      });

      const sitesWithAccommodation = await SiteModel.find({
        accommodationType: { $in: accommodationTypes },
        isActive: true,
      })
        .select("property")
        .lean();

      accommodationPropertyIds = [...new Set(sitesWithAccommodation.map((s) => s.property))];

      // If no sites match, return empty results
      if (accommodationPropertyIds.length === 0) {
        return {
          properties: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        };
      }

      // Merge with existing filters
      if (query._id) {
        const existingIds = query._id.$in || [];
        query._id = {
          $in: existingIds.filter((id: any) => accommodationPropertyIds!.includes(id)),
        };

        if (query._id.$in.length === 0) {
          return {
            properties: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0,
            },
          };
        }
      } else {
        query._id = { $in: accommodationPropertyIds };
      }
    }

    // Note: Pet and children policies removed from Property model
    // These filters are no longer applicable at property level

    // InstantBooking filter - check if property has instant booking enabled
    // OR if it has at least one site with instant booking
    if (shouldFilterInstantBook === true) {
      // Properties with instant booking enabled at property level
      query["settings.instantBookEnabled"] = true;
    }

    // Status filters
    if (isActive !== undefined) query.isActive = isActive;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;
    if (isVerified !== undefined) query.isVerified = isVerified;

    // Host filter
    if (host) query.host = host;

    // Rating filter
    if (minRating) query["rating.average"] = { $gte: minRating };

    // Sorting
    let sort: any = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "rating":
        sort = { "rating.average": -1, "rating.count": -1 };
        break;
      case "reviewCount":
        sort = { "stats.totalReviews": -1 };
        break;
      case "minPrice-asc":
        sort = { minPrice: 1 };
        break;
      case "minPrice-desc":
        sort = { minPrice: -1 };
        break;
      case "name":
        sort = { name: 1 };
        break;
      case "totalSites":
        sort = { totalSites: -1 };
        break;
      case "nearestFirst":
        // Geospatial sort already handled by $near
        break;
      default:
        sort = { "stats.totalReviews": -1 }; // Default to popular
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Check if we need to sort by minPrice - requires aggregation pipeline
    const needsMinPriceSort = sortBy === "minPrice-asc" || sortBy === "minPrice-desc";

    if (needsMinPriceSort) {
      // Use aggregation pipeline to join with sites and calculate minPrice
      const pipeline: any[] = [
        { $match: query },
        {
          $lookup: {
            from: "sites",
            localField: "_id",
            foreignField: "property",
            as: "sites",
          },
        },
        {
          $addFields: {
            minPrice: {
              $ifNull: [
                {
                  $min: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$sites",
                          as: "site",
                          cond: { $eq: ["$$site.isActive", true] },
                        },
                      },
                      as: "site",
                      in: "$$site.pricing.basePrice",
                    },
                  },
                },
                999999999, // Default high value if no active sites
              ],
            },
          },
        },
        { $sort: sortBy === "minPrice-asc" ? { minPrice: 1 } : { minPrice: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "host",
            foreignField: "_id",
            as: "host",
          },
        },
        { $unwind: { path: "$host", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            sites: 0, // Remove sites array to avoid bloat
            "host.password": 0,
            "host.email": 0,
          },
        },
      ];

      const [properties, totalResult] = await Promise.all([
        PropertyModel.aggregate(pipeline),
        PropertyModel.countDocuments(query),
      ]);

      return {
        properties,
        pagination: {
          page,
          limit,
          total: totalResult,
          pages: Math.ceil(totalResult / limit),
        },
      };
    }

    // Standard query for non-price sorts
    const [properties, total] = await Promise.all([
      PropertyModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("host", "name avatar")
        .lean(),
      PropertyModel.countDocuments(query),
    ]);

    // Populate minPrice from sites for each property
    const propertiesWithMinPrice = await Promise.all(
      properties.map(async (property) => {
        const minPriceSite = await SiteModel.findOne({
          property: property._id,
          isActive: true,
        })
          .sort({ "pricing.basePrice": 1 })
          .select("pricing.basePrice")
          .lean();

        return {
          ...property,
          minPrice: minPriceSite?.pricing?.basePrice || 0,
        };
      })
    );

    return {
      properties: propertiesWithMinPrice,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get properties by host
   */
  async getPropertiesByHost(hostId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      PropertyModel.find({ host: hostId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PropertyModel.countDocuments({ host: hostId }),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get property statistics for host dashboard
   */
  async getPropertyStats(propertyId: string, hostId: string) {
    const property = await PropertyModel.findById(propertyId);
    appAssert(property, ErrorFactory.resourceNotFound("Property"));
    appAssert(
      property.host.toString() === hostId,
      ErrorFactory.forbidden("Bạn không có quyền xem thống kê property này")
    );

    // Get site statistics
    const sites = await SiteModel.find({ property: propertyId });
    const activeSites = sites.filter((s) => s.isActive);

    return {
      property: {
        name: property.name,
        totalSites: property.stats.totalSites,
        activeSites: activeSites.length,
        rating: property.rating,
        stats: property.stats,
      },
      sites: sites.map((s) => ({
        id: s._id,
        name: s.name,
        accommodationType: s.accommodationType,
        isActive: s.isActive,
        rating: s.rating,
        stats: s.stats,
      })),
    };
  }

  /**
   * Update property stats (called when booking/review created)
   */
  async updatePropertyStats(propertyId: string): Promise<void> {
    const property = await PropertyModel.findById(propertyId);
    if (!property) return;

    await property.updateStats();
  }

  /**
   * Update property rating based on reviews
   */
  async updatePropertyRating(propertyId: string): Promise<void> {
    const reviews = await ReviewModel.find({
      property: propertyId,
      isPublished: true,
    });

    if (reviews.length === 0) {
      await PropertyModel.findByIdAndUpdate(propertyId, {
        rating: {
          average: 0,
          count: 0,
          breakdown: {
            location: 0,
            communication: 0,
            value: 0,
          },
        },
      });
      return;
    }

    // Calculate averages
    const totals = reviews.reduce(
      (acc, review) => {
        acc.overall += review.overallRating;
        acc.location += review.propertyRatings.location;
        acc.communication += review.propertyRatings.communication;
        acc.value += review.propertyRatings.value;
        return acc;
      },
      { overall: 0, location: 0, communication: 0, value: 0 }
    );

    const count = reviews.length;
    const rating = {
      average: Math.round((totals.overall / count) * 10) / 10,
      count,
      breakdown: {
        location: Math.round((totals.location / count) * 10) / 10,
        communication: Math.round((totals.communication / count) * 10) / 10,
        value: Math.round((totals.value / count) * 10) / 10,
      },
    };

    await PropertyModel.findByIdAndUpdate(propertyId, { rating });
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 200);
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit = 10) {
    return PropertyModel.find({
      isFeatured: true,
      isActive: true,
    })
      .sort({ "rating.average": -1 })
      .limit(limit)
      .populate("host", "name avatar")
      .lean();
  }

  /**
   * Get nearby properties
   */
  async getNearbyProperties(propertyId: string, radius = 50, limit = 10) {
    const property = await PropertyModel.findById(propertyId);
    appAssert(property, ErrorFactory.resourceNotFound("Property"));

    const [lng, lat] = property!.location.coordinates.coordinates;

    return PropertyModel.find({
      _id: { $ne: propertyId },
      isActive: true,
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000,
        },
      },
    })
      .limit(limit)
      .populate("host", "name avatar")
      .lean();
  }
}

export default new PropertyService();
// trigger reload
