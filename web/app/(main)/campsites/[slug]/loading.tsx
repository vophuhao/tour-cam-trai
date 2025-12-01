import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function CampsiteLoading() {
  return (
    <div className="bg-background min-h-screen">
      {/* Gallery Skeleton */}
      <Skeleton className="h-[500px] w-full rounded-none" />

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Overview Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>

            <Separator />

            {/* Amenities Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-24 w-full" />
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>

            <Separator />

            {/* Location Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>

          {/* Right Column - Booking Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Skeleton className="h-[600px] w-full" />
            </div>
          </div>
        </div>

        {/* Similar Campsites Skeleton */}
        <Separator className="my-12" />
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
