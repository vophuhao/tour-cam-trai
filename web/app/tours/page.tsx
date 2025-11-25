import PageBreadcrumb from '@/components/page-breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Suspense } from 'react';
import TourFilters from './tour-filters';
import TourList from './tour-list';
import ToursHeader from './tours-header';

interface SearchParams {
  page?: string;
  search?: string;
  categories?: string | string[];
  location?: string;
  duration?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ToursPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';

  // Parse categories as array
  const categoriesParam = params.categories;
  const selectedCategories = Array.isArray(categoriesParam)
    ? categoriesParam
    : categoriesParam
      ? [categoriesParam]
      : [];

  const location = params.location || '';
  const duration = params.duration || '';
  const minPrice = params.minPrice || '';
  const maxPrice = params.maxPrice || '';
  const sort = params.sort || '';

  // Create unique key for Suspense to re-trigger on filter changes
  const suspenseKey = JSON.stringify({
    page,
    search,
    categories: selectedCategories,
    location,
    duration,
    minPrice,
    maxPrice,
    sort,
  });

  // Fetch categories for filters
  const categoriesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories`,
    { next: { revalidate: 3600 } },
  );
  const categoriesData = await categoriesRes.json();
  const allCategories = categoriesData.data || [];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Image Banner */}
      <div className="relative -mt-16 h-64 w-full overflow-hidden md:h-64">
        <Image
          src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920&q=80"
          alt="Tours"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Breadcrumb Overlay */}
        <div className="container-padding absolute right-0 bottom-6 left-0 mx-auto max-w-7xl">
          <PageBreadcrumb
            items={[{ label: 'Tours' }]}
            className="[&_li]:text-white [&_svg]:text-white/70"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-padding mx-auto max-w-7xl py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <TourFilters categories={allCategories} />
          </aside>

          {/* Tours Grid */}
          <main className="lg:col-span-3">
            {/* Header with Clear Filters, Sort (always visible) */}
            <ToursHeader />

            {/* Tours List with Suspense - includes count inside */}
            <Suspense key={suspenseKey} fallback={<TourListSkeleton />}>
              <TourList
                page={page}
                search={search}
                categories={selectedCategories}
                location={location}
                duration={duration}
                minPrice={minPrice}
                maxPrice={maxPrice}
                sort={sort}
              />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

function TourListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
