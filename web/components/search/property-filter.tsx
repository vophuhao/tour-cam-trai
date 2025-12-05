'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Sparkles, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { AmenitiesFilter } from './amenities-filter';

interface CampingStyle {
  value: string;
  label: string;
}

interface PropertyFilterProps {
  campingStyles?: CampingStyle[];
}

const defaultCampingStyles: CampingStyle[] = [
  { value: 'tent', label: 'Cắm trại (Tent)' },
  { value: 'rv', label: 'Nhà di động (RV)' },
  { value: 'glamping', label: 'Glamping' },
];

const sortOptions = [
  { value: 'reviewCount', label: 'Phổ biến' },
  { value: 'minPrice-asc', label: 'Giá thấp đến cao' },
  { value: 'minPrice-desc', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'newest', label: 'Mới nhất' },
];

export function PropertyFilter({
  campingStyles = defaultCampingStyles,
}: PropertyFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [typeOpen, setTypeOpen] = useState(false);

  // Get current values from URL
  const sort = searchParams.get('sort') || 'reviewCount';
  const selectedCampingStyles = searchParams.getAll('campingStyle');
  const instantBook = searchParams.get('instantBook') === 'true';

  // Temporary state for pending camping style changes
  const [pendingCampingStyles, setPendingCampingStyles] = useState<string[]>(
    [],
  );

  // Sync pending state when popover opens
  const handleTypeOpenChange = (open: boolean) => {
    setTypeOpen(open);
    if (open) {
      setPendingCampingStyles(selectedCampingStyles);
    }
  };

  const createQueryString = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        // Remove existing values for this key
        params.delete(key);

        if (value === null || value === '' || value === 'reviewCount') {
          // Skip null, empty, or default values
          return;
        }

        if (Array.isArray(value)) {
          // Add multiple values for array params
          value.forEach(v => v && params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      return params.toString();
    },
    [searchParams],
  );

  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    startTransition(() => {
      const queryString = createQueryString(updates);
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    });
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sort: value });
  };

  const handleCampingStyleToggle = (style: string) => {
    const newStyles = pendingCampingStyles.includes(style)
      ? pendingCampingStyles.filter(s => s !== style)
      : [...pendingCampingStyles, style];
    setPendingCampingStyles(newStyles);
  };

  const handleApplyCampingStyles = () => {
    updateFilters({
      campingStyle:
        pendingCampingStyles.length > 0 ? pendingCampingStyles : null,
    });
    setTypeOpen(false);
  };

  const handleInstantBookToggle = () => {
    updateFilters({ instantBook: instantBook ? null : 'true' });
  };

  const handleClearAll = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters =
    sort !== 'reviewCount' ||
    selectedCampingStyles.length > 0 ||
    instantBook ||
    searchParams.getAll('amenities').length > 0;

  return (
    <div className="flex items-center gap-3 px-1 py-1">
      {/* Sort */}
      <Select value={sort} onValueChange={handleSortChange}>
        <SelectTrigger
          className="h-9 w-[140px] border-gray-300"
          suppressHydrationWarning
        >
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

      {/* Camping Style */}
      <Popover open={typeOpen} onOpenChange={handleTypeOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 cursor-pointer border-gray-300"
            disabled={isPending}
            suppressHydrationWarning
          >
            <Filter className="mr-2 h-4 w-4" />
            Loại hình
            {selectedCampingStyles.length > 0 && (
              <span className="bg-primary ml-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                {selectedCampingStyles.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="start">
          <div className="space-y-3">
            <h4 className="font-semibold">Loại hình cắm trại</h4>
            <div className="space-y-2">
              {campingStyles.map(style => (
                <div key={style.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={style.value}
                    checked={pendingCampingStyles.includes(style.value)}
                    onCheckedChange={() =>
                      handleCampingStyleToggle(style.value)
                    }
                  />
                  <label
                    htmlFor={style.value}
                    className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {style.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setPendingCampingStyles([]);
                }}
              >
                Xóa
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleApplyCampingStyles}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Amenities Filter */}
      <AmenitiesFilter />

      {/* Instant Book */}
      <Button
        variant={instantBook ? 'default' : 'outline'}
        onClick={handleInstantBookToggle}
        className="h-9 cursor-pointer border-gray-300"
        disabled={isPending}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Đặt ngay
      </Button>

      {/* Clear All */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-9 cursor-pointer gap-1 text-gray-600"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
