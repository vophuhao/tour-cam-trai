// ...existing code...
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getTours,
} from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

type Tour = {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  price: number;
  discount?: number;
  seats: number;
  images?: string[];
  location?: string;
  duration?: string;
  rating?: { average: number; count: number };
};

export default function ToursPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const debouncedQ = useDebounce(q, 700);
  const perPage = 12;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
    
        const res = await getTours(page, perPage);
        

        if (!mounted) return;
        console.log("Tours loaded:", res);

        setTours(res?.data || []);
        console.log("Tours loaded:", tours);
        setTotal(res?.total || 0);
      } catch (err) {
        console.error("Load tours error", err);
        if (mounted) {
          setTours([]);
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

  const resultCount = total || tours.length;

  const priceSummary = useMemo(() => {
    if (!tours.length) return { min: 0, max: 0 };
    const prices = tours.map((t) => t.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [tours]);

  return (
    <div className="min-h-screen py-10 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur rounded-2xl border border-blue-200 shadow p-8 mb-8">
          <h1 className="text-3xl font-bold text-blue-800">🌄 Tour & Lịch Trình</h1>
          <p className="text-blue-600 mt-2">{resultCount} kết quả</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div>
              <label className="text-sm font-medium text-blue-700">Danh mục</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full mt-1 border border-blue-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-200"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Tất cả" : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-blue-700">Tìm kiếm</label>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Tìm tour, địa điểm, mô tả..."
                className="w-full mt-1 border border-blue-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setPage(1)}
                className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 bg-white rounded-2xl border border-blue-200 shadow p-6 space-y-6">
              <h3 className="font-semibold text-lg text-blue-800">Bộ lọc nhanh</h3>

              <div>
                <label className="text-sm text-blue-600">Khoảng giá</label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder={`${priceSummary.min}`}
                    className="w-1/2 border border-blue-300 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder={`${priceSummary.max}`}
                    className="w-1/2 border border-blue-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-600">Tình trạng chỗ</label>
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    onClick={() => { setMinPrice(""); setMaxPrice(""); setQ(""); setCategory("all"); setPage(1); }}
                    className="px-3 py-2 rounded-lg hover:bg-blue-50 text-left"
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => { setMinPrice(1); setMaxPrice(9999999); setPage(1); }}
                    className="px-3 py-2 rounded-lg hover:bg-blue-50 text-left"
                  >
                    Còn chỗ
                  </button>
                  <button
                    onClick={() => { setMinPrice(""); setMaxPrice(0); setPage(1); }}
                    className="px-3 py-2 rounded-lg hover:bg-blue-50 text-left"
                  >
                    Hết chỗ
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Tour list */}
          <section className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
                    <div className="h-48 bg-blue-50 rounded-lg mb-4" />
                    <div className="h-4 bg-blue-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-blue-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : tours.data.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-10 text-center text-blue-700">
                Không tìm thấy tour.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                  {tours.data.map((t) => (
                    <article
                      key={t.id}
                      className="bg-white rounded-2xl overflow-hidden border border-blue-200 shadow hover:shadow-2xl transition-transform transform hover:-translate-y-1"
                    >
                      <div className="h-56 bg-blue-50 overflow-hidden relative ">
                        {t.images && t.images.length ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.images[0]} alt={t.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-400">No image</div>
                        )}

                        <div className="absolute left-3 top-3 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                          {t.duration || "—"}
                        </div>
                        <div className="absolute right-3 top-3 bg-white/90 text-sm px-2 py-1 rounded text-blue-700">
                          {t.location || "N/A"}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-blue-800 line-clamp-2">{t.title}</h3>
                        <p className="text-sm text-blue-600 mt-1 line-clamp-2">{t.excerpt}</p>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-indigo-600 font-bold text-lg">
                            {(t.price - (t.discount || 0)).toLocaleString("vi-VN")}₫
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/tour/${t.slug || t.id}`}
                              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 shadow"
                            >
                              Xem chi tiết
                            </Link>
                            <button
                              disabled={t.seats <= 0}
                              className={`px-3 py-2 rounded-lg border text-sm ${t.seats > 0 ? "bg-white hover:bg-blue-50" : "opacity-50 cursor-not-allowed"}`}
                            >
                              Đặt tour
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPage((s) => Math.max(1, s - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-40"
                  >
                    ← Trước
                  </button>

                  <div className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow">
                    {page} / {Math.ceil((total || 0) / perPage)}
                  </div>

                  <button
                    onClick={() => setPage((s) => s + 1)}
                    disabled={page >= Math.ceil((total || 0) / perPage)}
                    className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-40"
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
// ...existing code...