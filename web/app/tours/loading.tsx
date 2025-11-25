import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Header Skeleton */}
      <div className="from-primary bg-linear-to-r to-green-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <Skeleton className="mx-auto mb-4 h-12 w-96 bg-white/20" />
            <Skeleton className="mx-auto h-6 w-3/4 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar Skeleton */}
          <aside className="lg:col-span-1">
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </aside>

          {/* Tours Grid Skeleton */}
          <main className="lg:col-span-3">
            <Skeleton className="mb-6 h-8 w-48" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="space-y-3 p-6">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
