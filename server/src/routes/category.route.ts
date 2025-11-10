import CategoryController from "@/controllers/category.controller";
import { container, TOKENS } from "@/di";
import requireAdmin from "@/middleware/require-admin";
import type CategoryService from "@/services/category.service";
import { Router } from "express";

const categoryRoutes = Router();

const categoryService = container.resolve<CategoryService>(TOKENS.CategoryService);
const categoryController = new CategoryController(categoryService);

// prefix: /sessions
categoryRoutes.get("/", categoryController.getCategoriesPaginated);
categoryRoutes.get("/all", categoryController.getCategories);
categoryRoutes.post("/create", requireAdmin, categoryController.createCategory);
categoryRoutes.post("/update/:id", requireAdmin, categoryController.updateCategory);
categoryRoutes.post("/delete/:id", requireAdmin, categoryController.deleteCategory);
categoryRoutes.get("/get/:id", categoryController.getCategoryById);
export default categoryRoutes;
