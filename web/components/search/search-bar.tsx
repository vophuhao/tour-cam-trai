'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, MapPin, Search, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';
import { DateRangePicker, type DateRangeType } from './date-range-picker';
import { GuestSelector } from './guest-selector';
import { LocationSearch } from './location-search';

interface SearchBarProps {
  location: string;
  onLocationChange: (value: string) => void;
  onLocationSelect?: (
    location: string,
    coordinates?: { lat: number; lng: number },
  ) => void;
  onNearbyClick?: () => void;
  dateRange?: DateRangeType;
  onDateChange: (date?: DateRangeType) => void;
  guests: number;
  children: number;
  pets: number;
  onGuestsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onPetsChange: (value: number) => void;
  onSearch: () => void;
  loading?: boolean;
}

export function SearchBar({
  location,
  onLocationChange,
  onLocationSelect,
  onNearbyClick,
  dateRange,
  onDateChange,
  guests,
  children,
  pets,
  onGuestsChange,
  onChildrenChange,
  onPetsChange,
  onSearch,
  loading = false,
}: SearchBarProps) {
  const [locationOpen, setLocationOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Thêm ngày';
    if (!dateRange?.to) {
      return format(dateRange.from, 'd MMM', { locale: vi });
    }
    return `${format(dateRange.from, 'd MMM', { locale: vi })} - ${format(dateRange.to, 'd MMM', { locale: vi })}`;
  };

  const formatGuests = () => {
    const total = guests + children;
    if (total === 0) return 'Thêm khách';
    return `${total} khách${pets > 0 ? `, ${pets} thú cưng` : ''}`;
  };

  return (
    <div className="w-full max-w-6xl">
      {/* Search Bar - Hipcamp Style */}
      <div className="flex w-full items-stretch gap-4">
        {/* Location Popover */}
        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-left shadow-sm transition-all hover:shadow-md',
                locationOpen && 'border-gray-900 ring-2 ring-gray-900',
              )}
            >
              <MapPin className="h-5 w-5 shrink-0 text-gray-700" />
              <span className="truncate text-base text-gray-900">
                {location || 'Tìm địa điểm'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[500px] p-0"
            align="start"
            sideOffset={8}
          >
            {/* LocationSearch with inline results */}
            <div className="p-4">
              <LocationSearch
                value={location}
                onChange={(value, coordinates) => {
                  onLocationChange(value);
                  if (coordinates && onLocationSelect) {
                    onLocationSelect(value, coordinates);
                  }
                }}
                onNearbyClick={() => {
                  onNearbyClick?.();
                  setLocationOpen(false);
                }}
                onClose={() => setLocationOpen(false)}
                showDropdown={false}
                showInlineResults={true}
                placeholder="Tìm địa điểm"
                className="w-full"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Popover */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-left shadow-sm transition-all hover:shadow-md',
                dateOpen && 'border-gray-900 ring-2 ring-gray-900',
              )}
            >
              <Calendar className="h-5 w-5 shrink-0 text-gray-700" />
              <span className="truncate text-base text-gray-900">
                {formatDateRange()}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-8" align="center" sideOffset={8}>
            <DateRangePicker
              date={dateRange}
              onDateChange={date => {
                onDateChange(date);
                if (date?.from && date?.to) {
                  setDateOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>

        {/* Guest Popover */}
        <Popover open={guestOpen} onOpenChange={setGuestOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-left shadow-sm transition-all hover:shadow-md',
                guestOpen && 'border-gray-900 ring-2 ring-gray-900',
              )}
            >
              <Users className="h-5 w-5 shrink-0 text-gray-700" />
              <span className="truncate text-base text-gray-900">
                {formatGuests()}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-6" align="end" sideOffset={8}>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Số lượng khách</h3>
              <GuestSelector
                guests={guests}
                childrenCount={children}
                pets={pets}
                onGuestsChange={onGuestsChange}
                onChildrenChange={onChildrenChange}
                onPetsChange={onPetsChange}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/80 h-auto cursor-pointer rounded-lg px-8 py-3 text-base font-semibold"
          onClick={onSearch}
          disabled={loading}
        >
          <Search className="mr-2 h-5 w-5" />
          Search
        </Button>
      </div>
    </div>
  );
}
