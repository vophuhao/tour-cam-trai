import { catchErrors } from "@/errors";
import type ProductService from "@/services/product.service";
import { ResponseUtil } from "@/utils";
import {
  createProductSchema,
  getProductByIdSchema,
  getProductBySlugSchema,
  getProductSchema,
  updateProductSchema,
} from "@/validators/product.validator"; // bạn cần tạo file validator tương tự category

/**
 * Create a new product
 * @route POST /products
 */
export default class ProductController {
  constructor(private readonly productService: ProductService) {}

  createProduct = catchErrors(async (req, res) => {
    const {
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
    } = createProductSchema.parse(req.body);

    const result = await this.productService.createProduct({
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
  getProductsPaginated = catchErrors(async (req, res) => {
    const { page, limit, q: query, category } = getProductSchema.parse(req.query);

    const { data, pagination } = await this.productService.getProductsPaginated(
      page,
      limit,
      query,
      category
    );

    return ResponseUtil.paginated(
      res,
      data,
      pagination,
      "Lấy danh sách sản phẩm phân trang thành công"
    );
  });

  /**
   * Get all products
   * @route GET /products/all
   */
  getProduct = catchErrors(async (_req, res) => {
    const result = await this.productService.getProduct();

    return ResponseUtil.success(res, result, "Lấy danh sách sản phẩm thành công");
  });

  /**
   * Get product by ID
   * @route GET /products/:id
   */
  getProductById = catchErrors(async (req, res) => {
    const { id } = getProductByIdSchema.parse(req.params);
    const result = await this.productService.getProductById(id);
    return ResponseUtil.success(res, result);
  });

  updateProduct = catchErrors(async (req, res) => {
    const {
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
    } = updateProductSchema.parse({ ...req.params, ...req.body });

    const result = await this.productService.updateProduct({
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

    return ResponseUtil.success(res, result, "Cập nhật sản phẩm thành công");
  });

  /**
   * Delete a product
   * @route DELETE /products/:id
   */
  deleteProduct = catchErrors(async (req, res) => {
    const { id } = getProductByIdSchema.parse(req.params);
    await this.productService.deleteProduct(id);
    return ResponseUtil.success(res, undefined, "Product deleted successfully");
  });

  getProductBySlug = catchErrors(async (req, res) => {
    const { slug } = getProductBySlugSchema.parse(req.params);
    const result = await this.productService.getProductBySlug(slug);
    return ResponseUtil.success(res, result);
  });
}
