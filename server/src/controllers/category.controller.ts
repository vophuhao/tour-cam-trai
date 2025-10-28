// src/controllers/categoryController.ts
import type { Response } from "express";
import type { AuthenticatedRequest } from "@/types";
import catchErrors from "@/utils/catchErrors";
import { ResponseUtil } from "@/utils/response";
import  CategoryService  from "../services/category.service";
import { getCategoryByIdSchema } from "@/validators/category.validator";

/**
 * Create a new category
 * @route POST /categories
 */
export const createCategoryHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
    const { name, isActive } = req.body;  // destructure cho rõ ràng
    const result = await CategoryService.createCategory({ name, isActive });
    return ResponseUtil.success(res, result, "Tạo category thành công");
});

/**
 * Get all categories
 * @route GET /categories
 */
export const getCategoriesPaginatedHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || undefined;

  const result = await CategoryService.getCategoriesPaginated(page, limit, search);

  return ResponseUtil.success(res, result, "Lấy danh sách categories phân trang thành công");
});

export const getCategoriesHandler = catchErrors(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await CategoryService.getCategory();

    return ResponseUtil.success(res, result, "Lấy danh sách categories thành công");
  }
);


/**
 * Get category by ID
 * @route GET /categories/:id
 */
export const getCategoryByIdHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
   const {id} = getCategoryByIdSchema.parse(req.params)
    const result = await CategoryService.getCategoryById( id);
    return ResponseUtil.success(res, result);
  }
);

/**
 * Update a category
 * @route PUT /categories/:id
 */
export const updateCategoryHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
    const  {id }= getCategoryByIdSchema.parse(req.params)
    const { name, isActive } = req.body;
     const result = await CategoryService.updateCategory({
      id,
      name,
      isActive,
    });

    return ResponseUtil.success(res, result);
  }
);

/**
 * Delete a category
 * @route DELETE /categories/:id
 */
export const deleteCategoryHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
    const {id } = getCategoryByIdSchema.parse(req.params)
    await CategoryService.deleteCategory(id);
    return ResponseUtil.success(res, { message: "Category deleted successfully" });
  }
);
