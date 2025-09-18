import CategoryModel, { CategoryDocument } from "../models/category.model";

type CreateCategoryInput = {
  name: string;
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
export const getAllCategories = async (): Promise<CategoryDocument[]> => {
  return CategoryModel.find().exec();
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
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

export default CategoryService;