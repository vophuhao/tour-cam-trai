'use client';

import PageBreadcrumb from '@/components/page-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetTourBySlug } from '@/hooks/useTour';
import { formatCurrency } from '@/lib/utils';
import {
  AlertCircle,
  Bus,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Star,
  Tent,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

// Loading skeleton component
function TourDetailSkeleton() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* Breadcrumb Skeleton */}
      <div className="gradient-primary-green mb-6 rounded-lg p-4">
        <Skeleton className="h-6 w-48 bg-white/20" />
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Content Skeleton */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <Skeleton className="aspect-video w-full" />
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Skeleton */}
        <aside className="lg:col-span-1">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

// Main tour detail component
function TourDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const { data: tour, isLoading, error } = useGetTourBySlug(slug);

  const [people, setPeople] = useState(2);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);

  // Derive tour data with proper typing
  const t = (tour?.data ?? {}) as any;

  // Derive selected price from index - no useEffect needed
  const selectedPrice = useMemo(() => {
    const opts = t.priceOptions ?? [];
    return opts[selectedPriceIndex] ?? opts[0] ?? null;
  }, [t.priceOptions, selectedPriceIndex]);

  // Derive main image - use tour image if mainImage not set
  const displayImage = useMemo(() => {
    return mainImage ?? t.images?.[0] ?? null;
  }, [mainImage, t.images]);

  // Memoize totalPrice calculation - only recalculate when price or people change
  const totalPrice = useMemo(() => {
    const unit = selectedPrice?.price ?? t.priceOptions?.[0]?.price ?? 0;
    return unit * Math.max(1, people || 1);
  }, [selectedPrice?.price, people, t.priceOptions]);

  if (isLoading)
    return <div className="loading-center">Đang tải thông tin tour...</div>;

  if (error)
    return (
      <div className="error-center">
        Không tải được dữ liệu tour: {(error as Error).message}
      </div>
    );

  if (!tour) return <div className="loading-center">Không tìm thấy tour</div>;

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* Breadcrumb */}
      <div className="gradient-primary-green mb-6 rounded-lg p-4">
        <PageBreadcrumb
          items={[
            { label: 'Tours', href: '/tour' },
            { label: t.name || 'Chi tiết tour' },
          ]}
        />
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT CONTENT */}
        <div className="space-y-6 lg:col-span-2">
          {/* Gallery Card with Modern Design */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full bg-linear-to-br from-gray-100 to-gray-200">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={t.name || 'Tour image'}
                  fill
                  priority
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-gray-400">Chưa có ảnh</span>
                </div>
              )}
            </div>

            <CardContent className="p-6">
              {/* Title and Rating */}
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{t.name}</h1>
                {t.rating &&
                  typeof t.rating === 'object' &&
                  t.rating.average > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(t.rating.average)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {t.rating.average.toFixed(1)} ({t.rating.count || 0}{' '}
                        đánh giá)
                      </span>
                    </div>
                  )}
              </div>

              {/* Description */}
              <p className="mb-6 leading-relaxed text-gray-700">
                {t.description}
              </p>

              {/* Tour Highlights with Icons */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="tour-highlight-card bg-primary/10">
                  <Clock className="text-primary h-5 w-5" />
                  <div>
                    <p className="info-label">Thời gian</p>
                    <p className="info-value">
                      {t.durationDays}N{t.durationNights}Đ
                    </p>
                  </div>
                </div>
                <div className="tour-highlight-card bg-blue-50">
                  <Bus className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="info-label">Phương tiện</p>
                    <p className="info-value">{t.transportation}</p>
                  </div>
                </div>
                <div className="tour-highlight-card bg-green-50">
                  <Tent className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="info-label">Lưu trú</p>
                    <p className="info-value">{t.stayType}</p>
                  </div>
                </div>
                <div className="tour-highlight-card bg-orange-50">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="info-label">Khởi hành</p>
                    <p className="info-value">{t.departurePoint}</p>
                  </div>
                </div>
              </div>

              {/* Image Thumbnails */}
              {t.images && t.images.length > 1 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {t.images.map((img: string, i: number) => (
                      <button
                        key={`thumb-${i}`}
                        onClick={() => setMainImage(img)}
                        className={`image-thumbnail h-20 w-28 ${
                          displayImage === img
                            ? 'image-thumbnail-active'
                            : 'image-thumbnail-inactive'
                        }`}
                        aria-label={`Xem ảnh ${i + 1}`}
                      >
                        <Image
                          src={img}
                          alt={`${t.name} - Ảnh ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Itinerary Section - Modern Accordion */}
          <Card>
            <CardHeader>
              <CardTitle className="section-title">
                <Calendar className="h-5 w-5" />
                Lịch trình chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(t.itinerary ?? []).map((day: any, dayIndex: number) => (
                <div
                  key={`day-${dayIndex}-${day.day}`}
                  className="overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                >
                  <button
                    className="accordion-button gradient-gray-subtle"
                    onClick={() =>
                      setOpenDay(openDay === day.day ? null : day.day)
                    }
                    aria-expanded={openDay === day.day}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">
                          Ngày {day.day}
                        </Badge>
                        <h3 className="font-semibold text-gray-900">
                          {day.title}
                        </h3>
                      </div>
                      {day.summary && (
                        <p className="mt-1 text-sm text-gray-600">
                          {day.summary}
                        </p>
                      )}
                    </div>
                    {openDay === day.day ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {openDay === day.day && (
                    <div className="border-t bg-white p-4">
                      <div className="space-y-4">
                        {(day.activities ?? []).map(
                          (a: any, actIndex: number) => (
                            <div
                              key={`act-${day.day}-${actIndex}`}
                              className="flex gap-4"
                            >
                              {a.timeFrom && (
                                <div className="shrink-0">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {a.timeFrom}
                                    {a.timeTo ? ` - ${a.timeTo}` : ''}
                                  </Badge>
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {a.title}
                                </h4>
                                <p className="mt-1 text-sm whitespace-pre-line text-gray-600">
                                  {a.description}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Services Grid - Modern Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Included Services */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="section-title text-lg">
                  <Check className="h-5 w-5 text-green-600" />
                  Bao gồm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {(t.servicesIncluded ?? []).flatMap((s: any) =>
                    (s.details ?? []).map((d: any, i: number) => (
                      <li key={`inc-${i}`} className="service-list-item">
                        <Check className="service-icon text-green-600" />
                        <span className="text-gray-700">{d.value}</span>
                      </li>
                    )),
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Excluded Services */}
            <Card className="border-gray-200 bg-gray-50/50">
              <CardHeader>
                <CardTitle className="section-title text-lg">
                  <X className="h-5 w-5 text-gray-600" />
                  Không bao gồm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {(t.servicesExcluded ?? []).flatMap((s: any) =>
                    (s.details ?? []).map((d: any, i: number) => (
                      <li key={`exc-${i}`} className="service-list-item">
                        <X className="service-icon text-gray-500" />
                        <span className="text-gray-700">{d.value}</span>
                      </li>
                    )),
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="section-title text-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Lưu ý
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {(t.notes ?? []).flatMap((s: any, noteIndex: number) =>
                    (s.details ?? []).map((d: any, i: number) => (
                      <li
                        key={`note-${noteIndex}-${i}`}
                        className="service-list-item"
                      >
                        <AlertCircle className="service-icon text-yellow-600" />
                        <span className="text-gray-700">{d.value}</span>
                      </li>
                    )),
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Booking Card */}
        <aside className="lg:col-span-1">
          <Card className="sticky-sidebar shadow-lg">
            <CardContent className="space-y-4 p-6">
              {/* Price Display */}
              <div className="border-b pb-4 text-center">
                <p className="text-sm text-gray-600">Giá từ</p>
                <p className="price-large mt-1">
                  {formatCurrency(
                    selectedPrice?.price ?? t.priceOptions?.[0]?.price ?? 0,
                  )}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedPrice?.name || t.priceOptions?.[0]?.name}
                </p>
              </div>

              {/* Package Selection */}
              <div>
                <label className="form-label">
                  <Users className="h-4 w-4" />
                  Chọn gói tour
                </label>
                <select
                  value={selectedPriceIndex}
                  onChange={e => {
                    setSelectedPriceIndex(Number(e.target.value));
                  }}
                  className="form-input"
                >
                  {(t.priceOptions ?? []).map((p: any, i: number) => (
                    <option key={`price-${i}-${p.name}`} value={i}>
                      {p.name} — {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of People */}
              <div>
                <label className="form-label">
                  <Users className="h-4 w-4" />
                  Số lượng người
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPeople(Math.max(1, people - 1))}
                    disabled={people <= 1}
                  >
                    -
                  </Button>
                  <input
                    type="number"
                    min={1}
                    value={people}
                    onChange={e =>
                      setPeople(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="form-input flex-1 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPeople(people + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Giá/khách</span>
                  <span className="font-medium">
                    {formatCurrency(
                      selectedPrice?.price ?? t.priceOptions?.[0]?.price ?? 0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Số người</span>
                  <span className="font-medium">× {people}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Booking Button */}
              <Button
                onClick={() =>
                  alert(
                    `Đặt tour ${t.name} thành công! Tổng: ${formatCurrency(totalPrice)}`,
                  )
                }
                className="h-12 w-full text-base font-semibold"
                size="lg"
              >
                Đặt tour ngay
              </Button>

              {/* Additional Info */}
              <div className="space-y-1.5 border-t pt-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Khởi hành: {t.departurePoint}</span>
                </div>
                {t.departureFrequency && (
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Lịch khởi hành: {t.departureFrequency}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

// Export wrapped with Suspense to prevent blocking route
export default function TourDetailPage() {
  return (
    <Suspense fallback={<TourDetailSkeleton />}>
      <TourDetailContent />
    </Suspense>
  );
}
