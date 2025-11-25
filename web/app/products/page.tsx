import PageBreadcrumb from '@/components/page-breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Suspense } from 'react';
import ProductFilters from './product-filters';
import ProductList from './product-list';
import ProductsHeader from './products-header';

interface SearchParams {
  page?: string;
  search?: string;
  categories?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const categories = params.categories
    ? Array.isArray(params.categories)
      ? params.categories
      : [params.categories]
    : [];
  const minPrice = params.minPrice || '';
  const maxPrice = params.maxPrice || '';
  const sort = params.sort || '';

  // Create unique key for Suspense to re-trigger on filter changes
  const suspenseKey = JSON.stringify({
    page,
    search,
    categories,
    minPrice,
    maxPrice,
    sort,
  });

  // Fetch categories (static data, can be cached longer)
  const categoriesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/all`,
    { next: { revalidate: 3600 } },
  );
  const categoriesData = await categoriesRes.json();
  const allCategories = categoriesData.success ? categoriesData.data : [];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Image Banner */}
      <div className="relative -mt-16 h-48 w-full overflow-hidden md:h-64">
        <Image
          src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1920&q=80"
          alt="Products"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Breadcrumb Overlay */}
        <div className="container-padding absolute right-0 bottom-6 left-0 mx-auto max-w-7xl">
          <PageBreadcrumb
            items={[{ label: 'Sản phẩm' }]}
            className="[&_li]:text-white [&_svg]:text-white/70"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-padding mx-auto max-w-7xl py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <ProductFilters categories={allCategories} />
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {/* Header with Clear Filters, Sort (always visible) */}
            <ProductsHeader />

            {/* Products List with Suspense - includes count inside */}
            <Suspense key={suspenseKey} fallback={<ProductListSkeleton />}>
              <ProductList
                page={page}
                search={search}
                categories={categories}
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

function ProductListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Products grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-12 flex justify-center">
        <Skeleton className="h-10 w-80" />
      </div>
    </div>
  );
}
