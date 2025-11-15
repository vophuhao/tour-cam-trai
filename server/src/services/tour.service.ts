import TourModel from "@/models/tour.model";
import type { CreateTourInput, UpdateTourInput } from "@/validators/tour.validator";

export default class TourService {
  /** Tạo tour mới */
  async createTour(data: CreateTourInput) {
    data.slug = data.name.toLowerCase().replace(/ /g, "-");
    return await TourModel.create(data);
  }

  /** Lấy danh sách tour có phân trang + tìm kiếm */
  async getToursPaginated(page: number, limit: number, search?: string) {
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
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /** Lấy tất cả tour (không phân trang) */
  async getAllTours() {
    return await TourModel.find().sort({ createdAt: -1 });
  }

  /** Lấy tour theo ID */
  async getTourById(id: string) {
    return await TourModel.findById(id).populate("category");
  }

  /** Cập nhật tour */
  async updateTour(id: string, data: UpdateTourInput) {
    return await TourModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  /** Xóa tour */
  async deleteTour(id: string) {
    return await TourModel.findByIdAndDelete(id);
  }

  /** Kích hoạt tour */
  async activateTour(id: string) {
    return await TourModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
  }

  /** Hủy kích hoạt tour */
  async deactivateTour(id: string) {
    return await TourModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async getTourBySlug(slug: string) {
    return await TourModel.findOne({ slug });
  }
}
