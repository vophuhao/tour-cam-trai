import ProductController from "@/controllers/product.controller";
import { container, TOKENS } from "@/di";
import requireAdmin from "@/middleware/require-admin";
import type ProductService from "@/services/product.service";
import { Router } from "express";

const productRoutes = Router();

const productService = container.resolve<ProductService>(TOKENS.ProductService);
const productController = new ProductController(productService);

// prefix: /products
productRoutes.get("/", productController.getProductsPaginated);
productRoutes.get("/all", productController.getProduct);
productRoutes.post("/create", requireAdmin, productController.createProduct);
productRoutes.post("/update/:id", requireAdmin, productController.updateProduct);
productRoutes.post("/delete/:id", requireAdmin, productController.deleteProduct);
productRoutes.get("/get/:id", productController.getProductById);
productRoutes.get("/slug/:slug", productController.getProductBySlug);
productRoutes.get("/search", productController.searchProductsFuzzy);
productRoutes.get("/category/:name", productController.getProductsByCategoryName);
productRoutes.get("/price-range", productController.getProductsByPriceRange);
export default productRoutes;
