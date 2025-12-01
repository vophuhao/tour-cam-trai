'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { DateRangeType } from './date-range-picker';

interface CompactSearchBarProps {
  location?: string;
  dateRange?: DateRangeType;
  guests?: number;
  childrenCount?: number;
  onClick?: () => void;
}

export function CompactSearchBar({
  location,
  dateRange,
  guests = 0,
  childrenCount = 0,
  onClick,
}: CompactSearchBarProps) {
  const formatDateRange = () => {
    if (!dateRange?.from) return 'Thêm ngày';
    if (!dateRange?.to) {
      return format(dateRange.from, 'd MMM', { locale: vi });
    }
    return `${format(dateRange.from, 'd MMM', { locale: vi })} - ${format(dateRange.to, 'd MMM', { locale: vi })}`;
  };

  const totalGuests = guests + childrenCount;
  const guestText = totalGuests > 0 ? `${totalGuests} khách` : 'Thêm khách';

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="h-auto w-full max-w-[350px] cursor-pointer justify-start gap-2 rounded-full border-gray-300 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* <Search className="h-4 w-4 shrink-0 text-gray-700" /> */}
      <div className="flex flex-1 items-center gap-2 overflow-hidden text-sm">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-500" />
          <span className="truncate font-medium text-gray-900">
            {location || 'Địa điểm'}
          </span>
        </div>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-500" />
          <span className="truncate text-gray-600">{formatDateRange()}</span>
        </div>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Users className="h-3.5 w-3.5 shrink-0 text-gray-500" />
          <span className="truncate text-gray-600">{guestText}</span>
        </div>
      </div>
    </Button>
  );
}
