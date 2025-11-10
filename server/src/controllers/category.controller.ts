// src/controllers/categoryController.ts
import { catchErrors } from "@/errors";
import type CategoryService from "@/services/category.service";
import { ResponseUtil } from "@/utils";
import { getCategoryByIdSchema } from "@/validators/category.validator";

export default class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Create a new category
   * @route POST /categories
   */
  createCategory = catchErrors(async (req, res) => {
    const { name, isActive } = req.body;
    const result = await this.categoryService.createCategory({ name, isActive });
    return ResponseUtil.success(res, result, "Tạo category thành công");
  });

  /**
   * Get all categories
   * @route GET /categories
   */
  getCategoriesPaginated = catchErrors(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || undefined;

    const result = await this.categoryService.getCategoriesPaginated(page, limit, search);

    return ResponseUtil.success(res, result, "Lấy danh sách categories phân trang thành công");
  });

  getCategories = catchErrors(async (_req, res) => {
    const result = await this.categoryService.getCategory();

    return ResponseUtil.success(res, result, "Lấy danh sách categories thành công");
  });

  /**
   * Get category by ID
   * @route GET /categories/:id
   */
  getCategoryById = catchErrors(async (req, res) => {
    const { id } = getCategoryByIdSchema.parse(req.params);
    const result = await this.categoryService.getCategoryById(id);
    return ResponseUtil.success(res, result);
  });

  /**
   * Update a category
   * @route PUT /categories/:id
   */
  updateCategory = catchErrors(async (req, res) => {
    const { id } = getCategoryByIdSchema.parse(req.params);
    const { name, isActive } = req.body;
    const result = await this.categoryService.updateCategory({
      id,
      name,
      isActive,
    });

    return ResponseUtil.success(res, result);
  });

  /**
   * Delete a category
   * @route DELETE /categories/:id
   */
  deleteCategory = catchErrors(async (req, res) => {
    const { id } = getCategoryByIdSchema.parse(req.params);
    await this.categoryService.deleteCategory(id);
    return ResponseUtil.success(res, { message: "Category deleted successfully" });
  });
}
