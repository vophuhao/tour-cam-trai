import { getAllCategoriesHandler , createCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
    getCategoryByIdHandler
} from "@/controllers/category.controller";
import { Router } from "express";


const categoryRoutes = Router();

// prefix: /sessions
categoryRoutes.get("/", getAllCategoriesHandler);
categoryRoutes.get("/create", createCategoryHandler);
categoryRoutes.get("/update/:id", updateCategoryHandler);
categoryRoutes.get("/delete/:id", deleteCategoryHandler);
categoryRoutes.get("/get/:id", getCategoryByIdHandler);
export default categoryRoutes;
