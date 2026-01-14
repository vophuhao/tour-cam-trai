'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAllProduct } from '@/lib/client-actions';
import { useQuery } from '@tanstack/react-query';
import { Package, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function FeaturedProducts() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await getAllProduct();
      return response.data || [];
    },
  });

  return (
    <section className="bg-linear-to-b from-white to-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col items-center justify-between md:flex-row">
          <div>
            <span className="bg-primary/10 text-primary mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold">
              Sản phẩm
            </span>
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Thiết Bị Cắm Trại Chất Lượng
            </h2>
          </div>
          <Link href="/products">
            <Button variant="outline" size="lg" className="mt-4 md:mt-0">
              Xem tất cả sản phẩm →
            </Button>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((product: Product) => (
              <Card
                key={product._id}
                className="group flex flex-col overflow-hidden border-0 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-64 flex-shrink-0">
                  <Image
                    src={product.images[0] || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.deal > 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                        <TrendingUp className="h-3 w-3" />
                        {(
                          ((product.price - product.deal) / product.price) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  )}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                        <Package className="h-3 w-3" />
                        Còn {product.stock}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="flex flex-1 flex-col p-4">
                  {/* Title - Fixed height */}
                  <h3 className="mb-3 line-clamp-2 h-12 text-base font-semibold">
                    {product.name}
                  </h3>

                  {/* Price & Button - Push to bottom */}
                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                      {product.deal > 0 ? (
                        <>
                          <p className="text-muted-foreground text-sm line-through">
                            {product.price.toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-primary text-xl font-bold">
                            {product.deal.toLocaleString('vi-VN')}đ
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="h-5" />
                          <p className="text-primary text-xl font-bold">
                            {product.price.toLocaleString('vi-VN')}đ
                          </p>
                        </>
                      )}
                    </div>
                    <Link href={`/products/${product.slug}`}>
                      <Button size="sm" variant="outline">
                        Mua ngay
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-gray-100 py-20 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="text-muted-foreground text-lg">
              Đang cập nhật sản phẩm...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
