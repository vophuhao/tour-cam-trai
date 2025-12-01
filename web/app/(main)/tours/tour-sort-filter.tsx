'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, DollarSign } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

const sortOptions = [
  { value: 'all', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
];

const priceRanges = [
  { value: 'all', label: 'Tất cả mức giá' },
  { value: '0-500000', label: 'Dưới 500k' },
  { value: '500000-1000000', label: '500k - 1 triệu' },
  { value: '1000000-2000000', label: '1 triệu - 2 triệu' },
  { value: '2000000-5000000', label: '2 triệu - 5 triệu' },
  { value: '5000000-999999999', label: 'Trên 5 triệu' },
];

export default function TourSortFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const sort = searchParams.get('sort') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const currentPriceRange =
    minPrice && maxPrice ? `${minPrice}-${maxPrice}` : 'all';

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      return params.toString();
    },
    [searchParams],
  );

  const handleSortChange = (value: string) => {
    startTransition(() => {
      const queryString = createQueryString({ sort: value });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    });
  };

  const handlePriceRangeChange = (value: string) => {
    startTransition(() => {
      if (value !== 'all') {
        const [min, max] = value.split('-');
        const queryString = createQueryString({
          minPrice: min,
          maxPrice: max,
        });
        router.replace(`${pathname}?${queryString}`, { scroll: false });
      } else {
        const queryString = createQueryString({
          minPrice: null,
          maxPrice: null,
        });
        router.replace(`${pathname}?${queryString}`, { scroll: false });
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Price Range Filter */}
      <div className="flex items-center gap-2">
        <DollarSign className="text-muted-foreground h-4 w-4" />
        <Select
          key={`price-${currentPriceRange}`}
          value={currentPriceRange}
          onValueChange={handlePriceRangeChange}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Khoảng giá" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="text-muted-foreground h-4 w-4" />
        <Select
          key={`sort-${sort}`}
          value={sort}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
