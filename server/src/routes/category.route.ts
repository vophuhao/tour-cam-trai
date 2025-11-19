import CategoryController from "@/controllers/category.controller";
import { container, TOKENS } from "@/di";
import requireAdmin from "@/middleware/require-admin";
import type CategoryService from "@/services/category.service";
import { Router } from "express";

const categoryRoutes = Router();

const categoryService = container.resolve<CategoryService>(TOKENS.CategoryService);
const categoryController = new CategoryController(categoryService);

// prefix: /categories
categoryRoutes.get("/", categoryController.getCategoriesPaginated);
categoryRoutes.post("/", requireAdmin, categoryController.createCategory);
categoryRoutes.get("/all", categoryController.getCategories);
categoryRoutes.get("/:id", categoryController.getCategoryById);
categoryRoutes.put("/:id", requireAdmin, categoryController.updateCategory);
categoryRoutes.delete("/:id", requireAdmin, categoryController.deleteCategory);

export default categoryRoutes;
