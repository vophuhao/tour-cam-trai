import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Image Skeleton */}
      <div className="relative h-32 w-full overflow-hidden bg-gray-200 md:h-48">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Main Content */}
      <div className="container-padding mx-auto max-w-7xl py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar Skeleton */}
          <aside className="lg:col-span-1">
            <div className="space-y-6">
              {/* Search skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>

              {/* Brand filter skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Clear filters skeleton */}
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>

          {/* Products Grid Skeleton */}
          <main className="lg:col-span-3">
            {/* Results and Filters Row Skeleton */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-44" />
                <Skeleton className="h-10 w-44" />
                <Skeleton className="h-10 w-44" />
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-lg">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="mb-3 h-6 w-full" />
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="mb-4 h-4 w-1/2" />

                    <div className="mb-4">
                      <Skeleton className="h-4 w-40" />
                    </div>

                    <div className="my-4 h-px bg-gray-200" />

                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="mb-1 h-3 w-16" />
                        <Skeleton className="h-7 w-24" />
                      </div>
                      <Skeleton className="h-10 w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-12">
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
