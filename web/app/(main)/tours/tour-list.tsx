import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Tent,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TourListProps {
  page: number;
  search: string;
  categories: string[];
  location: string;
  duration: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export default async function TourList({
  page,
  search,
  categories, // eslint-disable-line @typescript-eslint/no-unused-vars -- TODO: Use when backend adds category support
  location,
  duration,
  minPrice,
  maxPrice,
  sort,
}: TourListProps) {
  // Build query string for API
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '12',
  });

  if (search) queryParams.append('search', search);

  // Fetch tours
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/tours?${queryParams.toString()}`,
    {
      next: { revalidate: 0 },
      cache: 'no-store',
    },
  );

  const { data: tours, pagination } =
    (await response.json()) as PaginatedResponse<Tour>;

  const totalCount = pagination?.total || 0;

  // Client-side filtering (until backend supports it)
  let filteredTours = tours;

  // TODO: Filter by categories when backend adds category field to Tour model
  // if (categories.length > 0) {
  //   filteredTours = filteredTours.filter(tour => {
  //     const tourCategoryId =
  //       typeof tour.category === 'string' ? tour.category : tour.category?._id;
  //     return categories.includes(tourCategoryId || '');
  //   });
  // }

  if (location && location !== 'all') {
    filteredTours = filteredTours.filter(tour =>
      tour.departurePoint.toLowerCase().includes(location.toLowerCase()),
    );
  }

  if (duration && duration !== 'all') {
    const [min, max] = duration.split('-').map(Number);
    filteredTours = filteredTours.filter(tour => {
      const totalDays = tour.durationDays;
      if (max) {
        return totalDays >= min && totalDays <= max;
      }
      return totalDays >= min;
    });
  }

  if (minPrice || maxPrice) {
    filteredTours = filteredTours.filter(tour => {
      const price = tour.priceOptions[0]?.price || 0;
      if (minPrice && maxPrice) {
        return price >= Number(minPrice) && price <= Number(maxPrice);
      }
      if (minPrice) {
        return price >= Number(minPrice);
      }
      if (maxPrice) {
        return price <= Number(maxPrice);
      }
      return true;
    });
  }

  // Sorting
  if (sort === 'price-asc') {
    filteredTours.sort(
      (a, b) =>
        (a.priceOptions[0]?.price || 0) - (b.priceOptions[0]?.price || 0),
    );
  } else if (sort === 'price-desc') {
    filteredTours.sort(
      (a, b) =>
        (b.priceOptions[0]?.price || 0) - (a.priceOptions[0]?.price || 0),
    );
  } else if (sort === 'rating') {
    filteredTours.sort(
      (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0),
    );
  } else if (sort === 'popular') {
    filteredTours.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  }

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center gap-2">
        <MapPin className="text-primary h-5 w-5" />
        <p className="text-lg font-semibold">
          {totalCount} tours tìm thấy
          {search && (
            <span className="text-muted-foreground ml-2">
              cho &quot;{search}&quot;
            </span>
          )}
        </p>
      </div>

      {/* Tours Grid */}
      {filteredTours.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 py-20 text-center">
          <Tent className="mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold">Không tìm thấy tour</h3>
          <p className="text-muted-foreground">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map(tour => (
            <Card
              key={tour._id}
              className="group overflow-hidden border-0 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-64">
                <Image
                  src={tour.images[0] || '/placeholder.jpg'}
                  alt={tour.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {tour.isActive && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <TrendingUp className="h-3 w-3" />
                      HOT
                    </span>
                  </div>
                )}
                {tour.soldCount && tour.soldCount > 10 && (
                  <div className="absolute top-4 left-4">
                    <span className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <Users className="h-3 w-3" />
                      Đã bán {tour.soldCount}+
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="mb-3 line-clamp-2 text-xl font-bold">
                  {tour.name}
                </h3>
                <div className="text-muted-foreground mb-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="text-primary h-4 w-4" />
                    <span>
                      {tour.durationDays}N{tour.durationNights}Đ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-primary h-4 w-4" />
                    <span className="line-clamp-1">{tour.departurePoint}</span>
                  </div>
                  {tour.targetAudience && (
                    <div className="flex items-center gap-2">
                      <Users className="text-primary h-4 w-4" />
                      <span>{tour.targetAudience}</span>
                    </div>
                  )}
                  {tour.departureFrequency && (
                    <div className="flex items-center gap-2">
                      <Calendar className="text-primary h-4 w-4" />
                      <span>{tour.departureFrequency}</span>
                    </div>
                  )}
                </div>

                {tour.rating && tour.rating.count > 0 && (
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(tour.rating!.average)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">
                      {tour.rating.average.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      ({tour.rating.count} đánh giá)
                    </span>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div>
                    {tour.priceOptions && tour.priceOptions.length > 0 && (
                      <>
                        <p className="text-muted-foreground text-sm">Từ</p>
                        <p className="text-primary text-2xl font-bold">
                          {tour.priceOptions[0].price.toLocaleString('vi-VN')}đ
                        </p>
                        {tour.priceOptions[0].name && (
                          <p className="text-muted-foreground text-xs">
                            {tour.priceOptions[0].name}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <Link href={`/tours/${tour.slug || tour._id}`}>
                    <Button className="shadow-md">Xem →</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredTours.length > 0 && pagination && pagination.totalPages > 1 && (
        <div className="mt-12">
          <Pagination pagination={pagination} itemName="tours" />
        </div>
      )}
    </div>
  );
}
