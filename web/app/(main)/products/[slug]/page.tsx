'use client';

import SimilarProducts from '@/components/home/list-product';
import ProductReviewsSection from '@/components/rating/ProductReviewsSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProductBySlug } from '@/hooks/useProduct';
import { addToCart, getProductsByCategoryName } from '@/lib/api';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Link2,
  Package,
  Share2,
  ShoppingCart,
  Star,
  Twitter,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug?: string };
  const router = useRouter();

  const { data, isLoading, error } = useProductBySlug(slug || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [ListProduct, setListProduct] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const categoryName = data?.data.category?.name || '';
      if (!categoryName) {
        setListProduct([]);
        return;
      }
      try {
        const res = await getProductsByCategoryName(categoryName, 1, 8);
        if (res.success) {
          // Ensure res.data is an array and cast to Product[] for the state setter
          const products = Array.isArray(res.data) ? (res.data as Product[]) : [];
          setListProduct(products);
        }
      } catch (e) {
        setListProduct([]);
      }
    };
    fetchProducts();
  }, [data?.data.category?.name]);




  const product = useMemo(() => {
    if (data?.success && data.data) {
      return data.data as ProductDetail;
    }
    return null;
  }, [data]);

  const customError = useMemo(() => {
    if (error) return 'Có lỗi khi tải sản phẩm.';
    if (data && !data.success) return data.message || 'Không thể tải sản phẩm.';
    return null;
  }, [data, error]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <Skeleton className="h-[520px] w-full rounded-xl" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (customError) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{customError}</AlertDescription>
        </Alert>
        <Button
          onClick={() => router.back()}
          className="mt-4"
          variant="outline"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>Không tìm thấy sản phẩm.</AlertDescription>
        </Alert>
        <Button
          onClick={() => router.back()}
          className="mt-4"
          variant="outline"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }
  const handleAddToCart = () => {
    if (!product?._id) return;
    addToCart({
      productId: product._id,
      quantity,
    });
    toast.success('Đã thêm vào giỏ hàng');

  };

  const images = product.images || [];
  const priceFinal = product.deal
    ? Math.round(product.price * (1 - product.deal / 100))
    : product.price;
  const hasDiscount = product.deal && product.deal > 0;
  console.log(product)
  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <span className="text-muted-foreground">/</span>
          <Badge variant="secondary">
            {product.category?.name || 'Sản phẩm'}
          </Badge>
        </div>


      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column - Gallery & Details */}
        <div className="space-y-6 lg:col-span-7">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-0">
              <div className="bg-muted relative flex h-[520px] items-center justify-center">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 700px"
                      className="object-contain p-6"
                      priority
                    />
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-1/2 left-4 -translate-y-1/2"
                          onClick={() =>
                            setSelectedImageIndex(
                              i => (i - 1 + images.length) % images.length,
                            )
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-1/2 right-4 -translate-y-1/2"
                          onClick={() =>
                            setSelectedImageIndex(i => (i + 1) % images.length)
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-muted-foreground">Không có ảnh</div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto p-4">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === selectedImageIndex
                        ? 'border-primary ring-primary/20 ring-2'
                        : 'hover:border-primary/50 border-transparent'
                        }`}
                    >
                      <Image
                        src={src}
                        alt={`${product.name} ${i + 1}`}
                        width={80}
                        height={80}
                        className="h-20 w-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Description, Specs, etc. */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="specs">Thông số</TabsTrigger>
              <TabsTrigger value="guide">Hướng dẫn</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mô tả sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description || 'Chưa có mô tả'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông số kỹ thuật</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.specifications &&
                    product.specifications.length > 0 ? (
                    <Table>
                      <TableBody>
                        {product.specifications.map((spec, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {spec.label}
                            </TableCell>
                            <TableCell>{spec.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">Chưa có thông số</p>
                  )}

                  {product.variants && product.variants.length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <h4 className="mb-4 font-semibold">Biến thể</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Biến thể</TableHead>
                            {product.variants.map((v, i) => (
                              <TableHead key={i}>
                                {v.size || `#${i + 1}`}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            'expandedSize',
                            'foldedSize',
                            'loadCapacity',
                            'weight',
                          ].map(attr => {
                            const labelMap: Record<string, string> = {
                              expandedSize: 'Kích thước (mở rộng)',
                              foldedSize: 'Kích thước (gấp)',
                              loadCapacity: 'Tải trọng tối đa',
                              weight: 'Trọng lượng',
                            };

                            const hasAny = product.variants!.some(
                              v =>
                                !!(
                                  v as unknown as Record<
                                    string,
                                    string | number | undefined
                                  >
                                )[attr],
                            );
                            if (!hasAny) return null;

                            return (
                              <TableRow key={attr}>
                                <TableCell className="font-medium">
                                  {labelMap[attr]}
                                </TableCell>
                                {product.variants!.map((v, idx) => (
                                  <TableCell key={idx}>
                                    {String(
                                      (
                                        v as unknown as Record<
                                          string,
                                          string | number | undefined
                                        >
                                      )[attr] || '—',
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </>
                  )}

                  {product.details && product.details.length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <h4 className="mb-4 font-semibold">Chi tiết</h4>
                      <div className="space-y-4">
                        {product.details.map((sec, i) => (
                          <div key={i}>
                            <h5 className="mb-2 font-medium">{sec.title}</h5>
                            <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                              {sec.items.map((it, ii) => (
                                <li key={ii}>{it.label}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guide" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {product.guide && product.guide.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hướng dẫn sử dụng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal space-y-2 pl-5 text-sm">
                        {product.guide.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {product.warnings && product.warnings.length > 0 && (
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-destructive">Lưu ý</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-destructive space-y-2 text-sm">
                        {product.warnings.map((w, i) => (
                          <li key={i} className="flex gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Purchase Panel */}
        <aside className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            {/* Main Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{product.rating?.average ?? 'Chưa có đánh giá'}</span>
                  {product.rating?.count ? (
                    <span className="text-muted-foreground">
                      ({product.rating.count} đánh giá)
                    </span>
                  ) : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-3">
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
                </div>

                <Separator />
                {/* Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Kho:</span>
                    <p className="font-medium">
                      {product.stock > 0
                        ? `${product.stock} sản phẩm`
                        : 'Hết hàng'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Danh mục:</span>
                    <p className="font-medium">
                      {product.category?.name ?? '—'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    Số lượng
                  </label>
                  <div className="inline-flex items-center overflow-hidden rounded-md border-2 border-gray-200">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="flex h-10 w-10 items-center justify-center bg-gray-50 text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200"
                      aria-label="Giảm số lượng"
                    >
                      <span className="text-lg font-semibold">−</span>
                    </button>
                    <div className="flex h-10 w-16 items-center justify-center bg-white">
                      <span className="text-base font-semibold text-gray-900">{quantity}</span>
                    </div>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="flex h-10 w-10 items-center justify-center bg-gray-50 text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200"
                      aria-label="Tăng số lượng"
                      disabled={quantity >= product.stock}
                    >
                      <span className="text-lg font-semibold">+</span>
                    </button>
                  </div>
                  {product.stock > 0 && quantity >= product.stock && (
                    <p className="mt-2 text-xs text-amber-600">
                      Đã đạt số lượng tối đa trong kho
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full"
                    size="lg"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Thêm vào giỏ
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={product.stock === 0}
                  >
                    Mua ngay
                  </Button>
                </div>

                <Separator />

                {/* Share */}
                <div>
                  <span className="text-muted-foreground mb-2 block text-sm">
                    Chia sẻ:
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Chính sách & Giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Miễn phí vận chuyển cho đơn trên 1.000.000₫</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Đổi trả trong 7 ngày nếu lỗi nhà sản xuất</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Hỗ trợ bảo hành 12 tháng</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá sản phẩm</h2>
        <ProductReviewsSection productId={product._id} />
      </div>

      <SimilarProducts
        categoryName={product.category.name}
        currentProductId={product._id}
      />
    </div>
  );
}
