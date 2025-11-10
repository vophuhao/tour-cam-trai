import { catchErrors, ErrorFactory } from "@/errors";
import type TourService from "@/services/tour.service";
import { appAssert, ResponseUtil } from "@/utils";
import {
  createTourSchema,
  getTourByIdSchema,
  getTourBySlugSchema,
  updateTourSchema,
} from "@/validators/tour.validator";

export default class TourController {
  constructor(private readonly tourService: TourService) {}

  /**
   * @route POST /tours
   * @desc Tạo tour mới
   */
  createTour = catchErrors(async (req, res) => {
    const data = createTourSchema.parse(req.body);
    const tour = await this.tourService.createTour(data);
    return ResponseUtil.success(res, tour, "Tạo tour thành công");
  });

  /**
   * @route GET /tours
   * @desc Lấy danh sách tour (phân trang + tìm kiếm)
   */
  getToursPaginated = catchErrors(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || undefined;

    const result = await this.tourService.getToursPaginated(page, limit, search);
    return ResponseUtil.success(res, result, "Lấy danh sách tour thành công");
  });

  /**
   * @route GET /tours/:id
   * @desc Lấy tour theo ID
   */
  getTourById = catchErrors(async (req, res) => {
    const { id } = getTourByIdSchema.parse(req.params);
    const tour = await this.tourService.getTourById(id);

    appAssert(tour, ErrorFactory.resourceNotFound("Tour"));

    return ResponseUtil.success(res, tour, "Lấy thông tin tour thành công");
  });

  /**
   * @route PUT /tours/:id
   * @desc Cập nhật tour
   */
  updateTour = catchErrors(async (req, res) => {
    const { id } = getTourByIdSchema.parse(req.params);
    const data = updateTourSchema.parse(req.body);

    const tour = await this.tourService.updateTour(id, data);
    appAssert(tour, ErrorFactory.resourceNotFound("Tour"));

    return ResponseUtil.success(res, tour, "Cập nhật tour thành công");
  });

  /**
   * @route DELETE /tours/:id
   * @desc Xóa tour
   */
  deleteTour = catchErrors(async (req, res) => {
    const { id } = getTourByIdSchema.parse(req.params);
    const tour = await this.tourService.deleteTour(id);

    appAssert(tour, ErrorFactory.resourceNotFound("Tour"));

    return ResponseUtil.success(res, null, "Xóa tour thành công");
  });

  /**
   * @route PATCH /tours/:id/activate
   * @desc Kích hoạt tour
   */
  activateTour = catchErrors(async (req, res) => {
    const { id } = getTourByIdSchema.parse(req.params);
    const tour = await this.tourService.activateTour(id);

    appAssert(tour, ErrorFactory.resourceNotFound("Tour"));

    return ResponseUtil.success(res, tour, "Kích hoạt tour thành công");
  });

  /**
   * @route PATCH /tours/:id/deactivate
   * @desc Hủy kích hoạt tour
   */
  deactivateTour = catchErrors(async (req, res) => {
    const { id } = getTourByIdSchema.parse(req.params);
    const tour = await this.tourService.deactivateTour(id);

    appAssert(tour, ErrorFactory.resourceNotFound("Tour"));

    return ResponseUtil.success(res, tour, "Hủy kích hoạt tour thành công");
  });

  getTourBySlug = catchErrors(async (req, res) => {
    const { slug } = getTourBySlugSchema.parse(req.params);
    const tour = await this.tourService.getTourBySlug(slug);

    appAssert(tour, ErrorFactory.resourceNotFound("Tour"));

    return ResponseUtil.success(res, tour, "Lấy thông tin tour thành công");
  });
}
