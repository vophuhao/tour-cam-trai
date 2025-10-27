import type { Response } from "express";
import type { AuthenticatedRequest } from "@/types";
import catchErrors from "@/utils/catchErrors";
import { ResponseUtil } from "@/utils/response";
import TourService from "@/services/tour.service";
import {
  createTourSchema,
  updateTourSchema,
  getTourByIdSchema,
  getTourBySlugSchema,
} from "@/validators/tour.validator";

/**
 * @route POST /tours
 * @desc Tạo tour mới
 */
export const createTourHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const data = createTourSchema.parse(req.body);
  const tour = await TourService.createTour(data);
  return ResponseUtil.success(res, tour, "Tạo tour thành công");
});

/**
 * @route GET /tours
 * @desc Lấy danh sách tour (phân trang + tìm kiếm)
 */
export const getToursPaginatedHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || undefined;

  const result = await TourService.getToursPaginated(page, limit, search);
  return ResponseUtil.success(res, result, "Lấy danh sách tour thành công");
});

/**
 * @route GET /tours/:id
 * @desc Lấy tour theo ID
 */
export const getTourByIdHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = getTourByIdSchema.parse(req.params);
  console.log(id)
  const tour = await TourService.getTourById(id);

  if (!tour) return ResponseUtil.notFound(res, "Không tìm thấy tour");

  return ResponseUtil.success(res, tour, "Lấy thông tin tour thành công");
});

/**
 * @route PUT /tours/:id
 * @desc Cập nhật tour
 */
export const updateTourHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = getTourByIdSchema.parse(req.params);
  const data = updateTourSchema.parse(req.body);

  const tour = await TourService.updateTour(id, data);
  if (!tour) return ResponseUtil.notFound(res, "Không tìm thấy tour để cập nhật");

  return ResponseUtil.success(res, tour, "Cập nhật tour thành công");
});

/**
 * @route DELETE /tours/:id
 * @desc Xóa tour
 */
export const deleteTourHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = getTourByIdSchema.parse(req.params);
  const tour = await TourService.deleteTour(id);

  if (!tour) return ResponseUtil.notFound(res, "Không tìm thấy tour để xóa");

  return ResponseUtil.success(res, null, "Xóa tour thành công");
});

/**
 * @route PATCH /tours/:id/activate
 * @desc Kích hoạt tour
 */
export const activateTourHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = getTourByIdSchema.parse(req.params);
  const tour = await TourService.activateTour(id);

  if (!tour) return ResponseUtil.notFound(res, "Không tìm thấy tour để kích hoạt");

  return ResponseUtil.success(res, tour, "Kích hoạt tour thành công");
});

/**
 * @route PATCH /tours/:id/deactivate
 * @desc Hủy kích hoạt tour
 */
export const deactivateTourHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = getTourByIdSchema.parse(req.params);
  const tour = await TourService.deactivateTour(id);

  if (!tour) return ResponseUtil.notFound(res, "Không tìm thấy tour để hủy kích hoạt");

  return ResponseUtil.success(res, tour, "Hủy kích hoạt tour thành công");
});

export const getTourBySlugHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { slug } = getTourBySlugSchema.parse(req.params);
  const tour = await TourService.getTourBySlug(slug); 

  if (!tour) return ResponseUtil.notFound(res, "Không tìm thấy tour");

  return ResponseUtil.success(res, tour, "Lấy thông tin tour thành công");
});