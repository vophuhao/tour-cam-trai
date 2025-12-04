import { ErrorFactory } from "@/errors";
import {
  AvailabilityModel,
  BookingModel,
  PropertyModel,
  ReviewModel,
  SiteModel,
  type SiteDocument,
} from "@/models";
import appAssert from "@/utils/app-assert";
import type {
  CreateSiteInput,
  SearchSiteInput,
  UpdateSiteInput,
} from "@/validators/site.validator";
import { isValidObjectId } from "mongoose";

export class SiteService {
  /**
   * Create new site (host or admin only)
   */
  async createSite(hostId: string, input: CreateSiteInput): Promise<SiteDocument> {
    // Verify property exists and belongs to host
    const property = await PropertyModel.findById(input.property);
    appAssert(property, ErrorFactory.resourceNotFound("Property"));
    appAssert(
      property.host.toString() === hostId,
      ErrorFactory.forbidden("Bạn không có quyền thêm site vào property này")
    );

    // Auto-generate slug if not provided
    const slug = input.slug || this.generateSlug(input.name);

    // Check duplicate slug within property
    const existingSite = await SiteModel.findOne({ property: input.property, slug });
    appAssert(!existingSite, ErrorFactory.conflict("Slug đã tồn tại trong property này"));

    const site = await SiteModel.create({
      ...input,
      slug,
    });

    // Update property's totalSites count
    await PropertyModel.findByIdAndUpdate(input.property, {
      $inc: { totalSites: 1 },
    });

    return site;
  }

  /**
   * Get site by ID or slug
   */
  async getSite(idOrSlug: string, propertyId?: string): Promise<SiteDocument> {
    let query: any;

    if (isValidObjectId(idOrSlug)) {
      query = { _id: idOrSlug };
    } else {
      // Slug lookup requires property ID
      appAssert(propertyId, ErrorFactory.badRequest("Property ID required for slug lookup"));
      query = { slug: idOrSlug, property: propertyId };
    }

    const site = await SiteModel.findOne(query).populate("property", "name host location").lean();

    appAssert(site, ErrorFactory.resourceNotFound("Site"));

    // Increment view count
    await SiteModel.findByIdAndUpdate(site!._id, { $inc: { "stats.views": 1 } });

    return site!;
  }

  /**
   * Get site with availability
   */
  async getSiteWithAvailability(siteId: string, checkIn?: string, checkOut?: string) {
    const site = await this.getSite(siteId);

    let availability: any = null;
    if (checkIn && checkOut) {
      availability = await this.checkAvailability(siteId, checkIn, checkOut);
    }

    return {
      site,
      availability,
    };
  }

  /**
   * Update site (host or admin only)
   */
  async updateSite(
    siteId: string,
    hostId: string,
    input: UpdateSiteInput,
    isAdmin = false
  ): Promise<SiteDocument> {
    const site = await SiteModel.findById(siteId).populate("property");
    appAssert(site, ErrorFactory.resourceNotFound("Site"));

    const property = site.property as any;

    // Check ownership unless admin
    if (!isAdmin) {
      appAssert(
        property.host.toString() === hostId,
        ErrorFactory.forbidden("Bạn không có quyền chỉnh sửa site này")
      );
    }

    // Update slug if name changed
    if (input.name && input.name !== site.name) {
      input.slug = this.generateSlug(input.name);
    }

    Object.assign(site, input);
    await site.save();

    return site;
  }

  /**
   * Delete site (soft delete - deactivate only)
   */
  async deleteSite(siteId: string, hostId: string, isAdmin = false): Promise<void> {
    const site = await SiteModel.findById(siteId).populate("property");
    appAssert(site, ErrorFactory.resourceNotFound("Site"));

    const property = site.property as any;

    // Check ownership unless admin
    if (!isAdmin) {
      appAssert(
        property.host.toString() === hostId,
        ErrorFactory.forbidden("Bạn không có quyền xóa site này")
      );
    }

    await site.deactivate();

    // Decrement property's totalSites count
    await PropertyModel.findByIdAndUpdate(site.property, {
      $inc: { totalSites: -1 },
    });
  }

  /**
   * Activate site
   */
  async activateSite(siteId: string, hostId: string, isAdmin = false): Promise<SiteDocument> {
    const site = await SiteModel.findById(siteId).populate("property");
    appAssert(site, ErrorFactory.resourceNotFound("Site"));

    const property = site.property as any;

    // Check ownership unless admin
    if (!isAdmin) {
      appAssert(
        property.host.toString() === hostId,
        ErrorFactory.forbidden("Bạn không có quyền kích hoạt site này")
      );
    }

    await site.activate();
    return site;
  }

  /**
   * Search and filter sites with pagination
   */
  async searchSites(input: SearchSiteInput) {
    const {
      property,
      search,
      siteType,
      accommodationType,
      minGuests,
      maxGuests,
      allowPets,
      allowRVs,
      minPrice,
      maxPrice,
      hasElectrical,
      hasWaterHookup,
      hasSewerHookup,
      hasFirePit,
      hasBedding,
      hasKitchen,
      hasPrivateBathroom,
      hasWifi,
      wheelchairAccessible,
      checkIn,
      checkOut,
      instantBookOnly,
      isActive,
      isAvailable,
      minRating,
      sortBy,
      page,
      limit,
    } = input;

    const query: any = {};

    // Property filter (required for listing sites within a property)
    if (property) query.property = property;

    // Text search
    if (search) {
      query.$or = [{ name: new RegExp(search, "i") }, { description: new RegExp(search, "i") }];
    }

    // Site type filter
    if (siteType && siteType.length > 0) {
      query.siteType = { $in: siteType };
    }

    // Accommodation type filter
    if (accommodationType && accommodationType.length > 0) {
      query.accommodationType = { $in: accommodationType };
    }

    // Capacity filters
    if (minGuests) query["capacity.maxGuests"] = { $gte: minGuests };
    if (maxGuests) query["capacity.maxGuests"] = { $lte: maxGuests };
    if (allowPets) query["capacity.maxPets"] = { $gt: 0 };
    if (allowRVs) query["capacity.maxRVs"] = { $gt: 0 };

    // Price range
    if (minPrice) query["pricing.basePrice"] = { $gte: minPrice };
    if (maxPrice) {
      query["pricing.basePrice"] = {
        ...query["pricing.basePrice"],
        $lte: maxPrice,
      };
    }

    // Amenity filters
    if (hasElectrical) query["amenities.electrical.available"] = true;
    if (hasWaterHookup) query["amenities.waterHookup.available"] = true;
    if (hasSewerHookup) query["amenities.sewerHookup.available"] = true;
    if (hasFirePit) query["amenities.firePit.available"] = true;
    if (hasBedding) query["amenities.bedding.available"] = true;
    if (hasKitchen) query["amenities.kitchen.available"] = true;
    if (hasPrivateBathroom) query["amenities.privateBathroom.available"] = true;
    if (hasWifi) query["amenities.wifi"] = true;
    if (wheelchairAccessible) query["amenities.accessibility.wheelchairAccessible"] = true;

    // Booking settings
    if (instantBookOnly) query["bookingSettings.allowInstantBook"] = true;

    // Status filters
    if (isActive !== undefined) query.isActive = isActive;
    if (isAvailable !== undefined) query.isAvailable = isAvailable;

    // Rating filter
    if (minRating) query["rating.average"] = { $gte: minRating };

    // Availability check
    if (checkIn && checkOut) {
      const unavailableSiteIds = await this.getUnavailableSites(checkIn, checkOut);
      query._id = { $nin: unavailableSiteIds };
    }

    // Sorting
    let sort: any = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "price-low":
        sort = { "pricing.basePrice": 1 };
        break;
      case "price-high":
        sort = { "pricing.basePrice": -1 };
        break;
      case "rating":
        sort = { "rating.average": -1, "rating.count": -1 };
        break;
      case "name":
        sort = { name: 1 };
        break;
      case "capacity":
        sort = { "capacity.maxGuests": -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [sites, total] = await Promise.all([
      SiteModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("property", "name host location")
        .lean(),
      SiteModel.countDocuments(query),
    ]);

    return {
      sites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all blocked dates for a site (for calendar display)
   */
  async getBlockedDates(siteId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all availability records where isAvailable = false
    const blockedRecords = await AvailabilityModel.find({
      site: siteId,
      date: { $gte: start, $lte: end },
      isAvailable: false,
    }).lean();

    // Get all bookings that overlap with the date range
    const bookings = await BookingModel.find({
      site: siteId,
      status: { $in: ["pending", "confirmed"] },
      checkIn: { $lte: end },
      checkOut: { $gte: start },
    }).lean();

    // Combine blocked dates from availability records and bookings
    const allBlockedDates = new Set<string>();

    // Add dates from availability records
    blockedRecords.forEach((record) => {
      allBlockedDates.add(record.date.toISOString());
    });

    // Add dates from bookings (expand booking range to individual dates)
    bookings.forEach((booking) => {
      const bookingStart = new Date(booking.checkIn);
      const bookingEnd = new Date(booking.checkOut);
      const currentDate = new Date(bookingStart);

      while (currentDate < bookingEnd) {
        if (currentDate >= start && currentDate <= end) {
          allBlockedDates.add(currentDate.toISOString());
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return {
      blockedDates: Array.from(allBlockedDates),
      totalBlocked: allBlockedDates.size,
    };
  }

  /**
   * Check site availability for date range
   */
  async checkAvailability(siteId: string, checkIn: string, checkOut: string) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for existing bookings
    const existingBooking = await BookingModel.findOne({
      site: siteId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    if (existingBooking) {
      return {
        isAvailable: false,
        reason: "Site already booked for these dates",
      };
    }

    // Check availability records
    const blockedDates = await AvailabilityModel.find({
      site: siteId,
      date: { $gte: checkInDate, $lt: checkOutDate },
      isAvailable: false,
    });

    if (blockedDates.length > 0) {
      return {
        isAvailable: false,
        reason: "Site is blocked for some dates in this range",
        blockedDates: blockedDates.map((d) => d.date),
      };
    }

    return {
      isAvailable: true,
    };
  }

  /**
   * Check group availability for undesignated sites
   * Returns true if at least 1 site in the group is available
   */
  async checkGroupAvailability(
    groupId: string,
    checkIn: string,
    checkOut: string
  ): Promise<{
    isAvailable: boolean;
    availableSiteIds?: string[];
    totalAvailable?: number;
    reason?: string;
  }> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Get all sites in the group
    const sitesInGroup = await SiteModel.find({
      "groupedSiteInfo.groupId": groupId,
      "groupedSiteInfo.isGrouped": true,
      isActive: true,
    });

    appAssert(sitesInGroup.length > 0, ErrorFactory.resourceNotFound("Undesignated group"));

    // Check availability for each site in parallel
    const availabilityChecks = await Promise.all(
      sitesInGroup.map(async (site) => {
        const availability = await this.checkAvailability(site._id.toString(), checkIn, checkOut);
        return {
          siteId: site._id.toString(),
          isAvailable: availability.isAvailable,
        };
      })
    );

    // Filter available sites
    const availableSites = availabilityChecks.filter((check) => check.isAvailable);

    if (availableSites.length === 0) {
      return {
        isAvailable: false,
        reason: "Tất cả các site trong group đã được đặt cho khoảng thời gian này",
      };
    }

    return {
      isAvailable: true,
      availableSiteIds: availableSites.map((s) => s.siteId),
      totalAvailable: availableSites.length,
    };
  }

  /**
   * Get unavailable site IDs for date range
   */
  private async getUnavailableSites(checkIn: string, checkOut: string): Promise<string[]> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Get sites with existing bookings
    const bookedSites = await BookingModel.find({
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    }).distinct("site");

    // Get sites with blocked dates
    const blockedSites = await AvailabilityModel.find({
      date: { $gte: checkInDate, $lt: checkOutDate },
      isAvailable: false,
    }).distinct("site");

    // Combine and deduplicate
    return Array.from(new Set([...bookedSites, ...blockedSites].map((id) => id.toString())));
  }

  /**
   * Calculate pricing for date range
   */
  async calculatePricing(siteId: string, checkIn: string, checkOut: string, guestCount: number) {
    const site = await SiteModel.findById(siteId);
    appAssert(site, ErrorFactory.resourceNotFound("Site"));

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const basePrice = site!.pricing.basePrice;
    let subtotal = 0;

    // Calculate nightly rates (can be weekend/seasonal pricing)
    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkInDate);
      currentDate.setDate(currentDate.getDate() + i);

      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday

      // Check seasonal pricing
      let nightPrice = basePrice;
      if (site!.pricing.seasonalPricing) {
        const seasonalRate = site!.pricing.seasonalPricing.find((season) => {
          const seasonStart = new Date(season.startDate);
          const seasonEnd = new Date(season.endDate);
          return currentDate >= seasonStart && currentDate <= seasonEnd;
        });
        if (seasonalRate) {
          nightPrice = seasonalRate.price;
        }
      }

      // Apply weekend pricing if applicable
      if (isWeekend && site!.pricing.weekendPrice) {
        nightPrice = site!.pricing.weekendPrice;
      }

      subtotal += nightPrice;
    }

    // Apply discounts
    let discount = 0;
    if (nights >= 28 && site!.pricing.discounts?.monthly) {
      discount = (subtotal * site!.pricing.discounts.monthly) / 100;
    } else if (nights >= 7 && site!.pricing.discounts?.weekly) {
      discount = (subtotal * site!.pricing.discounts.weekly) / 100;
    }

    // Calculate fees
    const fees = site!.pricing.fees || {};
    const cleaningFee = fees.cleaningFee || 0;
    const petFee = fees.petFee || 0;
    const extraGuestFee =
      guestCount > site!.capacity.maxGuests
        ? (guestCount - site!.capacity.maxGuests) * (fees.extraGuestFee || 0)
        : 0;

    const total = subtotal - discount + cleaningFee + petFee + extraGuestFee;

    return {
      nights,
      basePrice,
      subtotal,
      discount,
      fees: {
        cleaning: cleaningFee,
        pet: petFee,
        extraGuest: extraGuestFee,
      },
      total,
    };
  }

  /**
   * Update site stats (called when booking/review created)
   */
  async updateSiteStats(siteId: string): Promise<void> {
    const site = await SiteModel.findById(siteId);
    if (!site) return;

    await site.updateStats();
  }

  /**
   * Update site rating based on reviews
   */
  async updateSiteRating(siteId: string): Promise<void> {
    const reviews = await ReviewModel.find({
      site: siteId,
      isPublished: true,
    });

    if (reviews.length === 0) {
      await SiteModel.findByIdAndUpdate(siteId, {
        rating: {
          average: 0,
          count: 0,
          breakdown: {
            cleanliness: 0,
            accuracy: 0,
            amenities: 0,
          },
        },
      });
      return;
    }

    // Calculate averages
    const totals = reviews.reduce(
      (acc, review) => {
        acc.overall += review.overallRating;
        acc.cleanliness += review.siteRatings.cleanliness;
        acc.accuracy += review.siteRatings.accuracy;
        acc.amenities += review.siteRatings.amenities;
        return acc;
      },
      { overall: 0, cleanliness: 0, accuracy: 0, amenities: 0 }
    );

    const count = reviews.length;
    const rating = {
      average: Math.round((totals.overall / count) * 10) / 10,
      count,
      breakdown: {
        cleanliness: Math.round((totals.cleanliness / count) * 10) / 10,
        accuracy: Math.round((totals.accuracy / count) * 10) / 10,
        amenities: Math.round((totals.amenities / count) * 10) / 10,
      },
    };

    await SiteModel.findByIdAndUpdate(siteId, { rating });
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
   * Get sites by property
   */
  async getSitesByProperty(propertyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [sites, total] = await Promise.all([
      SiteModel.find({ property: propertyId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SiteModel.countDocuments({ property: propertyId }),
    ]);

    return {
      sites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default new SiteService();
