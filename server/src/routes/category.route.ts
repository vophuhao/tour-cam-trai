import { getCategoriesPaginatedHandler , createCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
    getCategoryByIdHandler,
    getCategoriesHandler
} from "@/controllers/category.controller";
import { Router } from "express";
import requireAdmin from "@/middleware/requireAdmin";

const categoryRoutes = Router();

// prefix: /sessions
categoryRoutes.get("/", getCategoriesPaginatedHandler);
categoryRoutes.get("/all", getCategoriesHandler);
categoryRoutes.post("/create", requireAdmin, createCategoryHandler);
categoryRoutes.post("/update/:id", requireAdmin, updateCategoryHandler);
categoryRoutes.post("/delete/:id", requireAdmin, deleteCategoryHandler);
categoryRoutes.get("/get/:id", getCategoryByIdHandler);
export default categoryRoutes;
