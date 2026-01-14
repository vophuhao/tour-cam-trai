'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRangePicker, type DateRangeType } from './date-range-picker';

export interface DateRangePopoverProps {
  /** Current date range value */
  dateRange?: DateRangeType;
  /** Callback when date range changes */
  onDateChange: (date?: DateRangeType) => void;
  /** Dates that should be disabled in the calendar */
  disabledDates?: Date[];
  /** Open state of the popover (controlled) */
  open?: boolean;
  /** Callback when open state changes (controlled) */
  onOpenChange?: (open: boolean) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Custom button className */
  buttonClassName?: string;
  /** Custom popover alignment */
  align?: 'start' | 'center' | 'end';
  /** Whether to auto-close popover when both dates are selected */
  autoClose?: boolean;
  /** Custom icon component */
  icon?: React.ReactNode;
  /** Date format for display */
  dateFormat?: string;
}

/**
 * Reusable DateRangePopover component for selecting date ranges
 * Used across search-bar, property-booking-card, and sites-list-section
 *
 * Features:
 * - Controlled or uncontrolled open state
 * - Auto-close on complete selection
 * - Disabled dates support
 * - Vietnamese locale by default
 * - Fully accessible with keyboard navigation
 */
export function DateRangePopover({
  dateRange,
  onDateChange,
  disabledDates,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  placeholder = 'Chọn ngày',
  buttonClassName,
  align = 'start',
  autoClose = true,
  icon,
  dateFormat,
}: DateRangePopoverProps) {
  const formatDateRange = () => {
    if (!dateRange?.from) return placeholder;

    if (!dateRange?.to) {
      return format(dateRange.from, dateFormat || 'dd MMM yyyy', {
        locale: vi,
      });
    }

    return `${format(dateRange.from, dateFormat || 'dd MMM', { locale: vi })} - ${format(dateRange.to, dateFormat || 'dd MMM yyyy', { locale: vi })}`;
  };

  const handleDateChange = (newDateRange?: DateRangeType) => {
    onDateChange(newDateRange);

    // Auto-close when both dates are selected
    if (
      autoClose &&
      newDateRange?.from &&
      newDateRange?.to &&
      controlledOnOpenChange
    ) {
      controlledOnOpenChange(false);
    }
  };

  return (
    <Popover open={controlledOpen} onOpenChange={controlledOnOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !dateRange?.from && 'text-muted-foreground',
            buttonClassName,
          )}
        >
          {icon !== undefined ? (
            icon
          ) : (
            <CalendarIcon className="mr-2 h-4 w-4" />
          )}
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-5" align={align}>
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateChange}
          disabledDates={disabledDates}
        />
      </PopoverContent>
    </Popover>
  );
}
