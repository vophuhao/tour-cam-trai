// src/controllers/categoryController.ts
import type { Response } from "express";
import type { AuthenticatedRequest } from "@/types";
import catchErrors from "@/utils/catchErrors";
import { ResponseUtil } from "@/utils/response";
import  CategoryService  from "../services/category.service";;
import { getCategoryByIdSchema } from "@/validators/category.validator";

/**
 * Create a new category
 * @route POST /categories
 */
export const createCategoryHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
    const  name  = req.body;
    const result = await CategoryService.createCategory( name );
    return ResponseUtil.success(res, result);
  }
);

/**
 * Get all categories
 * @route GET /categories
 */
export const getAllCategoriesHandler = catchErrors(async (_req: AuthenticatedRequest, res: Response) => {
    const result = await CategoryService.getAllCategories();
    return ResponseUtil.success(res, result);
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
