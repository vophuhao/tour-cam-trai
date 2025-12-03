'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getProductsByCategoryName } from '@/lib/client-actions';

interface SimilarProductsProps {
    categoryName: string;
    currentProductId: string;
}

export default function SimilarProducts({
    categoryName,
    currentProductId,
}: SimilarProductsProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['similar-products', categoryName],
        queryFn: async () => {
            const response = await getProductsByCategoryName(categoryName, 1, 10);
            if (response?.success) {
                return response;
            }
            return { success: false, data: { data: [] } };
        },
    });

    const products = Array.isArray(data?.data?.data) ? data.data.data : [];
    const filteredProducts = products
        .filter((p: Product) => p._id !== currentProductId)
        .slice(0, 4);

    if (isLoading) {
        return (
            <section className="mt-16 border-t pt-16">
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </section>
        );
    }

    if (filteredProducts.length === 0) {
        return null;
    }

    return (
        <section className="mt-4">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Sản phẩm tương tự</h2>
                <p className="text-gray-600">Các sản phẩm khác bạn có thể quan tâm</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product: Product) => {
                    const hasDiscount = product.deal > 0;
                    const finalPrice = hasDiscount
                        ? Math.round(product.price * (1 - product.deal / 100))
                        : product.price;

                    return (
                        <Card key={product._id} className="overflow-hidden">
                            <Link href={`/products/${product.slug}`}>
                                <div className="relative h-48 bg-gray-100">
                                    <Image
                                        src={product.images[0] || '/placeholder.jpg'}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {hasDiscount && (
                                        <Badge className="absolute left-2 top-2 bg-red-500">
                                            -{product.deal}%
                                        </Badge>
                                    )}
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <Badge variant="destructive">Hết hàng</Badge>
                                        </div>
                                    )}
                                </div>
                            </Link>

                            <CardContent className="p-4">
                                <Link href={`/products/${product.slug}`}>
                                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold hover:text-blue-600">
                                        {product.name}
                                    </h3>
                                </Link>

                                <div className="mb-3">
                                    {product.deal && (
                                        <p className="text-lg font-bold text-gray-900 ">
                                            {product.deal.toLocaleString('vi-VN')}₫
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 line-through">
                                        {product.price.toLocaleString('vi-VN')}₫
                                    </p>

                                </div>

                                <Link href={`/products/${product.slug}`}>
                                    <Button
                                        className="w-full"
                                        size="sm"
                                        disabled={product.stock === 0}
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        {product.stock === 0 ? 'Hết hàng' : 'Xem'}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}