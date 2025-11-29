'use client';

import { saveSearchToHistory } from '@/components/search/location-search';
import { PropertyTypeFilter } from '@/components/search/property-type-filter';
import { SearchBar } from '@/components/search/search-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { format } from 'date-fns';
import { SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { type DateRangeType } from './date-range-picker';

interface SearchFiltersProps {
  totalResults: number;
}

export function SearchFilters({ totalResults }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const [location, setLocation] = useState(searchParams.get('city') || '');
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      return { lat: Number(lat), lng: Number(lng) };
    }
    return null;
  });
  const [dateRange, setDateRange] = useState<DateRangeType | undefined>(() => {
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    if (checkIn && checkOut) {
      return {
        from: new Date(checkIn),
        to: new Date(checkOut),
      };
    }
    return undefined;
  });
  const [guests, setGuests] = useState(
    parseInt(searchParams.get('minGuests') || '2'),
  );
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(1);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(
    searchParams.get('propertyType')?.split(',').filter(Boolean) || [],
  );
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();

    // Add coordinates if available (geospatial search)
    if (coordinates) {
      params.set('lat', coordinates.lat.toString());
      params.set('lng', coordinates.lng.toString());
      params.set('radius', '50'); // 50km radius
      // Save to recent searches
      saveSearchToHistory(location, coordinates);
    }
    // Otherwise use city name for text-based search
    else if (location) {
      params.set('city', location);
    }

    if (dateRange?.from) {
      params.set('checkIn', format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange?.to) {
      params.set('checkOut', format(dateRange.to, 'yyyy-MM-dd'));
    }
    const totalGuests = guests + children;
    if (totalGuests) params.set('minGuests', totalGuests.toString());
    if (propertyTypes.length > 0)
      params.set('propertyType', propertyTypes.join(','));

    router.push(`/search?${params.toString()}`);
  };

  const handleNearbySearch = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          setCoordinates(coords);
          setLocation('Vị trí hiện tại');

          const params = new URLSearchParams();
          params.set('lat', latitude.toString());
          params.set('lng', longitude.toString());
          params.set('radius', '50'); // 50km radius
          router.push(`/search?${params.toString()}`);
        },
        error => {
          console.error('Error getting location:', error);
          alert('Không thể lấy vị trí hiện tại');
        },
      );
    } else {
      alert('Trình duyệt không hỗ trợ định vị');
    }
  };

  const handleLocationSelect = (
    loc: string,
    coords?: { lat: number; lng: number },
  ) => {
    setLocation(loc);
    if (coords) {
      setCoordinates(coords);
    }
  };

  return (
    <>
      {/* Search Header */}
      <div className="bg-background border-b p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-center">
          <SearchBar
            location={location}
            onLocationChange={setLocation}
            onLocationSelect={handleLocationSelect}
            onNearbyClick={handleNearbySearch}
            dateRange={dateRange}
            onDateChange={setDateRange}
            guests={guests}
            children={children}
            pets={pets}
            onGuestsChange={setGuests}
            onChildrenChange={setChildren}
            onPetsChange={setPets}
            onSearch={handleSearch}
            loading={false}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-background border-b p-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {/* Filters Button */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {propertyTypes.length > 0 && (
                  <Badge variant="secondary">{propertyTypes.length}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[350px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your search with filters
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Property Type */}
                <div>
                  <h3 className="mb-3 font-semibold">Property Type</h3>
                  <PropertyTypeFilter
                    selectedTypes={propertyTypes}
                    onTypesChange={setPropertyTypes}
                  />
                </div>
              </div>

              <div className="absolute right-4 bottom-4 left-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setPropertyTypes([]);
                  }}
                >
                  Clear all
                </Button>
                <Button className="flex-1" onClick={handleSearch}>
                  Show results
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <PropertyTypeFilter
            selectedTypes={propertyTypes}
            onTypesChange={setPropertyTypes}
          />

          <div className="ml-auto flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {totalResults} kết quả
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
