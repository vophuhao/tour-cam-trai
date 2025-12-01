import { AmenityModel, ActivityModel, type AmenityDocument, type ActivityDocument } from "@/models";
import { ErrorFactory } from "@/errors";
import appAssert from "@/utils/app-assert";
import type {
  CreateAmenityInput,
  UpdateAmenityInput,
  CreateActivityInput,
  UpdateActivityInput,
} from "@/validators/amenity.validator";

export class AmenityService {
  /**
   * Get all amenities (active only)
   */
  async getAllAmenities(includeInactive = false): Promise<AmenityDocument[]> {
    const query = includeInactive ? {} : { isActive: true };
    const amenities = await AmenityModel.find(query).sort({ category: 1, name: 1 });
    return amenities;
  }

  /**
   * Get amenities by category
   */
  async getAmenitiesByCategory(
    category: string,
    includeInactive = false
  ): Promise<AmenityDocument[]> {
    const query: any = { category };
    if (!includeInactive) query.isActive = true;

    const amenities = await AmenityModel.find(query).sort({ name: 1 });
    return amenities;
  }

  /**
   * Create amenity (admin only)
   */
  async createAmenity(input: CreateAmenityInput): Promise<AmenityDocument> {
    const amenity = await AmenityModel.create(input);
    return amenity;
  }

  /**
   * Update amenity (admin only)
   */
  async updateAmenity(amenityId: string, input: UpdateAmenityInput): Promise<AmenityDocument> {
    const amenity = await AmenityModel.findByIdAndUpdate(amenityId, input, {
      new: true,
    });
    appAssert(amenity, ErrorFactory.resourceNotFound("Amenity"));
    return amenity!;
  }

  /**
   * Delete amenity (admin only)
   */
  async deleteAmenity(amenityId: string): Promise<void> {
    const result = await AmenityModel.findByIdAndDelete(amenityId);
    appAssert(result, ErrorFactory.resourceNotFound("Amenity"));
  }

  /**
   * Toggle active status
   */
  async toggleActive(amenityId: string, isActive: boolean): Promise<AmenityDocument> {
    const amenity = await AmenityModel.findByIdAndUpdate(amenityId, { isActive }, { new: true });
    appAssert(amenity, ErrorFactory.resourceNotFound("Amenity"));
    return amenity!;
  }
}

export class ActivityService {
  /**
   * Get all activities (active only)
   */
  async getAllActivities(includeInactive = false): Promise<ActivityDocument[]> {
    const query = includeInactive ? {} : { isActive: true };
    const activities = await ActivityModel.find(query).sort({ category: 1, name: 1 });
    return activities;
  }

  /**
   * Get activities by category
   */
  async getActivitiesByCategory(
    category: string,
    includeInactive = false
  ): Promise<ActivityDocument[]> {
    const query: any = { category };
    if (!includeInactive) query.isActive = true;

    const activities = await ActivityModel.find(query).sort({ name: 1 });
    return activities;
  }

  /**
   * Create activity (admin only)
   */
  async createActivity(input: CreateActivityInput): Promise<ActivityDocument> {
    const activity = await ActivityModel.create(input);
    return activity;
  }

  /**
   * Update activity (admin only)
   */
  async updateActivity(activityId: string, input: UpdateActivityInput): Promise<ActivityDocument> {
    const activity = await ActivityModel.findByIdAndUpdate(activityId, input, {
      new: true,
    });
    appAssert(activity, ErrorFactory.resourceNotFound("Activity"));
    return activity!;
  }

  /**
   * Delete activity (admin only)
   */
  async deleteActivity(activityId: string): Promise<void> {
    const result = await ActivityModel.findByIdAndDelete(activityId);
    appAssert(result, ErrorFactory.resourceNotFound("Activity"));
  }

  /**
   * Toggle active status
   */
  async toggleActive(activityId: string, isActive: boolean): Promise<ActivityDocument> {
    const activity = await ActivityModel.findByIdAndUpdate(activityId, { isActive }, { new: true });
    appAssert(activity, ErrorFactory.resourceNotFound("Activity"));
    return activity!;
  }
}
