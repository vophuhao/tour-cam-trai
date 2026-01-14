import { ErrorFactory } from "@/errors";
import CategoryModel, { CategoryDocument } from "@/models/category.model";
import { PaginationType } from "@/types";
import { appAssert } from "@/utils";
import { CreateCategoryInput } from "@/validators";

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  isActive?: boolean;
};

export default class CategoryService {
  async createCategory(data: CreateCategoryInput): Promise<CategoryDocument> {
    return CategoryModel.create(data);
  }

  async getCategoriesPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    data: CategoryDocument[];
    pagination: PaginationType;
  }> {
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" }; // tìm theo tên, không phân biệt hoa thường
    }

    const total = await CategoryModel.countDocuments(query);

    const data = await CategoryModel.find(query)
      .sort({ createdAt: -1 }) // mới nhất lên đầu
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data,
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

  // Lấy category theo id
  async getCategoryById(id: string): Promise<CategoryDocument | null> {
    return CategoryModel.findById(id).exec();
  }

  async getCategory(): Promise<CategoryDocument[]> {
    return CategoryModel.find().exec();
  }

  // Cập nhật category
  async updateCategory(data: UpdateCategoryInput): Promise<CategoryDocument | null> {
    const category = await CategoryModel.findById(data.id);
    if (!category) return null;

    if (data.name !== undefined) category.name = data.name;
    if (data.isActive !== undefined) category.isActive = data.isActive;

    return category.save();
  }

  // Xóa category
  async deleteCategory(id: string): Promise<void> {
    const category = await CategoryModel.findById(id);
    appAssert(category, ErrorFactory.resourceNotFound("Category"));
    await category.deleteOne();
  }
}
