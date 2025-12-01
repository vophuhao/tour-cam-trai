'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Layers, MapPin, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

interface Category {
  _id: string;
  name: string;
}

interface TourFiltersProps {
  categories: Category[];
}

export default function TourFilters({ categories }: TourFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || '',
  );

  // Get selected categories from URL params
  const selectedCategories = searchParams.getAll('categories');
  const selectedLocation = searchParams.get('location') || '';
  const selectedDuration = searchParams.get('duration') || '';

  const createQueryString = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams();

      // Preserve existing params
      searchParams.forEach((value, key) => {
        if (!Object.keys(updates).includes(key)) {
          params.append(key, value);
        }
      });

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key); // Clear existing
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      if (Object.keys(updates).some(key => key !== 'page')) {
        params.set('page', '1');
      }

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    updateFilters({ categories: newSelected.length > 0 ? newSelected : null });
  };

  const handleLocationToggle = (location: string) => {
    updateFilters({
      location: selectedLocation === location ? null : location,
    });
  };

  const handleDurationToggle = (duration: string) => {
    updateFilters({
      duration: selectedDuration === duration ? null : duration,
    });
  };

  // Predefined locations and durations
  const locations = [
    { value: 'northern', label: 'Miền Bắc' },
    { value: 'central', label: 'Miền Trung' },
    { value: 'southern', label: 'Miền Nam' },
    { value: 'highlands', label: 'Tây Nguyên' },
  ];

  const durations = [
    { value: '1-2', label: '1-2 ngày' },
    { value: '3-4', label: '3-4 ngày' },
    { value: '5-7', label: '5-7 ngày' },
    { value: '7+', label: 'Trên 7 ngày' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Lọc theo</h3>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Tìm kiếm tour..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5" />
            Danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map(category => (
              <div key={category._id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category._id}`}
                  checked={selectedCategories.includes(category._id)}
                  onCheckedChange={() => handleCategoryToggle(category._id)}
                />
                <Label
                  htmlFor={`category-${category._id}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Địa điểm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {locations.map(location => (
              <div key={location.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location.value}`}
                  checked={selectedLocation === location.value}
                  onCheckedChange={() => handleLocationToggle(location.value)}
                />
                <Label
                  htmlFor={`location-${location.value}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {location.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Duration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Thời gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {durations.map(duration => (
              <div key={duration.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`duration-${duration.value}`}
                  checked={selectedDuration === duration.value}
                  onCheckedChange={() => handleDurationToggle(duration.value)}
                />
                <Label
                  htmlFor={`duration-${duration.value}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {duration.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
