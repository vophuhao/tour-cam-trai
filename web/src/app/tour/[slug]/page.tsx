// ...existing code...
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, } from "next/navigation";
import { useGetTourBySlug } from "@/hook/useTour";

export default function TourDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: tour, isLoading, error } = useGetTourBySlug(slug);

  const [selectedPrice, setSelectedPrice] = useState<any | null>(null);
  const [people, setPeople] = useState(2);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);

  // Init selectedPrice and mainImage when tour loads
  useEffect(() => {
    if (!tour) return;
    const opts = tour.data?.priceOptions ?? [];
    setSelectedPrice((prev: any) => prev ?? opts[0] ?? null);
    setMainImage((prev) => prev ?? (tour.data?.images?.[0] ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);

  // Derive t and computed values before any early returns so hooks run in consistent order
  const t = tour?.data ?? {};
  const formatCurrency = (v: number) =>
    v?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const totalPrice = useMemo(() => {
    const unit = selectedPrice?.price ?? t.priceOptions?.[0]?.price ?? 0;
    return unit * Math.max(1, people || 1);
  }, [selectedPrice, people, tour?.data?.priceOptions]);

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải thông tin tour...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Không tải được dữ liệu tour: {(error as Error).message}
      </div>
    );

  if (!tour)
    return (
      <div className="p-10 text-center text-gray-500">
        Không tìm thấy tour
      </div>
    );

  return (
    <main className="max-w-6xl mx-auto p-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT CONTENT */}
        <div className="md:col-span-2 space-y-6">
          {/* Gallery card */}
          <div className="rounded-lg overflow-hidden shadow-lg bg-white">
            <div className="relative w-full h-96 bg-gray-100">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={t.name}
                  fill
                  priority
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-gray-400">Chưa có ảnh</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="p-4 border-t">
              <h1 className="text-2xl font-bold">{t.name}</h1>
              <p className="mt-2 text-gray-700">{t.description}</p>

              <div className="mt-4 flex gap-3 items-center text-sm text-gray-600 flex-wrap">
                <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
                  🕒 {t.durationDays} ngày {t.durationNights} đêm
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
                  🚍 {t.transportation}
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
                  🏕️ {t.stayType}
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
                  📍 {t.departurePoint}
                </span>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto">
                {(t.images ?? []).map((img: string, i: number) => (
                  <button
                    key={`thumb-${i}`}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-24 h-16 rounded overflow-hidden border ${mainImage === img ? "ring-2 ring-emerald-500" : "border-gray-200"
                      }`}
                    aria-label={`Xem ảnh ${i + 1}`}
                  >
                    <Image src={img} alt={`${t.name}-${i}`} width={96} height={64} style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lịch trình chi tiết (accordion cải tiến) */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">Lịch trình chi tiết</h2>
            <div className="mt-3 space-y-3">
              {(t.itinerary ?? []).map((day: any, dayIndex: number) => (
                <div key={`day-${dayIndex}-${day.day}`} className="border rounded overflow-hidden">
                  <button
                    className="w-full text-left p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                    onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                    aria-expanded={openDay === day.day}
                  >
                    <div>
                      <div className="font-medium">Ngày {day.day}: {day.title}</div>
                      <div className="text-xs text-gray-500">{day.summary}</div>
                    </div>
                    <div className="text-gray-500 text-xl">{openDay === day.day ? "−" : "+"}</div>
                  </button>

                  {openDay === day.day && (
                    <div className="p-3 border-t bg-white">
                      {(day.activities ?? []).map((a: any, actIndex: number) => (
                        <div key={`act-${day.day}-${actIndex}`} className="text-sm mb-3">
                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-1 text-left text-gray-500 text-xs pr-2">
                              {a.timeFrom ? `${a.timeFrom}${a.timeTo ? ` - ${a.timeTo}` : ""}` : ""}
                            </div>
                            <div className="col-span-11">
                              <div className="font-medium">{a.title}</div>
                              <div className="text-gray-600 whitespace-pre-line">{a.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dịch vụ (3 cột nhỏ) */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">Bao gồm</h3>
              <ul className="mt-2 text-sm space-y-1  overflow-auto">
                {(t.servicesIncluded ?? []).flatMap((s: any) =>
                  (s.details ?? []).map((d: any, i: number) => (
                    <li key={`inc-${i}`} className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>{d.value}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">Không bao gồm</h3>
              <ul className="mt-2 text-sm space-y-1 overflow-auto">
                {(t.servicesExcluded ?? []).flatMap((s: any) =>
                  (s.details ?? []).map((d: any, i: number) => (
                    <li key={`exc-${i}`} className="flex items-start gap-2">
                      <span className="text-gray-500">•</span>
                      <span>{d.value}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">Lưu ý</h3>
              <ul className="mt-2 text-sm space-y-1  overflow-auto">
                {(t.notes ?? []).flatMap((s: any, noteIndex: number) =>
                  (s.details ?? []).map((d: any, i: number) => (
                    <li key={`note-${noteIndex}-${i}`} className="flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      <span>{d.value}</span>
                    </li>
                  ))
                )}

              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (sticky) */}
        <aside className="md:col-span-1">
          <div className="md:sticky md:top-6 bg-white p-4 rounded-lg shadow space-y-4">
            <div>
              <div className="text-sm text-gray-500">Giá từ</div>
              <div className="text-2xl font-bold text-emerald-600">
                {selectedPrice ? formatCurrency(selectedPrice.price) : formatCurrency(t.priceOptions?.[0]?.price ?? 0)}
              </div>
              <div className="text-sm text-gray-500 mt-1">{selectedPrice?.name}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Chọn gói</label>
              <select
                value={selectedPrice?.name ?? t.priceOptions?.[0]?.name ?? ""}
                onChange={(e) => {
                  const opt = (t.priceOptions ?? []).find((p: any) => p.name === e.target.value);
                  if (opt) setSelectedPrice(opt);
                }}
                className="mt-1 block w-full border rounded p-2"
              >
                {(t.priceOptions ?? []).map((p: any, i: number) => (
                  <option key={`price-${i}-${p.name}`} value={p.name}>
                    {p.name} — {formatCurrency(p.price)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Số lượng người</label>
              <input
                type="number"
                min={1}
                value={people}
                onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Giá/khách</span>
                <span>{formatCurrency(selectedPrice?.price ?? t.priceOptions?.[0]?.price ?? 0)}</span>
              </div>
              <div className="flex justify-between font-medium mt-2">
                <span>Tổng ({people} người)</span>
                <span className="text-emerald-600">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Đặt tour ${t.name} thành công! Tổng: ${formatCurrency(totalPrice)}`)}
              className="mt-2 w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
            >
              Đặt ngay
            </button>

            <div className="text-xs text-gray-500">
              <p>Khởi hành: {t.departurePoint}</p>
              {t.departureFrequency && <p>Lịch: {t.departureFrequency}</p>}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
// ...existing code...