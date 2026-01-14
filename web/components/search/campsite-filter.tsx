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

interface Amenity {
  _id: string;
  name: string;
  icon?: string;
  category?: string;
  isActive?: boolean;
}

interface CampingStyle {
  value: string;
  label: string;
}

interface CampsiteFilterProps {
  campingStyles?: CampingStyle[];
  amenities?: Amenity[];
}

const defaultCampingStyles: CampingStyle[] = [
  { value: 'tent', label: 'Lều cắm trại' },
  { value: 'rv', label: 'RV/Caravan' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'glamping', label: 'Glamping' },
  { value: 'treehouse', label: 'Nhà trên cây' },
  { value: 'yurt', label: 'Lều Mông Cổ' },
  { value: 'other', label: 'Khác' },
];

const sortOptions = [
  { value: 'popular', label: 'Phổ biến' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'newest', label: 'Mới nhất' },
];

export function CampsiteFilter({
  campingStyles = defaultCampingStyles,
  amenities = [],
}: CampsiteFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [styleOpen, setStyleOpen] = useState(false);
  const [amenityOpen, setAmenityOpen] = useState(false);

  // Get current values from URL
  const sort = searchParams.get('sort') || 'popular';
  const propertyTypes = searchParams.getAll('propertyType');
  const selectedAmenities = searchParams.getAll('amenities');
  const isInstantBook = searchParams.get('isInstantBook') === 'true';

  const createQueryString = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        // Remove existing values for this key
        params.delete(key);

        if (value === null || value === '' || value === 'popular') {
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

  const handleStyleToggle = (style: string) => {
    const newStyles = propertyTypes.includes(style)
      ? propertyTypes.filter(s => s !== style)
      : [...propertyTypes, style];
    updateFilters({ propertyType: newStyles });
  };

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(a => a !== amenityId)
      : [...selectedAmenities, amenityId];
    updateFilters({ amenities: newAmenities });
  };

  const handleInstantBookToggle = () => {
    updateFilters({ isInstantBook: isInstantBook ? null : 'true' });
  };

  const handleClearAll = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters =
    sort !== 'popular' ||
    propertyTypes.length > 0 ||
    selectedAmenities.length > 0 ||
    isInstantBook;

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
      <Popover open={styleOpen} onOpenChange={setStyleOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 cursor-pointer border-gray-300"
            disabled={isPending}
            suppressHydrationWarning
          >
            <Filter className="mr-2 h-4 w-4" />
            Loại hình
            {propertyTypes.length > 0 && (
              <span className="bg-primary ml-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                {propertyTypes.length}
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
                    checked={propertyTypes.includes(style.value)}
                    onCheckedChange={() => handleStyleToggle(style.value)}
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

      {/* Amenities */}
      {amenities.length > 0 && (
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
              {selectedAmenities.length > 0 && (
                <span className="bg-primary ml-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                  {selectedAmenities.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-4" align="start">
            <div className="space-y-3">
              <h4 className="font-semibold">Tiện nghi</h4>
              <div className="max-h-[300px] space-y-2 overflow-y-auto">
                {amenities.map(amenity => (
                  <div
                    key={amenity._id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={amenity._id}
                      checked={selectedAmenities.includes(amenity._id)}
                      onCheckedChange={() => handleAmenityToggle(amenity._id)}
                    />
                    <label
                      htmlFor={amenity._id}
                      className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {amenity.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Instant Book */}
      <Button
        variant={isInstantBook ? 'default' : 'outline'}
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
