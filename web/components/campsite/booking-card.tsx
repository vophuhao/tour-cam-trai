'use client';

import {
  DateRangePicker,
  type DateRangeType,
} from '@/components/search/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { differenceInDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Minus, Plus, Star, Users, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BookingCardProps {
  campsite: Campsite;
  initialGuests?: number;
  initialChildren?: number;
  initialPets?: number;
  checkIn?: string;
  checkOut?: string;
}

export function BookingCard({
  campsite,
  initialGuests = 2,
  initialChildren = 0,
  initialPets = 0,
  checkIn,
  checkOut,
}: BookingCardProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRangeType | undefined>(() => {
    if (checkIn && checkOut) {
      return {
        from: new Date(checkIn),
        to: new Date(checkOut),
      };
    }
    return undefined;
  });
  const [guests, setGuests] = useState(initialGuests);
  const [children, setChildren] = useState(initialChildren);
  const [pets, setPets] = useState(initialPets);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);

  // Fetch availability for this campsite
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/campsites/${campsite._id}/availability`,
        );
        if (response.ok) {
          const result = await response.json();
          // API returns { success: true, data: [...availability records], message: "..." }
          if (result.success && Array.isArray(result.data)) {
            // Convert unavailable dates to Date objects
            const unavailableDates = result.data
              .filter((item: { isAvailable: boolean }) => !item.isAvailable)
              .map((item: { date: string }) => new Date(item.date));
            setDisabledDates(unavailableDates);
          }
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      }
    };

    fetchAvailability();
  }, [campsite._id]);

  // Calculate pricing
  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 1;

  const basePrice = campsite.pricing.basePrice;
  const cleaningFee = campsite.pricing.cleaningFee || 0;
  const petFee = (campsite.pricing.petFee || 0) * pets;
  const totalGuests = guests + children;
  const extraGuestFee =
    totalGuests > campsite.capacity.maxGuests
      ? (campsite.pricing.extraGuestFee || 0) *
        (totalGuests - campsite.capacity.maxGuests)
      : 0;

  const subtotal = basePrice * nights;
  const total = subtotal + cleaningFee + petFee + extraGuestFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: campsite.pricing.currency || 'VND',
    }).format(price);
  };

  const handleDateChange = (newDateRange?: DateRangeType) => {
    setDateRange(newDateRange);
    // Auto-close popover when both dates are selected
    if (newDateRange?.from && newDateRange?.to) {
      setDatePopoverOpen(false);
    }
  };

  const handleGuestChange = (
    type: 'adults' | 'children' | 'pets',
    delta: number,
  ) => {
    if (type === 'adults') {
      const newValue = Math.max(1, guests + delta);
      if (newValue <= campsite.capacity.maxGuests) setGuests(newValue);
    } else if (type === 'children') {
      const newValue = Math.max(0, children + delta);
      setChildren(newValue);
    } else {
      const newValue = Math.max(0, pets + delta);
      if (campsite.capacity.maxPets && newValue <= campsite.capacity.maxPets) {
        setPets(newValue);
      } else if (!campsite.capacity.maxPets) {
        setPets(newValue);
      }
    }
  };

  const handleBooking = () => {
    // Validation 1: Check if dates are selected
    if (!dateRange?.from || !dateRange?.to) {
      setDatePopoverOpen(true);
      return;
    }

    // Validation 2: Check min nights
    if (nights < campsite.rules.minNights) {
      setDatePopoverOpen(true);
      return;
    }

    // Validation 3: Check max nights (if specified)
    if (campsite.rules.maxNights && nights > campsite.rules.maxNights) {
      setDatePopoverOpen(true);
      return;
    }

    // Navigate to payment page with booking details
    const params = new URLSearchParams({
      campsiteId: campsite._id,
      name: campsite.name,
      location: `${campsite.location.city}, ${campsite.location.state}`,
      image: campsite.images[0] || '',
      checkIn: dateRange.from.toISOString(),
      checkOut: dateRange.to.toISOString(),
      basePrice: campsite.pricing.basePrice.toString(),
      cleaningFee: (campsite.pricing.cleaningFee || 0).toString(),
      petFee: (campsite.pricing.petFee || 0).toString(),
      currency: campsite.pricing.currency || 'VND',
      guests: guests.toString(),
      children: children.toString(),
      pets: pets.toString(),
    });

    router.push(`/checkouts/payment?${params.toString()}`);
  };

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">{formatPrice(basePrice)}</span>
            <span className="text-muted-foreground text-sm"> / đêm</span>
          </div>
          {campsite.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{campsite.rating.average}</span>
              <span className="text-muted-foreground">
                ({campsite.rating.count})
              </span>
            </div>
          )}
        </div>
        {campsite.isInstantBook && (
          <Badge variant="secondary" className="mt-2 w-fit">
            <Zap className="mr-1 h-3 w-3" />
            Đặt ngay
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Range Popover */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ngày</label>
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd MMM', { locale: vi })} -{' '}
                      {format(dateRange.to, 'dd MMM yyyy', { locale: vi })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd MMM yyyy', { locale: vi })
                  )
                ) : (
                  <span className="text-muted-foreground">Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-5" align="start">
              <DateRangePicker
                date={dateRange}
                onDateChange={handleDateChange}
                disabledDates={disabledDates}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests Popover */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Khách</label>
          <Popover open={guestPopoverOpen} onOpenChange={setGuestPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>
                  {guests + children} khách
                  {pets > 0 && `, ${pets} thú cưng`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Người lớn</p>
                    <p className="text-muted-foreground text-xs">
                      Từ 13 tuổi trở lên
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleGuestChange('adults', -1)}
                      disabled={guests <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{guests}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleGuestChange('adults', 1)}
                      disabled={
                        guests + children >= campsite.capacity.maxGuests
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                {campsite.rules.allowChildren && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Trẻ em</p>
                      <p className="text-muted-foreground text-xs">
                        Từ 2-12 tuổi
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleGuestChange('children', -1)}
                        disabled={children <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{children}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleGuestChange('children', 1)}
                        disabled={
                          guests + children >= campsite.capacity.maxGuests
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pets */}
                {campsite.rules.allowPets && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Thú cưng</p>
                      <p className="text-muted-foreground text-xs">
                        {campsite.capacity.maxPets
                          ? `Tối đa ${campsite.capacity.maxPets}`
                          : 'Không giới hạn'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleGuestChange('pets', -1)}
                        disabled={pets <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{pets}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleGuestChange('pets', 1)}
                        disabled={
                          campsite.capacity.maxPets
                            ? pets >= campsite.capacity.maxPets
                            : false
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button className="w-full" size="lg" onClick={handleBooking}>
          {campsite.rules.maxNights && nights > campsite.rules.maxNights
            ? `Tối đa ${campsite.rules.maxNights} đêm, chọn ngày lại`
            : 'Kiểm tra khả dụng và đặt chỗ'}
        </Button>

        {/* Pricing Breakdown */}
        {dateRange?.from && dateRange?.to && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {formatPrice(basePrice)} x {nights} đêm
                </span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vệ sinh</span>
                  <span>{formatPrice(cleaningFee)}</span>
                </div>
              )}
              {petFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí thú cưng</span>
                  <span>{formatPrice(petFee)}</span>
                </div>
              )}
              {extraGuestFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí khách thêm</span>
                  <span>{formatPrice(extraGuestFee)}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
