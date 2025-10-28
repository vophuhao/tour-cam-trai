"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductDetail } from "@/types/product";

interface ProductListProps {
  products: ProductDetail[];
}

export default function ProductList({ products }: ProductListProps) {
  console.log("Rendering ProductList with products:", products);

  return (
    <section className="w-full ">
      <div className="max-w-7xl mx-auto ">
        {products.length === 0 ? (
          <p className="text-gray-400">Hiện chưa có sản phẩm nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                href={`/product/${product.slug || product._id}`}
                key={product._id}
                className="group bg-[#1c1a18] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Hình ảnh */}
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={product.images?.[0] || "/images/default-product.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent"></div>
                </div>

                {/* Nội dung */}
                <div className="p-4 text-[#E8E8E8]">
                  <h3 className="text-lg font-semibold mb-1 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Giá (hiển thị deal nếu có) */}
                  {product.deal && product.deal > 0 ? (
                    <div className="mb-3">
                      <p className="text-yellow-400 font-bold">
                        {(product.price - product.deal).toLocaleString()}đ
                      </p>
                      <p className="text-gray-400 text-sm line-through">
                        {product.price.toLocaleString()}đ
                      </p>
                    </div>
                  ) : (
                    <p className="text-yellow-400 font-bold mb-3">
                      {product.price.toLocaleString()}đ
                    </p>
                  )}

                  {/* Tồn kho */}
                  <p className="text-sm text-gray-400 mb-1">
                    Tồn kho: {product.stock}
                  </p>

                  {/* Rating */}
                  {product.rating && product.rating.count > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      <span>⭐ {product.rating.average.toFixed(1)}</span>
                      <span>({product.rating.count})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
