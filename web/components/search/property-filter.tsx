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

interface CampingStyle {
  value: string;
  label: string;
}

// Shared Amenities filters - match Property model structure
interface SharedAmenityFilter {
  key: string;
  label: string;
  icon: string;
  paramName: string; // URL param name
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

// Shared amenities available at Property level
// These map to sharedAmenities fields in Property model
const sharedAmenityFilters: SharedAmenityFilter[] = [
  { key: 'toilets', label: 'Nhà vệ sinh', icon: '🚻', paramName: 'hasToilets' },
  { key: 'showers', label: 'Phòng tắm', icon: '🚿', paramName: 'hasShowers' },
  { key: 'parking', label: 'Bãi đỗ xe', icon: '🅿️', paramName: 'hasParking' },
  { key: 'wifi', label: 'WiFi', icon: '📶', paramName: 'hasWifi' },
  {
    key: 'electricity',
    label: 'Điện',
    icon: '⚡',
    paramName: 'hasElectricity',
  },
  { key: 'water', label: 'Nước uống', icon: '💧', paramName: 'hasWater' },
];

export function PropertyFilter({
  campingStyles = defaultCampingStyles,
}: PropertyFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [typeOpen, setTypeOpen] = useState(false);
  const [amenityOpen, setAmenityOpen] = useState(false);

  // Get current values from URL
  const sort = searchParams.get('sort') || 'reviewCount';
  const selectedCampingStyles = searchParams.getAll('campingStyle');
  const instantBook = searchParams.get('instantBook') === 'true';

  // Get selected shared amenities from URL params
  const selectedSharedAmenities = sharedAmenityFilters
    .filter(amenity => searchParams.get(amenity.paramName) === 'true')
    .map(amenity => amenity.key);

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
    const newStyles = selectedCampingStyles.includes(style)
      ? selectedCampingStyles.filter(s => s !== style)
      : [...selectedCampingStyles, style];
    updateFilters({ campingStyle: newStyles });
  };

  const handleSharedAmenityToggle = (amenityKey: string) => {
    const amenity = sharedAmenityFilters.find(a => a.key === amenityKey);
    if (!amenity) return;

    const isCurrentlySelected = searchParams.get(amenity.paramName) === 'true';
    updateFilters({ [amenity.paramName]: isCurrentlySelected ? null : 'true' });
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
    selectedSharedAmenities.length > 0 ||
    instantBook;

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
      <Popover open={typeOpen} onOpenChange={setTypeOpen}>
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
                    checked={selectedCampingStyles.includes(style.value)}
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
          </div>
        </PopoverContent>
      </Popover>

      {/* Shared Amenities */}
      <Popover open={amenityOpen} onOpenChange={setAmenityOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 cursor-pointer border-gray-300"
            disabled={isPending}
            suppressHydrationWarning
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Tiện nghi
            {selectedSharedAmenities.length > 0 && (
              <span className="bg-primary ml-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                {selectedSharedAmenities.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="start">
          <div className="space-y-3">
            <h4 className="font-semibold">Tiện nghi chung</h4>
            <div className="space-y-2">
              {sharedAmenityFilters.map(amenity => (
                <div key={amenity.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.key}
                    checked={selectedSharedAmenities.includes(amenity.key)}
                    onCheckedChange={() =>
                      handleSharedAmenityToggle(amenity.key)
                    }
                  />
                  <label
                    htmlFor={amenity.key}
                    className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {amenity.icon} {amenity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

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
