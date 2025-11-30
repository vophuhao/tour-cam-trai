// ...existing code...
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ProductListProps {
    products: ProductDetail[];
}

export default function ProductList({ products }: ProductListProps) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);

    useEffect(() => {
        function update() {
            const w = window.innerWidth;
            // responsive: mobile 1, sm 2, md 3, lg+ 4
            if (w < 640) setItemsPerPage(1);
            else if (w < 768) setItemsPerPage(2);
            else if (w < 1024) setItemsPerPage(3);
            else setItemsPerPage(4);
            setPageIndex(0);
        }
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    if (!products || products.length === 0) {
        return (
            <section className="w-full">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-gray-400">Hiện chưa có sản phẩm nào.</p>
                </div>
            </section>
        );
    }

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const goPrev = () => setPageIndex((p) => Math.max(0, p - 1));
    const goNext = () => setPageIndex((p) => Math.min(totalPages - 1, p + 1));

    // compute translateX based on pageIndex and card width (measured)
    const getTrackStyle = (): React.CSSProperties => {
        const cardEl = cardRef.current;
        const gap = 16; // gap in px (match tailwind gap-4)
        const cardWidth = cardEl ? cardEl.clientWidth : 280;
        const offset = (cardWidth + gap) * itemsPerPage * pageIndex;
        return {
            transform: `translateX(-${offset}px)`,
            transition: "transform 400ms ease",
        };
    };

    return (
        <section className="w-full">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-end mb-4">

                    <div className="flex items-center gap-2">
                        <button
                            onClick={goPrev}
                            disabled={pageIndex === 0}
                            className="w-10 h-10 rounded-md bg-white shadow-sm disabled:opacity-40 flex items-center justify-center"
                            aria-label="Previous"
                        >
                            ‹
                        </button>

                        <div className="text-sm text-gray-600 select-none">
                            {pageIndex + 1}/{totalPages}
                        </div>

                        <button
                            onClick={goNext}
                            disabled={pageIndex >= totalPages - 1}
                            className="w-10 h-10 rounded-md bg-white shadow-sm disabled:opacity-40 flex items-center justify-center"
                            aria-label="Next"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* viewport (overflow hidden) */}
                <div className="overflow-hidden">
                    {/* track: flex row, we translate this by pages */}
                    <div
                        ref={trackRef}
                        className="flex gap-4"

                    >
                        {products.map((product, idx) => (
                            <Link
                                href={`/products/${product.slug }`}
                                key={product._id}
                                className="shrink-0"
                            // set a ref on first card to measure width
                            >
                                <div
                                    ref={idx === 0 ? cardRef : null}
                                    className="product-card w-[220px] sm:w-[240px] md:w-[260px] lg:w-[300px] h-[400px]"
                                >
                                    <article className="h-full bg-white dark:bg-neutral-900 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex flex-col">
                                        <div className="relative w-full h-68  overflow-hidden">
                                            <Image
                                                src={product.images[0]}
                                                alt={`${product.name} ${idx + 1}`}
                                                width={80}
                                                height={80}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute left-3 top-3 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-md">
                                                {product.deal && product.deal > 0 ? "Giảm" : "Mới"}
                                            </div>
                                        </div>

                                        <div className="p-3 flex-1 flex flex-col justify-between text-neutral-900 dark:text-neutral-100">
                                            <div>
                                                <h3 className=" text-sm md:text-md font-medium mb-2 line-clamp-2">{product.name}</h3>

                                                {product.deal && product.deal > 0 ? (
                                                    <div className="flex items-baseline gap-3 mb-2">
                                                        <span className="text-lg font-bold text-red-500">{(product.price - product.deal).toLocaleString()}đ</span>
                                                        <span className="text-sm text-gray-400 line-through">{product.price.toLocaleString()}đ</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-lg font-bold text-yellow-500 mb-2">{product.price.toLocaleString()}đ</p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>Kho: {product.stock}</span>

                                                <span>Đã bán : {product.count}</span>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
