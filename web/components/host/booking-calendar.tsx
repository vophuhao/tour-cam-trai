/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/property-site';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface BookingCalendarProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

interface CalendarDay {
  date: Date;
  bookings: Booking[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-green-500',
  cancelled: 'bg-red-500',
  completed: 'bg-blue-500',
  refunded: 'bg-purple-500',
};

export function BookingCalendar({
  bookings,
  onBookingClick,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);

    // Get the starting day (Monday)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - diff);

    // Generate 42 days (6 weeks)
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);

      // Find bookings that overlap with this day
      const dayBookings = bookings.filter(booking => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        return date >= checkIn && date <= checkOut;
      });

      days.push({
        date,
        bookings: dayBookings,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
      });
    }

    return days;
  }, [currentDate, bookings]);

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const monthYear = currentDate.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate stats for current month
  const monthStats = useMemo(() => {
    const monthBookings = bookings.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      return (
        checkIn.getMonth() === currentDate.getMonth() &&
        checkIn.getFullYear() === currentDate.getFullYear()
      );
    });

    return {
      total: monthBookings.length,
      pending: monthBookings.filter(b => b.status === 'pending').length,
      confirmed: monthBookings.filter(b => b.status === 'confirmed').length,
      revenue: monthBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.pricing.total, 0),
    };
  }, [bookings, currentDate]);

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold capitalize">{monthYear}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {monthStats.total} booking{monthStats.total !== 1 ? 's' : ''} trong
            tháng này
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Hôm nay
          </Button>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số</p>
              <p className="text-xl font-bold">{monthStats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <CalendarIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Chờ xác nhận</p>
              <p className="text-xl font-bold">{monthStats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CalendarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đã xác nhận</p>
              <p className="text-xl font-bold">{monthStats.confirmed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Doanh thu</p>
              <p className="text-lg font-bold">
                {formatPrice(monthStats.revenue)} ₫
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendar grid */}
      <Card className="overflow-hidden">
        <div className="p-6">
          {/* Weekday headers */}
          <div className="mb-2 grid grid-cols-7 gap-2">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
              <div
                key={day}
                className="py-2 text-center text-sm font-semibold text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const hasBookings = day.bookings.length > 0;
              const hasMultipleBookings = day.bookings.length > 1;

              return (
                <div
                  key={index}
                  className={cn(
                    'relative min-h-[100px] rounded-lg border-2 p-2 transition-all',
                    day.isCurrentMonth
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-transparent bg-gray-50',
                    day.isToday &&
                      'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200',
                    hasBookings && 'cursor-pointer hover:shadow-md',
                  )}
                >
                  {/* Day number */}
                  <div
                    className={cn(
                      'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium',
                      day.isToday
                        ? 'bg-emerald-600 text-white'
                        : day.isCurrentMonth
                          ? 'text-gray-900'
                          : 'text-gray-400',
                    )}
                  >
                    {day.date.getDate()}
                  </div>

                  {/* Booking indicators */}
                  {hasBookings && (
                    <div className="space-y-1">
                      {day.bookings.slice(0, 2).map(booking => {
                        const site =
                          typeof booking.site === 'object'
                            ? booking.site
                            : null;
                        const guest =
                          typeof booking.guest === 'object'
                            ? booking.guest
                            : null;

                        return (
                          <button
                            key={booking._id}
                            onClick={() => onBookingClick(booking)}
                            className="w-full text-left"
                          >
                            <div
                              className={cn(
                                'rounded px-1.5 py-0.5 text-xs font-medium text-white transition-opacity hover:opacity-80',
                                STATUS_COLORS[booking.status],
                              )}
                            >
                              <div className="flex items-center gap-1 truncate">
                                <Users className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {(guest as any)?.name || 'Guest'}
                                </span>
                              </div>
                              {site && (
                                <div className="mt-0.5 truncate text-[10px] opacity-90">
                                  {site.name}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {hasMultipleBookings && day.bookings.length > 2 && (
                        <div className="text-center">
                          <Badge variant="secondary" className="text-[10px]">
                            +{day.bookings.length - 2} thêm
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty state for current month days */}
                  {!hasBookings && day.isCurrentMonth && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                      <div className="text-xs text-gray-400">Trống</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn('h-3 w-3 rounded', color)} />
            <span className="text-sm text-gray-600 capitalize">
              {status === 'pending' && 'Chờ xác nhận'}
              {status === 'confirmed' && 'Đã xác nhận'}
              {status === 'cancelled' && 'Đã hủy'}
              {status === 'completed' && 'Hoàn thành'}
              {status === 'refunded' && 'Đã hoàn tiền'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
