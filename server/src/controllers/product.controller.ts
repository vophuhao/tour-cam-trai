
import type { Response } from "express";
import type { AuthenticatedRequest } from "@/types";
import catchErrors from "@/utils/catchErrors";
import { ResponseUtil } from "@/utils/response";
import ProductService from "../services/product.service";
import { getProductByIdSchema, getProductBySlugSchema } from "@/validators/product.validator"; // bạn cần tạo file validator tương tự category
import { get } from "http";

/**
 * Create a new product
 * @route POST /products
 */
export const createProductHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, price, deal, stock, images, category, isActive , specifications, variants, details, guide, warnings } = req.body;
  const result = await ProductService.createProduct({
    name,
    description, 
    price,
    deal,
    stock,
    images,
    category,
    isActive,
    specifications,
    variants,
    details,
    guide,
    warnings,
  });
  return ResponseUtil.success(res, result, "Tạo product thành công");
});

/**
 * Get all products (paginated + search)
 * @route GET /products
 */
export const getProductsPaginatedHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || undefined;
  const category = (req.query.category as string) || undefined;

  const result = await ProductService.getProductsPaginated(page, limit, search, category);

  return ResponseUtil.success(res, result, "Lấy danh sách products phân trang thành công");
});

export const getProductHandler = catchErrors(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProductService.getProduct();

    return ResponseUtil.success(res, result, "Lấy danh sách categories thành công");
  }
);

/**
 * Get product by ID
 * @route GET /products/:id
 */
export const getProductByIdHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = getProductByIdSchema.parse(req.params);
  const result = await ProductService.getProductById(id);
  return ResponseUtil.success(res, result);
});
export const updateProductHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = getProductByIdSchema.parse(req.params);
  const { name, description, price, deal, stock, images, category, isActive, specifications, variants, details, guide, warnings } = req.body;
  const result = await ProductService.updateProduct({
    id,
    name,
    description,
    price,
    deal,
    stock,
    images,
    category,
    isActive,
    specifications,
    variants,
    details,
    guide,
    warnings,
  });

  return ResponseUtil.success(res, result);
});


/**
 * Delete a product
 * @route DELETE /products/:id
 */
export const deleteProductHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = getProductByIdSchema.parse(req.params);
  await ProductService.deleteProduct(id);
  return ResponseUtil.success(res, { message: "Product deleted successfully" });
});

export const getProductBySlugHandler = catchErrors(async (req: AuthenticatedRequest, res: Response) => {
  const { slug } = getProductBySlugSchema.parse(req.params);
  const result = await ProductService.getProductBySlug(slug);
  return ResponseUtil.success(res, result);
});