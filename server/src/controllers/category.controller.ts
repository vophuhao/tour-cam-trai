import { catchErrors } from "@/errors";
import type CategoryService from "@/services/category.service";
import { ResponseUtil } from "@/utils";
import { searchSchema } from "@/validators";
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategoryByIdSchema,
  updateCategorySchema,
} from "@/validators/category.validator";

export default class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Create a new category
   * @route POST /categories
   */
  createCategory = catchErrors(async (req, res) => {
    const { name, isActive } = createCategorySchema.parse(req.body);

    const result = await this.categoryService.createCategory({ name, isActive });

    return ResponseUtil.success(res, result, "Tạo danh mục thành công");
  });

  /**
   * Get paginated categories
   * @route GET /categories
   */
  getCategoriesPaginated = catchErrors(async (req, res) => {
    const { page = 1, limit = 10, q: query } = searchSchema.parse(req.query);

    const { data, pagination } = await this.categoryService.getCategoriesPaginated(
      page,
      limit,
      query
    );

    return ResponseUtil.paginated(
      res,
      data,
      pagination,
      "Lấy danh sách danh mục phân trang thành công"
    );
  });

  /**
   * Get all categories
   * @route GET /categories/all
   */
  getCategories = catchErrors(async (_req, res) => {
    const result = await this.categoryService.getCategory();

    return ResponseUtil.success(res, result, "Lấy danh sách danh mục thành công");
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
    const { id, name, isActive } = updateCategorySchema.parse({ ...req.params, ...req.body });

    const result = await this.categoryService.updateCategory({
      id,
      ...(name && { name }),
      ...(isActive !== undefined && { isActive }),
    });

    return ResponseUtil.success(res, result);
  });

  /**
   * Delete a category
   * @route DELETE /categories/:id
   */
  deleteCategory = catchErrors(async (req, res) => {
    const { id } = deleteCategorySchema.parse(req.params);
    await this.categoryService.deleteCategory(id);
    return ResponseUtil.success(res, undefined, "Category deleted successfully");
  });
}
