import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductListProps {
  page: number;
  search: string;
  categories: string[];
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export default async function ProductList({
  page,
  search,
  categories,
  minPrice,
  maxPrice,
  sort,
}: ProductListProps) {
  // Build query string for API
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '12',
  });

  if (search) queryParams.append('search', search);
  categories.forEach(cat => queryParams.append('categories', cat));
  if (minPrice) queryParams.append('minPrice', minPrice);
  if (maxPrice) queryParams.append('maxPrice', maxPrice);
  if (sort) queryParams.append('sort', sort);

  // Fetch products
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams.toString()}`,
    {
      next: { revalidate: 0 },
      cache: 'no-store',
    },
  );

  const { data: products, pagination } =
    (await response.json()) as PaginatedResponse<Product>;

  const totalCount = pagination?.total || 0;

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center gap-2">
        <Package className="text-primary h-5 w-5" />
        <p className="text-lg font-semibold">
          {totalCount} sản phẩm tìm thấy
          {search && (
            <span className="text-muted-foreground ml-2">
              cho &quot;{search}&quot;
            </span>
          )}
        </p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 py-20 text-center">
          <Package className="mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold">
            Không tìm thấy sản phẩm
          </h3>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <Card
              key={product._id}
              className="group flex flex-col overflow-hidden border-0 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-64 flex-shrink-0">
                <Image
                  src={product.images[0] || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {product.deal > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <TrendingUp className="h-3 w-3" />
                      {((product.price - product.deal) / product.price * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <Package className="h-3 w-3" />
                      Còn {product.stock} sản phẩm
                    </span>
                  </div>
                )}
              </div>

              <CardContent className="flex flex-1 flex-col p-6">
                {/* Title - Fixed height */}
                <h3 className="mb-3 line-clamp-2 text-xl font-bold h-14">
                  {product.name}
                </h3>

                {/* Description - Fixed height */}
                {product.description ? (
                  <p className="text-muted-foreground mb-4 line-clamp-2 text-sm h-10">
                    {product.description}
                  </p>
                ) : (
                  <div className="mb-4 h-10" />
                )}

                <Separator className="my-4" />

                {/* Price & Button - Push to bottom */}
                <div className="mt-auto flex items-end justify-between">
                  <div className="flex flex-col">
                    {product.deal > 0 ? (
                      <>
                        <p className="text-muted-foreground text-sm line-through">
                          {product.price.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-primary text-2xl font-bold">
                          {product.deal.toLocaleString('vi-VN')}đ
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="h-5" />
                        <p className="text-primary text-2xl font-bold">
                          {product.price.toLocaleString('vi-VN')}đ
                        </p>
                      </>
                    )}
                  </div>
                  <Link href={`/products/${product.slug}`}>
                    <Button className="shadow-md">Xem →</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {products.length > 0 && pagination && pagination.totalPages > 1 && (
        <div className="mt-12">
          <Pagination pagination={pagination} itemName="sản phẩm" />
        </div>
      )}
    </div>
  );
}