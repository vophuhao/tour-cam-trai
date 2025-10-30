import CategoryModel, { CategoryDocument } from "@/models/category.model";

export type CreateCategoryInput = {
  name: string;
  isActive: boolean;
};

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  isActive?: boolean;
};

export default class CategoryService {
  // Tạo category
  async createCategory(data: CreateCategoryInput): Promise<CategoryDocument> {
    return CategoryModel.create(data);
  }

  // Lấy tất cả category
  async getCategoriesPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ data: CategoryDocument[]; total: number; page: number; limit: number }> {
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

    return { data, total, page, limit };
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
  async deleteCategory(id: string): Promise<boolean> {
    const category = await CategoryModel.findById(id);
    if (!category) return false;
    await category.deleteOne();
    return true;
  }
}
