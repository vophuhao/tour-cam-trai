import {
  getProductsPaginatedHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getProductByIdHandler,
  getProductHandler
} from "@/controllers/product.controller";
import { Router } from "express";

const productRoutes = Router();

// prefix: /products
productRoutes.get("/", getProductsPaginatedHandler);
productRoutes.get("/all", getProductHandler);
productRoutes.post("/create", createProductHandler);
productRoutes.post("/update/:id", updateProductHandler);
productRoutes.post("/delete/:id", deleteProductHandler);
productRoutes.get("/get/:id", getProductByIdHandler);

export default productRoutes;
