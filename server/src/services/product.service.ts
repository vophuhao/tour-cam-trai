import ProductModel, { ProductDocument } from "@/models/product.model";

export type CreateProductInput = {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  deal?: number;
  stock?: number;
  images?: string[];
  category: string;
  isActive?: boolean;
  specifications?: { label: string; value: string }[];
  variants?: {
    size: string;
    expandedSize: string;
    foldedSize: string;
    loadCapacity: string;
    weight: string;
  }[];
  details?: {
    title: string;
    items: { label: string }[];
  }[];
  guide?: string[];
  warnings?: string[];
  rating?: {
    average: number;
    count: number;
  };
  count?: number;
};

export type UpdateProductInput = {
  id: string;
  slug?: string;
  name?: string;
  description?: string;
  price?: number;
  deal?: number;
  stock?: number;
  images?: string[];
  category?: string;
  isActive?: boolean;
  specifications?: { label: string; value: string }[];
  variants?: {
    size: string;
    expandedSize: string;
    foldedSize: string;
    loadCapacity: string;
    weight: string;
  }[];
  details?: {
    title: string;
    items: { label: string }[];
  }[];
  guide?: string[];
  warnings?: string[];
};

export default class ProductService {
  // Tạo product
  async createProduct(data: CreateProductInput): Promise<ProductDocument> {
    data.slug = data.name.toLowerCase().replace(/ /g, "-");
    data.rating = { average: 0, count: 0 };
    data.count = 0;
    return ProductModel.create(data);
  }

  // Lấy tất cả product có phân trang + tìm kiếm
  async getProductsPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<{ data: ProductDocument[]; total: number; page: number; limit: number }> {
    const query: any = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }

    const total = await ProductModel.countDocuments(query);

    const data = await ProductModel.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { data, total, page, limit };
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
  async deleteProduct(id: string): Promise<boolean> {
    const product = await ProductModel.findById(id);
    if (!product) return false;
    await product.deleteOne();
    return true;
  }
}
