'use client';

import { FavoriteButton } from '@/components/property/FavoriteButton';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Property } from '@/types/property-site';
import { Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

// Lazy load map component to avoid SSR issues with mapbox-gl
const PropertyMap = dynamic(
  () => import('@/components/search/PropertyMap').then(mod => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
          <p className="text-sm text-gray-500">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  },
);

interface PropertyGridProps {
  initialProperties: Property[];
  totalResults?: number;
  searchCoordinates?: { lat: number; lng: number } | null;
}

export function PropertyGrid({
  initialProperties,
  totalResults = 0,
  searchCoordinates,
}: PropertyGridProps) {
  const searchParams = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);

  // Build property link with preserved search params (checkIn, checkOut, guests, pets)
  const buildPropertyLink = (slug: string) => {
    const params = new URLSearchParams();

    // Preserve booking-related params
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const pets = searchParams.get('pets');

    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    if (pets) params.set('pets', pets);

    const queryString = params.toString();
    return `/land/${slug}${queryString ? `?${queryString}` : ''}`;
  };

  // Force map remount when properties array reference changes (e.g., on navigation)
  const mapKey = useMemo(
    () => `${initialProperties.length}-${initialProperties[0]?._id || 'empty'}`,
    [initialProperties],
  );

  const getCoverPhoto = (property: Property) => {
    // Find cover photo or use first photo
    const coverPhoto = property.photos?.find(p => p.isCover);
    if (coverPhoto) return coverPhoto.url;
    return property.photos?.[0]?.url || '/placeholder-campsite.jpg';
  };

  const formatPrice = (price: number) => {
    // Format to thousands (K)
    if (price >= 1000000) {
      return `${Math.round(price / 1000000)}tr `;
    } else if (price >= 1000) {
      return `${Math.round(price / 1000)}k `;
    }
    return `${price}`;
  };

  const formatViews = (n: number) => {
    if (n >= 1000000) return `${Math.floor(n / 1000000)}M`;
    if (n >= 1000) return `${Math.floor(n / 1000)}k`;
    return `${n}`;
  };

  const getLandSizeDisplay = (property: Property) => {
    if (!property.landSize) return '101 acres';
    const { value, unit } = property.landSize;
    return `${value} ${unit === 'acres' ? 'acres' : unit === 'hectares' ? 'ha' : 'm²'}`;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] gap-0">
      {/* Properties Grid - 3 columns - Scrollable */}
      <div className="scrollbar-hide flex-1 overflow-y-auto px-6">
        {/* Results Count */}
        {totalResults > 0 && (
          <div className="pt-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{totalResults}</span> kết quả
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 py-6 md:grid-cols-2 lg:grid-cols-3">
          {initialProperties.map(property => (
            <Card
              key={property._id}
              className={`relative cursor-pointer overflow-hidden border-none shadow-md transition-all hover:shadow-lg ${
                selectedProperty?._id === property._id
                  ? 'ring-primary ring-2'
                  : ''
              }`}
              onClick={() => setSelectedProperty(property)}
              onMouseEnter={() => setHoveredProperty(property)}
              onMouseLeave={() => setHoveredProperty(null)}
            >
              <Link href={buildPropertyLink(property.slug || property._id)}>
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  {/* Favorite button (top-left) */}
                  <div className="absolute top-3 left-3 z-20">
                    <FavoriteButton
                      propertyId={property._id}
                      className="bg-white/90 backdrop-blur-sm hover:bg-white"
                    />
                  </div>

                  {/* View count badge (top-right) */}
                  <div className="absolute top-3 right-3 z-20">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-2 rounded-full px-2 py-1 text-xs shadow"
                    >
                      <Eye className="h-3 w-3 text-gray-700" />
                      <span className="font-medium text-gray-700">
                        {formatViews(
                          property.stats?.viewCount ?? property.viewCount ?? 0,
                        )}
                      </span>
                    </Badge>
                  </div>
                  <Image
                    src={getCoverPhoto(property)}
                    alt={property.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>

              <div className="space-y-1.5 p-4">
                {/* Rating % */}
                <div className="flex items-center gap-1">
                  {property.stats?.averageRating &&
                  property.stats.averageRating > 0 ? (
                    <>
                      <span className="text-base">👍</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.round((property.stats.averageRating / 5) * 100)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        ({property.stats.totalReviews || 0})
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Chưa có đánh giá
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
                  {property.name}
                </h3>

                {/* Sites count + Property type */}
                <p className="text-sm text-gray-600">
                  {property.stats?.totalSites || 0} địa điểm ·{' '}
                  {property.propertyType === 'private_land'
                    ? 'Đất tư nhân'
                    : property.propertyType === 'campground'
                      ? 'Khu cắm trại'
                      : property.propertyType === 'farm'
                        ? 'Trang trại'
                        : property.propertyType === 'ranch'
                          ? 'Trang trại chăn nuôi'
                          : 'Khu nghỉ dưỡng'}
                </p>

                {/* Location - acres + city */}
                <p className="text-sm text-gray-500">
                  {getLandSizeDisplay(property)} · {property.location?.city},{' '}
                  {property.location?.state}
                </p>

                {/* Price */}
                <div className="pt-0.5">
                  <span className="text-sm text-gray-500">từ </span>
                  <span className="text-base font-bold text-gray-900">
                    {property.minPrice ? formatPrice(property.minPrice) : '50k'}
                    ₫
                  </span>
                  <span className="text-sm text-gray-500"> / đêm</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {initialProperties.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy property phù hợp
            </p>
          </div>
        )}
      </div>

      {/* Compact Map Sidebar */}
      <div className="hidden lg:block lg:w-[400px] xl:w-[500px]">
        <div className="sticky top-0 h-[calc(100vh-64px)] overflow-hidden">
          <PropertyMap
            key={mapKey}
            properties={initialProperties}
            selectedProperty={selectedProperty}
            hoveredProperty={hoveredProperty}
            searchCoordinates={searchCoordinates}
            onPropertySelect={setSelectedProperty}
          />
        </div>
      </div>
    </div>
  );
}
