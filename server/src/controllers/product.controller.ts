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
  getProducts = catchErrors(async (req, res) => {
    const { page, limit, search, categories, minPrice, maxPrice, sort } = getProductSchema.parse(
      req.query
    );

    const { data, pagination } = await this.productService.getProductsPaginated(
      page,
      limit,
      search,
      categories,
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
      sort
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

  /**
   * Search products fuzzy
   * @route GET /products/search
   * query: key, page, limit
   */
  searchProductsFuzzy = catchErrors(async (req, res) => {
    const key = (req.query.key as string) || (req.query.q as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.productService.searchProductsFuzzy(key, page, limit);
    return ResponseUtil.success(res, result, "Kết quả tìm kiếm fuzzy");
  });

  /**
   * Get products by category name
   * @route GET /products/category/:name
   */
  getProductsByCategoryName = catchErrors(async (req, res) => {
    const name = (req.params.name as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.productService.getProductsByCategoryName(name, page, limit);
    return ResponseUtil.success(res, result, `Sản phẩm theo danh mục: ${name}`);
  });

  /**
   * Get products by price range
   * @route GET /products/price-range
   * query: minPrice, maxPrice, category, page, limit
   */
  getProductsByPriceRange = catchErrors(async (req, res) => {
    const minPrice = parseInt(req.query.minPrice as string) || 0;
    const maxPrice = parseInt(req.query.maxPrice as string) || 1000000000; // default max
    const category = (req.query.category as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.productService.getProductsByPriceRange(
      minPrice,
      maxPrice,
      category,
      page,
      limit
    );

    return ResponseUtil.success(res, result, `Sản phẩm theo khoảng giá ${minPrice} - ${maxPrice}`);
  });
}
