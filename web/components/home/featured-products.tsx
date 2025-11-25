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
            <h2 className="mb-3 text-4xl font-bold md:text-5xl">
              Thiết Bị Cắm Trại Chất Lượng
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Trang bị đầy đủ cho chuyến đi của bạn
            </p>
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
                className="group overflow-hidden border-0 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-64">
                  <Image
                    src={product.images[0] || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.deal > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                        <TrendingUp className="h-3 w-3" />-{product.deal}%
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-3 line-clamp-2 text-base font-semibold">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary text-xl font-bold">
                        {product.price.toLocaleString('vi-VN')}đ
                      </p>
                      {product.deal > 0 && (
                        <p className="text-muted-foreground text-sm line-through">
                          {Math.round(
                            product.price / (1 - product.deal / 100),
                          ).toLocaleString('vi-VN')}
                          đ
                        </p>
                      )}
                    </div>
                    <Link href={`/product/${product._id}`}>
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
