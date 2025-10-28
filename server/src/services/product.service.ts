import ProductModel, { ProductDocument } from "@/models/product.model";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/validators/product.validator";

class ProductService {
  /** 🟢 Tạo sản phẩm mới */
  static async createProduct(data: CreateProductInput) {
    data.slug = data.name.toLowerCase().replace(/ /g, "-");
    return await ProductModel.create(data);
  }

  /** 🟢 Lấy danh sách sản phẩm có phân trang + tìm kiếm + lọc category */
  static async getProductsPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ) {
    const query: Record<string, any> = {};

    // 🔍 Tìm kiếm theo text index (name, description)
    if (search) {
      query.$text = { $search: search };
    }

    // 🧭 Lọc theo category
    if (category) {
      query.category = category;
    }

    // Đếm tổng số sản phẩm
    const total = await ProductModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Lấy danh sách sản phẩm
    const data = await ProductModel.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data,
      pagination: {
        total,
        totalPages,
        page,
        limit,
      },
    };
  }

  /** 🟢 Lấy tất cả sản phẩm (không phân trang) */
  static async getProducts(): Promise<ProductDocument[]> {
    return await ProductModel.find().exec();
  }

  /** 🟢 Lấy sản phẩm theo ID */
  static async getProductById(id: string): Promise<ProductDocument | null> {
    return await ProductModel.findById(id)
      .populate("category", "name")
      .exec();
  }

  /** 🟢 Lấy sản phẩm theo slug */
  static async getProductBySlug(slug: string): Promise<ProductDocument | null> {
    return await ProductModel.findOne({ slug })
      .populate("category", "name")
      .exec();
  }

  /** 🟡 Cập nhật sản phẩm */
  static async updateProduct(id: string, data: UpdateProductInput) {
    const existing = await ProductModel.findById(id);
    if (!existing) return null;

    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/ /g, "-");
    }

    return await ProductModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  /** 🔴 Xóa sản phẩm */
  static async deleteProduct(id: string): Promise<boolean> {
    const product = await ProductModel.findById(id);
    if (!product) return false;

    await product.deleteOne();
    return true;
  }

  /** 🟢 Kích hoạt sản phẩm */
  static async activateProduct(id: string) {
    return await ProductModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
  }

  /** 🔴 Hủy kích hoạt sản phẩm */
  static async deactivateProduct(id: string) {
    return await ProductModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }
}

export default ProductService;
