// ...existing code...
'use client';

import { useProductBySlug } from '@/hooks/useProduct';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug?: string };
  const router = useRouter();

  const { data, isLoading, error } = useProductBySlug(slug || '');

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (data) {
      if (data.success)
        setProduct(data.data ? (data.data as ProductDetail) : null);
      else setCustomError(data.message || 'Không thể tải sản phẩm.');
    }
  }, [data]);

  useEffect(() => {
    if (error) setCustomError('Có lỗi khi tải sản phẩm.');
  }, [error]);

  if (isLoading) return <div className="p-8">Đang tải...</div>;
  if (customError)
    return <div className="p-8 text-red-600">Lỗi: {customError}</div>;
  if (!product) return <div className="p-8">Không tìm thấy sản phẩm.</div>;

  const images = product.images || [];
  const priceFinal = product.deal
    ? Math.round(product.price * (1 - product.deal / 100))
    : product.price;
  const savings = product.deal ? Math.round(product.price - priceFinal) : 0;

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      {/* Breadcrumb / Back */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#3B6E5F]"
            aria-label="Quay lại"
          >
            ← Quay lại
          </button>
          <div className="text-xs text-gray-500">/</div>
          <div className="text-sm text-gray-500">
            {product.category?.name || 'Sản phẩm'}
          </div>
        </div>

        <div className="hidden items-center gap-3 text-sm text-gray-500 sm:flex">
          <div className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />{' '}
            <span className="font-medium text-gray-700">
              {product.rating?.average ?? '—'}
            </span>
            <span className="text-gray-400">
              ({product.rating?.count ?? 0})
            </span>
          </div>
          <div className="text-gray-400">|</div>
          <div className="text-gray-600">SKU: {product._id.slice(-8)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Gallery */}
        <div className="space-y-4 lg:col-span-7">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="relative flex h-[520px] w-full items-center justify-center bg-gray-50">
              {images.length > 0 ? (
                <Image
                  src={images[index]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-contain p-6"
                />
              ) : (
                <div className="text-gray-400">Không có ảnh</div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setIndex(i => (i - 1 + images.length) % images.length)
                    }
                    className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow hover:bg-white"
                    aria-label="Prev"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => setIndex(i => (i + 1) % images.length)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow hover:bg-white"
                    aria-label="Next"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 overflow-x-auto py-3">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                      i === index
                        ? 'border-transparent ring-2 ring-[#3B6E5F]'
                        : 'border-gray-200 hover:border-[#BFDCCF]'
                    }`}
                    aria-label={`Ảnh ${i + 1}`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} ${i + 1}`}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product description card */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Mô tả sản phẩm
            </h3>
            <p className="leading-relaxed whitespace-pre-line text-gray-700">
              {product.description}
            </p>
          </div>

          {/* Specifications & Details */}

          <div className="space-y-4">
            {/* Single combined table: specifications + variants (variants as columns) */}
            <div className="overflow-x-auto rounded-xl bg-white p-5 shadow">
              <h4 className="mb-4 font-semibold">Thông số & Biến thể</h4>

              {/*
      Table layout:
      - First column: label
      - Next N columns: one per variant (if any)
      - For non-variant specs we render a row with the value spanning variant columns
    */}

              <table className="w-full text-sm text-gray-700">
                <colgroup>
                  <col className="w-1/3" />
                  {product.variants && product.variants.length > 0 ? (
                    product.variants.map((_, i) => <col key={i} />)
                  ) : (
                    <col />
                  )}
                </colgroup>

                <tbody>
                  {/* Render basic specifications as label + value (value spans variant columns) */}
                  {product.specifications?.map((s, i) => (
                    <tr key={`spec-${i}`} className="border-t last:border-b-0">
                      <th className="py-3 pr-4 text-left align-top font-medium text-gray-600">
                        {s.label}
                      </th>
                      <td
                        className="py-3 text-gray-700"
                        colSpan={
                          product.variants && product.variants.length > 0
                            ? product.variants.length
                            : 1
                        }
                      >
                        {s.value}
                      </td>
                    </tr>
                  ))}

                  {/* If there are variants, render a header row for variant names */}
                  {product.variants && product.variants.length > 0 && (
                    <>
                      <tr className="h-3">
                        <td colSpan={1 + product.variants.length} />
                      </tr>

                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-medium">
                          Biến thể
                        </th>
                        {product.variants.map((v, vi) => (
                          <th
                            key={`vh-${vi}`}
                            className="px-3 py-2 text-left font-medium text-gray-700"
                          >
                            {v.size || `#${vi + 1}`}
                          </th>
                        ))}
                      </tr>

                      {/* Rows for common variant attributes (expandedSize, foldedSize, loadCapacity, weight) */}
                      {[
                        'expandedSize',
                        'foldedSize',
                        'loadCapacity',
                        'weight',
                      ].map(attr => {
                        // human-friendly labels
                        const labelMap: Record<string, string> = {
                          expandedSize: 'Kích thước (mở rộng)',
                          foldedSize: 'Kích thước (gấp)',
                          loadCapacity: 'Tải trọng tối đa',
                          weight: 'Trọng lượng',
                        };
                        // check if at least one variant has this attribute
                        const hasAny = product.variants!.some(
                          (vv: any) => !!vv[attr as keyof typeof vv],
                        );
                        if (!hasAny) return null;

                        return (
                          <tr key={attr} className="border-t">
                            <th className="py-3 pr-4 text-left align-top text-gray-600">
                              {labelMap[attr]}
                            </th>
                            {product.variants!.map((vv: any, idx: number) => (
                              <td key={idx} className="py-3 text-gray-700">
                                {vv[attr as keyof typeof vv] ?? '—'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}

                      {/* If variants have other custom fields, you can add more rows similarly */}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Details (unchanged) */}
            {product.details && product.details.length > 0 && (
              <div className="rounded-xl bg-white p-5 shadow">
                <h4 className="mb-3 font-semibold">Chi tiết</h4>
                <div className="space-y-3 text-sm text-gray-700">
                  {product.details.map((sec, si) => (
                    <div key={si}>
                      <div className="mb-1 text-sm font-medium text-gray-800">
                        {sec.title}
                      </div>
                      <ul className="ml-5 list-disc text-gray-600">
                        {sec.items.map((it, ii) => (
                          <li key={ii}>{it.label}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guide & Warnings */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {product.guide && product.guide.length > 0 && (
              <div className="rounded-xl bg-white p-5 shadow">
                <h4 className="mb-3 font-semibold">Hướng dẫn</h4>
                <ol className="ml-5 list-decimal space-y-2 text-gray-700">
                  {product.guide.map((g, i) => (
                    <li key={i} className="text-sm">
                      {g}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {product.warnings && product.warnings.length > 0 && (
              <div className="rounded-xl border border-red-50 bg-white p-5 shadow">
                <h4 className="mb-3 font-semibold text-red-600">Lưu ý</h4>
                <ul className="space-y-2 text-sm text-red-600">
                  {product.warnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sticky purchase panel */}
        <aside className="lg:col-span-5">
          <div className="sticky top-6 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h2>

              <div className="mt-4 flex items-baseline gap-3">
                <div className="text-3xl font-extrabold text-[#2F6B56]">
                  {product.deal.toLocaleString()}đ
                </div>
                {product.deal ? (
                  <div className="text-xl text-gray-400 line-through">
                    {product.price.toLocaleString()}đ
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                <div>
                  Kho:{' '}
                  <span className="font-medium text-gray-800">
                    {product.stock}
                  </span>
                </div>
                <div className="mx-2 h-4 w-px bg-gray-200" />
                <div>
                  Danh mục:{' '}
                  <span className="font-medium">
                    {product.category?.name ?? '—'}
                  </span>
                </div>
              </div>

              {/* Variant selector (simple) */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm text-gray-600">Biến thể</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
                      >
                        {v.size || '—'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <button className="w-full rounded-lg bg-[#2F6B56] px-4 py-3 font-semibold text-white shadow hover:bg-[#25523f]">
                  Thêm vào giỏ
                </button>
                <button className="w-full rounded-lg border px-4 py-3 font-semibold hover:bg-gray-50">
                  Mua ngay
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Chia sẻ:</span>
                  <div className="flex gap-2">
                    <button className="rounded border px-2 py-1 text-xs">
                      FB
                    </button>
                    <button className="rounded border px-2 py-1 text-xs">
                      TT
                    </button>
                    <button className="rounded border px-2 py-1 text-xs">
                      Liên kết
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow">
              <h4 className="mb-2 font-semibold">Chính sách & giao hàng</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Miễn phí vận chuyển cho đơn trên 1.000.000₫</li>
                <li>• Đổi trả trong 7 ngày nếu lỗi nhà sản xuất</li>
                <li>• Hỗ trợ bảo hành 12 tháng</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
