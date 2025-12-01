'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import TourSortFilter from './tour-sort-filter';

export default function ToursHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Check if any filters are active
  const hasFilters =
    searchParams.get('search') ||
    searchParams.getAll('categories').length > 0 ||
    searchParams.get('location') ||
    searchParams.get('duration') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    searchParams.get('sort');

  const clearAllFilters = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Filters and Clear Button */}
      <div className="flex items-center gap-3">
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
        <TourSortFilter />
      </div>
    </div>
  );
}
