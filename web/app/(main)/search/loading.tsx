import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="flex flex-col">
      {/* Search Header Skeleton */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Compact Search Bar Skeleton */}
            <div className="shrink-0">
              <Skeleton className="h-12 w-[280px] rounded-full" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-1 gap-2 overflow-x-auto">
              <Skeleton className="h-9 w-[120px] rounded-md" />
              <Skeleton className="h-9 w-[140px] rounded-md" />
              <Skeleton className="h-9 w-[100px] rounded-md" />
              <Skeleton className="h-9 w-[130px] rounded-md" />
              <Skeleton className="h-9 w-[100px] rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex h-[calc(100vh-64px)] gap-0">
        {/* Campsites Grid Skeleton */}
        <div className="scrollbar-hide flex-1 overflow-y-auto px-6">
          {/* Results Count Skeleton */}
          <div className="pt-4">
            <Skeleton className="h-5 w-[150px]" />
          </div>

          {/* Grid of Campsite Cards */}
          <div className="grid grid-cols-1 gap-4 py-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-md">
                {/* Image Skeleton */}
                <Skeleton className="h-48 w-full" />

                {/* Card Content Skeleton */}
                <div className="space-y-3 p-4">
                  {/* Title and Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>

                  {/* Price and Guests */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Sidebar Skeleton */}
        <div className="hidden lg:block lg:w-[400px] xl:w-[500px]">
          <div className="sticky top-0 h-[calc(100vh-64px)] overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
