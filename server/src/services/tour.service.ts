import TourModel from "@/models/tour.model";
import type { CreateTourInput, UpdateTourInput } from "@/validators/tour.validator";

class TourService {
  /** Tạo tour mới */
  static async createTour(data: CreateTourInput) {
    return await TourModel.create(data);
  }

/** Lấy danh sách tour có phân trang + tìm kiếm */
static async getToursPaginated(page: number, limit: number, search?: string) {
  const query: Record<string, any> = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const total = await TourModel.countDocuments(query);
  const tours = await TourModel.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    data: tours,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}


  /** Lấy tour theo ID */
  static async getTourById(id: string) {
    return await TourModel.findById(id).populate("category");
  }

  /** Cập nhật tour */
  static async updateTour(id: string, data: UpdateTourInput) {
    return await TourModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  /** Xóa tour */
  static async deleteTour(id: string) {
    return await TourModel.findByIdAndDelete(id);
  }

  /** Kích hoạt tour */
  static async activateTour(id: string) {
    return await TourModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
  }

  /** Hủy kích hoạt tour */
  static async deactivateTour(id: string) {
    return await TourModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  static async getTourBySlug(slug: string) {
    return await TourModel.findOne({ slug });
  }

}

export default TourService;
