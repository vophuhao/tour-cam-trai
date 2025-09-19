import CategoryModel, { CategoryDocument } from "../models/category.model";

type CreateCategoryInput = {
  name: string;
  isActive: boolean
};

type UpdateCategoryInput = {
  id: string;
  name?: string;
  isActive?: boolean;
};

// Tạo category
export const createCategory = async (data: CreateCategoryInput): Promise<CategoryDocument> => {
  return CategoryModel.create(data);
};

// Lấy tất cả category
export const getCategoriesPaginated = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ data: CategoryDocument[]; total: number; page: number; limit: number }> => {
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
};

// Lấy category theo id
export const getCategoryById = async (id: string): Promise<CategoryDocument | null> => {
  return CategoryModel.findById(id).exec();
};

// Cập nhật category
export const updateCategory = async (data: UpdateCategoryInput): Promise<CategoryDocument | null> => {
  const category = await CategoryModel.findById(data.id);
  if (!category) return null;

  if (data.name !== undefined) category.name = data.name;
  if (data.isActive !== undefined) category.isActive = data.isActive;

  return category.save();
};

// Xóa category
export const deleteCategory = async (id: string): Promise<boolean> => {
  const category = await CategoryModel.findById(id);
  if (!category) return false;
  await category.deleteOne()
  return true;
};

const CategoryService = {
  createCategory,
  getCategoriesPaginated,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

export default CategoryService;