import { catchErrors } from "@/errors";
import { ResponseUtil } from "@/utils";
import type LocationService from "@/services/location.service";
import {
  createLocationSchema,
  updateLocationSchema,
  getLocationByIdSchema,
  deleteLocationSchema,
  searchSchema,
} from "@/validators/location.validator";

export default class LocationController {
  constructor(private readonly locationService: LocationService) {}

  /**
   * Create a new location
   * POST /locations
   */
  createLocation = catchErrors(async (req, res) => {
    const { name, isActive } = createLocationSchema.parse(req.body);

    const result = await this.locationService.createLocation({ name, isActive });

    return ResponseUtil.success(res, result, "Tạo địa điểm thành công");
  });

  /**
   * Get paginated locations
   * GET /locations
   */
  getLocationsPaginated = catchErrors(async (req, res) => {
    const { page = 1, limit = 10, q: query } = searchSchema.parse(req.query);

    const { data, pagination } = await this.locationService.getLocationsPaginated(
      page,
      limit,
      query
    );

    return ResponseUtil.paginated(res, data, pagination, "Lấy danh sách địa điểm thành công");
  });

  /**
   * Get all (not paginated)
   * GET /locations/all
   */
  getLocations = catchErrors(async (_req, res) => {
    const result = await this.locationService.getLocations();
    return ResponseUtil.success(res, result, "Lấy danh sách địa điểm thành công");
  });

  /**
   * Get location by ID
   * GET /locations/:id
   */
  getLocationById = catchErrors(async (req, res) => {
    const { id } = getLocationByIdSchema.parse(req.params);

    const result = await this.locationService.getLocationById(id);
    return ResponseUtil.success(res, result);
  });

  /**
   * Update a location
   * PUT /locations/:id
   */
  updateLocation = catchErrors(async (req, res) => {
    const { id, name, isActive } = updateLocationSchema.parse({
      ...req.params,
      ...req.body,
    });

    const result = await this.locationService.updateLocation({
      id,
      ...(name !== undefined && { name }),
      ...(isActive !== undefined && { isActive }),
    });

    return ResponseUtil.success(res, result);
  });

  /**
   * Delete a location
   * DELETE /locations/:id
   */
  deleteLocation = catchErrors(async (req, res) => {
    const { id } = deleteLocationSchema.parse(req.params);
    await this.locationService.deleteLocation(id);
    return ResponseUtil.success(res, undefined, "Xóa địa điểm thành công");
  });
}
