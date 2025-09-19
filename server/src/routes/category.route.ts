import { getCategoriesPaginatedHandler , createCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
    getCategoryByIdHandler
} from "@/controllers/category.controller";
import { Router } from "express";


const categoryRoutes = Router();

// prefix: /sessions
categoryRoutes.get("/", getCategoriesPaginatedHandler);
categoryRoutes.post("/create", createCategoryHandler);
categoryRoutes.post("/update/:id", updateCategoryHandler);
categoryRoutes.post("/delete/:id", deleteCategoryHandler);
categoryRoutes.get("/get/:id", getCategoryByIdHandler);
export default categoryRoutes;
