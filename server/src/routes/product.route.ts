import {
  getProductsPaginatedHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getProductByIdHandler,
  getProductHandler,
  getProductBySlugHandler
} from "@/controllers/product.controller";
import requireAdmin from "@/middleware/requireAdmin";
import { Router } from "express";

const productRoutes = Router();

// prefix: /products
productRoutes.get("/", getProductsPaginatedHandler);
productRoutes.get("/all", getProductHandler);
productRoutes.post("/create", requireAdmin, createProductHandler);
productRoutes.post("/update/:id", requireAdmin, updateProductHandler);
productRoutes.post("/delete/:id", requireAdmin, deleteProductHandler);
productRoutes.get("/get/:id", getProductByIdHandler);
productRoutes.get("/slug/:slug", getProductBySlugHandler);

export default productRoutes;
