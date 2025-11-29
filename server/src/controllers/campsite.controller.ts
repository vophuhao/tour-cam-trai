import { catchErrors } from "@/errors";
import type { CampsiteService } from "@/services/campsite.service";
import { ResponseUtil } from "@/utils";
import { mongoIdSchema } from "@/validators";
import {
  createCampsiteSchema,
  searchCampsiteSchema,
  updateCampsiteSchema,
} from "@/validators/campsite.validator";

export default class CampsiteController {
  constructor(private readonly campsiteService: CampsiteService) {}

  /**
   * Create new campsite (host/admin only)
   * @route POST /api/campsites
   */
  createCampsite = catchErrors(async (req, res) => {
    const input = createCampsiteSchema.parse(req.body);
    const hostId = mongoIdSchema.parse(req.userId);

    const campsite = await this.campsiteService.createCampsite(hostId, input);

    return ResponseUtil.created(res, campsite, "Tạo campsite thành công");
  });

  /**
   * Search campsites with filters
   * @route GET /api/campsites
   */
  searchCampsites = catchErrors(async (req, res) => {
    const input = searchCampsiteSchema.parse(req.query);

    const { data, pagination } = await this.campsiteService.searchCampsites(input);

    return ResponseUtil.paginated(res, data, pagination, "Tìm kiếm campsite thành công");
  });

  /**
   * Get campsite by ID or slug
   * @route GET /api/campsites/:idOrSlug
   */
  getCampsite = catchErrors(async (req, res) => {
    const { idOrSlug } = req.params;

    const campsite = await this.campsiteService.getCampsite(idOrSlug || "");

    // Increment views (async, no await)
    this.campsiteService.incrementViews(idOrSlug || "");

    return ResponseUtil.success(res, campsite, "Lấy thông tin campsite thành công");
  });

  /**
   * Update campsite (host/admin only)
   * @route PATCH /api/campsites/:id
   */
  updateCampsite = catchErrors(async (req, res) => {
    const { id } = req.params;
    const input = updateCampsiteSchema.parse(req.body);
    const hostId = mongoIdSchema.parse(req.userId);

    const campsite = await this.campsiteService.updateCampsite(id || "", hostId, input);

    return ResponseUtil.success(res, campsite, "Cập nhật campsite thành công");
  });

  /**
   * Delete campsite (host/admin only)
   * @route DELETE /api/campsites/:id
   */
  deleteCampsite = catchErrors(async (req, res) => {
    const { id } = req.params;
    const hostId = mongoIdSchema.parse(req.userId);

    await this.campsiteService.deleteCampsite(id || "", hostId);

    return ResponseUtil.success(res, null, "Xóa campsite thành công");
  });

  /**
   * Get my campsites (host only)
   * @route GET /api/campsites/my/list
   */
  getMyCampsites = catchErrors(async (req, res) => {
    const hostId = mongoIdSchema.parse(req.userId);

    const campsites = await this.campsiteService.getHostCampsites(hostId);

    return ResponseUtil.success(res, campsites, "Lấy danh sách campsite của bạn thành công");
  });

  /**
   * Check availability
   * @route GET /api/campsites/:id/availability
   */
  checkAvailability = catchErrors(async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query as { checkIn: string; checkOut: string };

    const isAvailable = await this.campsiteService.checkAvailability(id || "", checkIn, checkOut);

    return ResponseUtil.success(res, { isAvailable }, "Kiểm tra lịch trống thành công");
  });
}
