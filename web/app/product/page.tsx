/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

'use client';

import PriceRangeSlider from '@/components/PriceRangeSlider';
import { useDebounce } from '@/hooks/useDebounce';
import {
  getAllCategories,
  getProduct,
  getProductsByCategoryName,
  getProductsByPriceRange,
  searchProductsFuzzy,
} from '@/lib/api';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Product = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  deal?: number;
  stock: number;
  images?: string[];
  category?: string;
  rating?: { average: number; count: number };
  count?: number;
  details?: { title: string; items: { label: string }[] }[];
};

export default function ProductsPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sort, setSort] = useState<string>('relevant');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const debouncedQ = useDebounce(q, 700);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);
  const perPage = 12;

  useEffect(() => {
    if (debouncedMinPrice === '' || debouncedMaxPrice === '') return;
    let mounted = true;

    async function loadProductsByPrice() {
      setLoading(true);
      try {
        const res = await getProductsByPriceRange(
          debouncedMinPrice as number,
          debouncedMaxPrice as number,
          category === 'all' ? undefined : category,
          1,
          perPage,
        );
        if (!mounted) return;
        setProducts(res.data as Product[]);
        setTotal(res.total);
        setPage(1);
      } catch (err) {
        console.error('Lỗi lấy sản phẩm theo giá', err);
        if (mounted) {
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProductsByPrice();

    return () => {
      mounted = false;
    };
  }, [debouncedMinPrice, debouncedMaxPrice, category]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getAllCategories();
        if (res?.success) {
          const dataArray = Array.isArray((res as any).data)
            ? (res as any).data
            : [];
          setCategories(['all', ...(dataArray.map((c: any) => c.name) || [])]);
        } else {
          setCategories(['all']);
        }
      } catch {
        setCategories(['all']);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        let res: any = null;

        if (debouncedQ.trim()) {
          res = await searchProductsFuzzy(debouncedQ.trim(), page, perPage);
        } else if (category !== 'all') {
          res = await getProductsByCategoryName(category, page, perPage);
        } else {
          res = await getProduct(page, perPage);
        }

        if (!mounted) return;

        setProducts((res?.data as Product[]) || []);
        setTotal(res?.total || 0);
      } catch (err) {
        console.error('Load products error', err);
        if (mounted) {
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [debouncedQ, category, page]);

  const filteredCount = total || products.length;

  const priceSummary = useMemo(() => {
    if (!products.length) return { min: 0, max: 0 };
    const prices = products.map(p => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header + Controls */}
        <div className="mb-10 rounded-2xl border bg-white/90 p-8 shadow-lg backdrop-blur-sm">
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Danh mục</label>
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'Tất cả' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <input
                value={q}
                onChange={e => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm sản phẩm, địa điểm, mô tả..."
                className="mt-1 w-full rounded-lg border bg-white px-4 py-2 text-sm focus:ring-2"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6 rounded-2xl border bg-white p-6 shadow">
              <h3 className="text-lg font-semibold">Bộ lọc nhanh</h3>

              <div>
                <label className="text-sm">Khoảng giá</label>

                <PriceRangeSlider
                  valueMin={minPrice || 10000}
                  valueMax={maxPrice || 10000000}
                  minLimit={10000}
                  maxLimit={10000000}
                  step={10000}
                  onChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </aside>

          {/* Product List */}
          <section className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border bg-white p-6 shadow-lg"
                  >
                    <div className="mb-4 h-48 rounded-lg bg-green-100" />
                    <div className="mb-2 h-4 w-3/4 rounded bg-green-200" />
                    <div className="h-3 w-1/2 rounded bg-green-200" />
                  </div>
                ))}
              </div>
            ) : products.data.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center text-green-700 shadow">
                Không tìm thấy sản phẩm.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {products.data.map(p => (
                    <article
                      key={p.id}
                      className="transform overflow-hidden rounded-2xl border bg-white shadow transition-transform hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="h-56 overflow-hidden">
                        {p.images && p.images.length ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex h-full flex-col p-4">
                        <h3 className="line-clamp-2 text-lg font-bold">
                          {p.name}
                        </h3>
                        <p className="0 mt-1 line-clamp-2 text-sm">
                          {p.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-lg font-bold text-orange-600">
                            {(p.price - (p.deal || 0)).toLocaleString('vi-VN')}₫
                          </div>
                          <Link
                            href={`/product/${p.slug || p.id}`}
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white shadow hover:bg-green-700"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage(s => Math.max(1, s - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-green-300 px-4 py-2 text-black hover:bg-green-50 disabled:opacity-40"
                  >
                    ← Trước
                  </button>

                  <div className="rounded-lg bg-green-500 px-4 py-2 text-white shadow">
                    {page} / {Math.ceil((total || 0) / perPage)}
                  </div>

                  <button
                    onClick={() => setPage(s => s + 1)}
                    disabled={page >= Math.ceil((total || 0) / perPage)}
                    className="rounded-lg border border-green-300 px-4 py-2 text-black hover:bg-green-50 disabled:opacity-40"
                  >
                    Sau →
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
