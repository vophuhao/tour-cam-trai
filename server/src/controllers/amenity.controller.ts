import { catchErrors } from "@/errors";
import type { AmenityService, ActivityService } from "@/services/amenity.service";
import { ResponseUtil } from "@/utils";
import {
  createAmenitySchema,
  updateAmenitySchema,
  createActivitySchema,
  updateActivitySchema,
} from "@/validators/amenity.validator";

export default class AmenityController {
  constructor(
    private readonly amenityService: AmenityService,
    private readonly activityService: ActivityService
  ) {}

  // ========== AMENITY ENDPOINTS ==========

  /**
   * Get all amenities
   * @route GET /api/amenities
   */
  getAllAmenities = catchErrors(async (req, res) => {
    const { includeInactive } = req.query as { includeInactive?: string };

    const amenities = await this.amenityService.getAllAmenities(includeInactive === "true");

    return ResponseUtil.success(res, amenities, "Lấy danh sách amenities thành công");
  });

  /**
   * Get amenities by category
   * @route GET /api/amenities/category/:category
   */
  getAmenitiesByCategory = catchErrors(async (req, res) => {
    const { category } = req.params;
    const { includeInactive } = req.query as { includeInactive?: string };

    const amenities = await this.amenityService.getAmenitiesByCategory(
      category,
      includeInactive === "true"
    );

    return ResponseUtil.success(res, amenities, "Lấy amenities theo category thành công");
  });

  /**
   * Create amenity (admin only)
   * @route POST /api/amenities
   */
  createAmenity = catchErrors(async (req, res) => {
    const input = createAmenitySchema.parse(req.body);

    const amenity = await this.amenityService.createAmenity(input);

    return ResponseUtil.created(res, amenity, "Tạo amenity thành công");
  });

  /**
   * Update amenity (admin only)
   * @route PATCH /api/amenities/:id
   */
  updateAmenity = catchErrors(async (req, res) => {
    const { id } = req.params;
    const input = updateAmenitySchema.parse(req.body);

    const amenity = await this.amenityService.updateAmenity(id, input);

    return ResponseUtil.success(res, amenity, "Cập nhật amenity thành công");
  });

  /**
   * Delete amenity (admin only)
   * @route DELETE /api/amenities/:id
   */
  deleteAmenity = catchErrors(async (req, res) => {
    const { id } = req.params;

    await this.amenityService.deleteAmenity(id);

    return ResponseUtil.success(res, null, "Xóa amenity thành công");
  });

  /**
   * Toggle amenity active status (admin only)
   * @route PATCH /api/amenities/:id/toggle-active
   */
  toggleAmenityActive = catchErrors(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const amenity = await this.amenityService.toggleActive(id, isActive);

    return ResponseUtil.success(res, amenity, "Cập nhật trạng thái amenity thành công");
  });

  // ========== ACTIVITY ENDPOINTS ==========

  /**
   * Get all activities
   * @route GET /api/activities
   */
  getAllActivities = catchErrors(async (req, res) => {
    const { includeInactive } = req.query as { includeInactive?: string };

    const activities = await this.activityService.getAllActivities(includeInactive === "true");

    return ResponseUtil.success(res, activities, "Lấy danh sách activities thành công");
  });

  /**
   * Get activities by category
   * @route GET /api/activities/category/:category
   */
  getActivitiesByCategory = catchErrors(async (req, res) => {
    const { category } = req.params;
    const { includeInactive } = req.query as { includeInactive?: string };

    const activities = await this.activityService.getActivitiesByCategory(
      category,
      includeInactive === "true"
    );

    return ResponseUtil.success(res, activities, "Lấy activities theo category thành công");
  });

  /**
   * Create activity (admin only)
   * @route POST /api/activities
   */
  createActivity = catchErrors(async (req, res) => {
    const input = createActivitySchema.parse(req.body);

    const activity = await this.activityService.createActivity(input);

    return ResponseUtil.created(res, activity, "Tạo activity thành công");
  });

  /**
   * Update activity (admin only)
   * @route PATCH /api/activities/:id
   */
  updateActivity = catchErrors(async (req, res) => {
    const { id } = req.params;
    const input = updateActivitySchema.parse(req.body);

    const activity = await this.activityService.updateActivity(id, input);

    return ResponseUtil.success(res, activity, "Cập nhật activity thành công");
  });

  /**
   * Delete activity (admin only)
   * @route DELETE /api/activities/:id
   */
  deleteActivity = catchErrors(async (req, res) => {
    const { id } = req.params;

    await this.activityService.deleteActivity(id);

    return ResponseUtil.success(res, null, "Xóa activity thành công");
  });

  /**
   * Toggle activity active status (admin only)
   * @route PATCH /api/activities/:id/toggle-active
   */
  toggleActivityActive = catchErrors(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const activity = await this.activityService.toggleActive(id, isActive);

    return ResponseUtil.success(res, activity, "Cập nhật trạng thái activity thành công");
  });
}
