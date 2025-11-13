// ...existing code...
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useProductBySlug } from "@/hook/useProduct";
import { useCartActions } from "@/hook/useCart";

import { ProductDetail } from "@/types/product";
import React from "react";

export default function ProductDetailPage() {
    const { slug } = useParams() as { slug?: string };
    const router = useRouter();
    const { addToCart } = useCartActions();

    const { data, isLoading, error } = useProductBySlug(slug || "");

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [customError, setCustomError] = useState<string | null>(null);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (data) {
            if (data.success) setProduct(data.data ? (data.data as ProductDetail) : null);
            else setCustomError(data.message || "Không thể tải sản phẩm.");
        }
    }, [data]);

    useEffect(() => {
        if (error) setCustomError("Có lỗi khi tải sản phẩm.");
    }, [error]);

    if (isLoading) return <div className="p-8">Đang tải...</div>;
    if (customError) return <div className="p-8 text-red-600">Lỗi: {customError}</div>;
    if (!product) return <div className="p-8">Không tìm thấy sản phẩm.</div>;

    const images = product.images || [];
    const priceFinal = product.deal ? Math.round(product.price * (1 - product.deal / 100)) : product.price;
    const savings = product.deal ? Math.round(product.price - priceFinal) : 0;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* Breadcrumb / Back */}
            <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-gray-600 hover:text-[#3B6E5F] flex items-center gap-2"
                        aria-label="Quay lại"
                    >
                        ← Quay lại
                    </button>
                    <div className="text-xs text-gray-500">/</div>
                    <div className="text-sm text-gray-500">{product.category?.name || "Sản phẩm"}</div>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
                    <div className="inline-flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />{" "}
                        <span className="font-medium text-gray-700">{product.rating?.average ?? "—"}</span>
                        <span className="text-gray-400">({product.rating?.count ?? 0})</span>
                    </div>
                    <div className="text-gray-400">|</div>
                    <div className="text-gray-600">SKU: {product._id.slice(-8)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Gallery */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="rounded-xl bg-white shadow-lg overflow-hidden">
                        <div className="relative w-full h-[520px] bg-gray-50 flex items-center justify-center">
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
                                        onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow hover:bg-white"
                                        aria-label="Prev"
                                    >
                                        <ChevronLeft />
                                    </button>
                                    <button
                                        onClick={() => setIndex((i) => (i + 1) % images.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow hover:bg-white"
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
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border transition-all ${i === index ? "ring-2 ring-[#3B6E5F] border-transparent" : "border-gray-200 hover:border-[#BFDCCF]"
                                            }`}
                                        aria-label={`Ảnh ${i + 1}`}
                                    >
                                        <Image src={src} alt={`${product.name} ${i + 1}`} width={80} height={80} className="object-cover w-full h-full" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product description card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả sản phẩm</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>

                    {/* Specifications & Details */}

                    <div className="space-y-4">
                        {/* Single combined table: specifications + variants (variants as columns) */}
                        <div className="bg-white rounded-xl shadow p-5 overflow-x-auto">
                            <h4 className="font-semibold mb-4">Thông số & Biến thể</h4>

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
                                            <th className="text-left py-3 pr-4 font-medium text-gray-600 align-top">{s.label}</th>
                                            <td className="py-3 text-gray-700" colSpan={product.variants && product.variants.length > 0 ? product.variants.length : 1}>
                                                {s.value}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* If there are variants, render a header row for variant names */}
                                    {product.variants && product.variants.length > 0 && (
                                        <>
                                            <tr className="h-3"><td colSpan={1 + product.variants.length} /></tr>

                                            <tr className="bg-gray-50">
                                                <th className="text-left py-2 px-3 font-medium">Biến thể</th>
                                                {product.variants.map((v, vi) => (
                                                    <th key={`vh-${vi}`} className="text-left py-2 px-3 font-medium text-gray-700">
                                                        {v.size || `#${vi + 1}`}
                                                    </th>
                                                ))}
                                            </tr>

                                            {/* Rows for common variant attributes (expandedSize, foldedSize, loadCapacity, weight) */}
                                            {["expandedSize", "foldedSize", "loadCapacity", "weight"].map((attr) => {
                                                // human-friendly labels
                                                const labelMap: Record<string, string> = {
                                                    expandedSize: "Kích thước (mở rộng)",
                                                    foldedSize: "Kích thước (gấp)",
                                                    loadCapacity: "Tải trọng tối đa",
                                                    weight: "Trọng lượng",
                                                };
                                                // check if at least one variant has this attribute
                                                const hasAny = product.variants!.some((vv: any) => !!vv[attr as keyof typeof vv]);
                                                if (!hasAny) return null;

                                                return (
                                                    <tr key={attr} className="border-t">
                                                        <th className="py-3 pr-4 text-left text-gray-600 align-top">{labelMap[attr]}</th>
                                                        {product.variants!.map((vv: any, idx: number) => (
                                                            <td key={idx} className="py-3 text-gray-700">
                                                                {vv[attr as keyof typeof vv] ?? "—"}
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
                            <div className="bg-white rounded-xl shadow p-5">
                                <h4 className="font-semibold mb-3">Chi tiết</h4>
                                <div className="space-y-3 text-sm text-gray-700">
                                    {product.details.map((sec, si) => (
                                        <div key={si}>
                                            <div className="text-sm font-medium text-gray-800 mb-1">{sec.title}</div>
                                            <ul className="list-disc ml-5 text-gray-600">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {product.guide && product.guide.length > 0 && (
                            <div className="bg-white rounded-xl shadow p-5">
                                <h4 className="font-semibold mb-3">Hướng dẫn</h4>
                                <ol className="list-decimal ml-5 text-gray-700 space-y-2">
                                    {product.guide.map((g, i) => (
                                        <li key={i} className="text-sm">{g}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                        {product.warnings && product.warnings.length > 0 && (
                            <div className="bg-white rounded-xl shadow p-5 border border-red-50">
                                <h4 className="font-semibold mb-3 text-red-600">Lưu ý</h4>
                                <ul className="text-sm text-red-600 space-y-2">
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
                        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>

                            <div className="mt-4 flex items-baseline gap-3">
                                <div className="text-3xl font-extrabold text-[#2F6B56]">{product.deal.toLocaleString()}đ</div>
                                {product.deal ? (
                                    <div className="text-xl line-through text-gray-400">{product.price.toLocaleString()}đ</div>
                                ) : null}

                            </div>

                            <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                                <div>Kho: <span className="font-medium text-gray-800">{product.stock}</span></div>
                                <div className="h-4 w-px bg-gray-200 mx-2" />
                                <div>Danh mục: <span className="font-medium">{product.category?.name ?? "—"}</span></div>
                            </div>

                            {/* Variant selector (simple) */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="mt-4">
                                    <label className="text-sm text-gray-600">Biến thể</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {product.variants.map((v, i) => (
                                            <button key={i} className="px-3 py-1 rounded-md border border-gray-200 text-sm hover:bg-gray-50">
                                                {v.size || "—"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        if (!product?._id) return;
                                        addToCart({
                                            productId: product._id,
                                            quantity: 1,
                                        });
                                    }}
                                    
                                    className="w-full px-4 py-3 bg-[#2F6B56] hover:bg-[#25523f] text-white rounded-lg font-semibold shadow disabled:opacity-50"
                                >
                                     Thêm vào giỏ
                                </button>

                                <button className="w-full px-4 py-3 border rounded-lg font-semibold hover:bg-gray-50">Mua ngay</button>
                            </div>

                            <div className="mt-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Chia sẻ:</span>
                                    <div className="flex gap-2">
                                        <button className="px-2 py-1 border rounded text-xs">FB</button>
                                        <button className="px-2 py-1 border rounded text-xs">TT</button>
                                        <button className="px-2 py-1 border rounded text-xs">Liên kết</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                            <h4 className="font-semibold mb-2">Chính sách & giao hàng</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
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
