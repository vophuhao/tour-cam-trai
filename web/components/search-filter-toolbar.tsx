'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, DollarSign, Search, Tag, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

interface Category {
  value: string;
  label: string;
}

interface PriceRange {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface SearchFilterToolbarProps {
  /**
   * List of categories for filtering
   */
  categories?: Category[];
  /**
   * List of price ranges
   */
  priceRanges?: PriceRange[];
  /**
   * List of sort options
   */
  sortOptions?: SortOption[];
  /**
   * Placeholder text for search input
   */
  searchPlaceholder?: string;
  /**
   * Show category filter
   */
  showCategory?: boolean;
  /**
   * Show price range filter
   */
  showPriceRange?: boolean;
  /**
   * Show sort options
   */
  showSort?: boolean;
}

const defaultPriceRanges: PriceRange[] = [
  { value: 'all', label: 'Tất cả mức giá' },
  { value: '0-500000', label: 'Dưới 500k' },
  { value: '500000-1000000', label: '500k - 1 triệu' },
  { value: '1000000-2000000', label: '1 triệu - 2 triệu' },
  { value: '2000000-5000000', label: '2 triệu - 5 triệu' },
  { value: '5000000-999999999', label: 'Trên 5 triệu' },
];

const defaultSortOptions: SortOption[] = [
  { value: 'all', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
];

export default function SearchFilterToolbar({
  categories = [],
  priceRanges = defaultPriceRanges,
  sortOptions = defaultSortOptions,
  searchPlaceholder = 'Tìm kiếm...',
  showCategory = true,
  showPriceRange = true,
  showSort = true,
}: SearchFilterToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || '',
  );

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Determine current price range
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

  const updateFilters = (updates: Record<string, string | null>) => {
    startTransition(() => {
      const queryString = createQueryString(updates);
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleCategoryChange = (value: string) => {
    updateFilters({ category: value });
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sort: value });
  };

  const handlePriceRangeChange = (value: string) => {
    if (value !== 'all') {
      const [min, max] = value.split('-');
      updateFilters({ minPrice: min, maxPrice: max });
    } else {
      updateFilters({ minPrice: null, maxPrice: null });
    }
  };

  const handleClearAll = () => {
    setSearchInput('');
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters =
    searchInput ||
    category !== 'all' ||
    sort !== 'all' ||
    currentPriceRange !== 'all';

  return (
    <div className="bg-card space-y-4 rounded-lg border p-4 shadow-sm">
      {/* Search Row */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          Tìm kiếm
        </Button>
      </form>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        {showCategory && categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="text-muted-foreground h-4 w-4" />
            <Select
              key={`category-${category}`}
              value={category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="compact-select w-40">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price Range Filter */}
        {showPriceRange && (
          <div className="flex items-center gap-2">
            <DollarSign className="text-muted-foreground h-4 w-4" />
            <Select
              key={`price-${currentPriceRange}`}
              value={currentPriceRange}
              onValueChange={handlePriceRangeChange}
            >
              <SelectTrigger className="compact-select w-40">
                <SelectValue placeholder="Mức giá" />
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
        )}

        {/* Sort Filter */}
        {showSort && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="text-muted-foreground h-4 w-4" />
            <Select
              key={`sort-${sort}`}
              value={sort}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="compact-select w-40">
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
        )}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="ml-auto gap-1"
          >
            <X className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
