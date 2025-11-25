import { ErrorFactory } from "@/errors";
import ProductModel, { ProductDocument } from "@/models/product.model";
import { PaginationType } from "@/types";
import { appAssert } from "@/utils";
import { CreateProductInput, UpdateProductInput } from "@/validators";

export default class ProductService {
  // Tạo product
  async createProduct(data: CreateProductInput): Promise<ProductDocument> {
    data.slug = data.name.toLowerCase().replace(/ /g, "-");
    data.rating = { average: 0, count: 0 };
    data.count = 0;
    return ProductModel.create(data);
  }

  // Lấy tất cả product có phân trang + tìm kiếm + filter
  async getProductsPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    categories?: string[], // Changed to array
    minPrice?: number,
    maxPrice?: number,
    sort?: string
  ): Promise<{
    data: ProductDocument[];
    pagination: PaginationType;
  }> {
    const query: any = {};

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Categories filter (multiple)
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        query.price.$lte = maxPrice;
      }
    }

    const total = await ProductModel.countDocuments(query);

    // Sorting
    let sortOption: any = { createdAt: -1 }; // Default: newest first
    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "name-asc") {
      sortOption = { name: 1 };
    } else if (sort === "name-desc") {
      sortOption = { name: -1 };
    }

    const data = await ProductModel.find(query)
      .populate("category", "name")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }
  async getProduct(): Promise<ProductDocument[]> {
    return ProductModel.find().exec();
  }

  async getProductBySlug(slug: string): Promise<ProductDocument | null> {
    return ProductModel.findOne({ slug }).populate("category", "name").exec();
  }

  // Lấy product theo id
  async getProductById(id: string): Promise<ProductDocument | null> {
    return ProductModel.findById(id).populate("category", "name").exec();
  }

  // Cập nhật product
  async updateProduct(data: UpdateProductInput): Promise<ProductDocument | null> {
    const product = await ProductModel.findById(data.id);

    if (!product) return null;

    if (data.name !== undefined) product.slug = data.name.toLowerCase().replace(/ /g, "-");
    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.stock !== undefined) product.stock = data.stock;
    if (data.images !== undefined) product.images = data.images;
    if (data.category !== undefined) product.category = data.category as any;
    if (data.isActive !== undefined) product.isActive = data.isActive;
    if (data.specifications !== undefined) product.specifications = data.specifications;
    if (data.variants !== undefined) product.variants = data.variants;
    if (data.details !== undefined) product.details = data.details;
    if (data.guide !== undefined) product.guide = data.guide;
    if (data.warnings !== undefined) product.warnings = data.warnings;
    if (data.deal !== undefined) product.deal = data.deal;

    return product.save();
  }

  // Xóa product
  async deleteProduct(id: string): Promise<void> {
    const product = await ProductModel.findById(id);
    appAssert(product, ErrorFactory.resourceNotFound("Product"));
    await product.deleteOne();
  }
}
