import { catchErrors } from "@/errors";
import type { PropertyService } from "@/services/property.service";
import { ResponseUtil } from "@/utils";
import { mongoIdSchema } from "@/validators";
import {
  createPropertySchema,
  searchPropertySchema,
  updatePropertySchema,
} from "@/validators/property.validator";

export default class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  /**
   * Create new property (host/admin only)
   * @route POST /api/properties
   */
  createProperty = catchErrors(async (req, res) => {
    const input = createPropertySchema.parse(req.body);
    const hostId = mongoIdSchema.parse(req.userId);

    const property = await this.propertyService.createProperty(hostId, input);

    return ResponseUtil.created(res, property, "Tạo property thành công");
  });

  /**
   * Search properties with filters
   * @route GET /api/properties
   */
  searchProperties = catchErrors(async (req, res) => {
    const input = searchPropertySchema.parse(req.query);

    const { properties, pagination } = await this.propertyService.searchProperties(input);

    return ResponseUtil.paginated(
      res,
      properties,
      {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.pages,
        hasNext: pagination.page < pagination.pages,
        hasPrev: pagination.page > 1,
      },
      "Tìm kiếm property thành công"
    );
  });

  /**
   * Get property by ID or slug
   * @route GET /api/properties/:idOrSlug
   */
  getProperty = catchErrors(async (req, res) => {
    const { idOrSlug } = req.params;

    const property = await this.propertyService.getProperty(idOrSlug || "");

    return ResponseUtil.success(res, property, "Lấy thông tin property thành công");
  });

  /**
   * Get property with all sites
   * @route GET /api/properties/:idOrSlug/with-sites
   */
  getPropertyWithSites = catchErrors(async (req, res) => {
    const { idOrSlug } = req.params;

    const property = await this.propertyService.getPropertyWithSites(idOrSlug || "");

    return ResponseUtil.success(res, property, "Lấy thông tin property và sites thành công");
  });

  /**
   * Update property (host/admin only)
   * @route PATCH /api/properties/:id
   */
  updateProperty = catchErrors(async (req, res) => {
    const { id } = req.params;
    const input = updatePropertySchema.parse(req.body);
    const hostId = mongoIdSchema.parse(req.userId);

    const property = await this.propertyService.updateProperty(id || "", hostId, input);

    return ResponseUtil.success(res, property, "Cập nhật property thành công");
  });

  /**
   * Delete property (host/admin only)
   * @route DELETE /api/properties/:id
   */
  deleteProperty = catchErrors(async (req, res) => {
    const { id } = req.params;
    const hostId = mongoIdSchema.parse(req.userId);

    await this.propertyService.deleteProperty(id || "", hostId);

    return ResponseUtil.success(res, null, "Xóa property thành công");
  });

  /**
   * Activate property (host/admin only)
   * Requires at least 1 active site
   * @route POST /api/properties/:id/activate
   */
  activateProperty = catchErrors(async (req, res) => {
    const { id } = req.params;
    const hostId = mongoIdSchema.parse(req.userId);

    const property = await this.propertyService.activateProperty(id || "", hostId);

    return ResponseUtil.success(res, property, "Kích hoạt property thành công");
  });

  /**
   * Deactivate property (host/admin only)
   * @route POST /api/properties/:id/deactivate
   */
  deactivateProperty = catchErrors(async (req, res) => {
    const { id } = req.params;
    const hostId = mongoIdSchema.parse(req.userId);

    const property = await this.propertyService.updateProperty(id || "", hostId, {
      isActive: false,
    });

    return ResponseUtil.success(res, property, "Vô hiệu hóa property thành công");
  });

  /**
   * Get my properties (host only)
   * @route GET /api/properties/my/list
   */
  getMyProperties = catchErrors(async (req, res) => {
    const hostId = mongoIdSchema.parse(req.userId);

    const properties = await this.propertyService.getPropertiesByHost(hostId);

    return ResponseUtil.success(res, properties, "Lấy danh sách property của bạn thành công");
  });

  /**
   * Get property stats (host/admin only)
   * @route GET /api/properties/:id/stats
   */
  getPropertyStats = catchErrors(async (req, res) => {
    const { id } = req.params;
    const hostId = mongoIdSchema.parse(req.userId);

    const stats = await this.propertyService.getPropertyStats(id || "", hostId);

    return ResponseUtil.success(res, stats, "Lấy thống kê property thành công");
  });

  /**
   * Get featured properties
   * @route GET /api/properties/featured/list
   */
  getFeaturedProperties = catchErrors(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const properties = await this.propertyService.getFeaturedProperties(limit);

    return ResponseUtil.success(res, properties, "Lấy danh sách property nổi bật thành công");
  });

  /**
   * Get nearby properties
   * @route GET /api/properties/nearby/:idOrSlug
   */
  getNearbyProperties = catchErrors(async (req, res) => {
    const { idOrSlug } = req.params;
    const maxDistance = parseInt(req.query.maxDistance as string) || 50000; // 50km default
    const limit = parseInt(req.query.limit as string) || 5;

    const properties = await this.propertyService.getNearbyProperties(
      idOrSlug || "",
      maxDistance,
      limit
    );

    return ResponseUtil.success(res, properties, "Lấy danh sách property gần đó thành công");
  });
}
