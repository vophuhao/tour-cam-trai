import { catchErrors } from "@/errors";
import type ProductService from "@/services/product.service";
import { ResponseUtil } from "@/utils";
import { getProductByIdSchema, getProductBySlugSchema } from "@/validators/product.validator"; // bạn cần tạo file validator tương tự category

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
    } = req.body;
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || undefined;
    const category = (req.query.category as string) || undefined;

    const result = await this.productService.getProductsPaginated(page, limit, search, category);

    return ResponseUtil.success(res, result, "Lấy danh sách products phân trang thành công");
  });

  getProduct = catchErrors(async (_req, res) => {
    const result = await this.productService.getProduct();

    return ResponseUtil.success(res, result, "Lấy danh sách categories thành công");
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
    const { id } = getProductByIdSchema.parse(req.params);
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
    } = req.body;
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

    return ResponseUtil.success(res, result);
  });

  /**
   * Delete a product
   * @route DELETE /products/:id
   */
  deleteProduct = catchErrors(async (req, res) => {
    const { id } = getProductByIdSchema.parse(req.params);
    await this.productService.deleteProduct(id);
    return ResponseUtil.success(res, { message: "Product deleted successfully" });
  });

  getProductBySlug = catchErrors(async (req, res) => {
    const { slug } = getProductBySlugSchema.parse(req.params);
    const result = await this.productService.getProductBySlug(slug);
    return ResponseUtil.success(res, result);
  });
}
