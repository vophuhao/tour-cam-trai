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
import {
  CalendarIcon,
  Minus,
  Plus,
  Star,
  Users,
  Zap,
  Car,
  PawPrint,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Site } from '@/types/property-site';

interface BookingSiteFormProps {
  site: Site;
  initialGuests?: number;
  initialPets?: number;
  initialVehicles?: number;
  checkIn?: string;
  checkOut?: string;
}

export default function BookingSiteForm({
  site,
  initialGuests = 2,
  initialPets = 0,
  initialVehicles = 1,
  checkIn,
  checkOut,
}: BookingSiteFormProps) {
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
  const [pets, setPets] = useState(initialPets);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch availability for this site
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sites/${site._id}/availability`,
        );
        if (response.ok) {
          const result = await response.json();
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
  }, [site._id]);

  // Calculate pricing
  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 1;

  const basePrice = site.pricing.basePrice;
  const cleaningFee = site.pricing.cleaningFee || 0;
  const petFee = (site.pricing.petFee || 0) * pets;
  const extraGuestFee =
    guests > site.capacity.maxGuests
      ? (site.pricing.additionalGuestFee || 0) *
        (guests - site.capacity.maxGuests)
      : 0;

  const subtotal = basePrice * nights;
  const total = subtotal + cleaningFee + petFee + extraGuestFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
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
    type: 'guests' | 'pets' | 'vehicles',
    delta: number,
  ) => {
    if (type === 'guests') {
      const newValue = Math.max(1, guests + delta);
      if (newValue <= site.capacity.maxGuests) setGuests(newValue);
    } else if (type === 'pets') {
      const newValue = Math.max(0, pets + delta);
      if (site.capacity.petsAllowed && newValue <= site.capacity.maxPets) {
        setPets(newValue);
      }
    } else if (type === 'vehicles') {
      const newValue = Math.max(0, vehicles + delta);
      if (newValue <= site.capacity.maxVehicles) setVehicles(newValue);
    }
  };

  const handleBooking = async () => {
    // Validation 1: Check if dates are selected
    if (!dateRange?.from || !dateRange?.to) {
      setDatePopoverOpen(true);
      return;
    }

    // Validation 2: Check min nights
    if (nights < site.bookingSettings.minNights) {
      alert(`Minimum stay is ${site.bookingSettings.minNights} nights`);
      return;
    }

    // Validation 3: Check max nights (if specified)
    if (
      site.bookingSettings.maxNights &&
      nights > site.bookingSettings.maxNights
    ) {
      alert(`Maximum stay is ${site.bookingSettings.maxNights} nights`);
      return;
    }

    // Validation 4: Check capacity
    if (guests > site.capacity.maxGuests) {
      alert(`Maximum ${site.capacity.maxGuests} guests allowed`);
      return;
    }

    if (vehicles > site.capacity.maxVehicles) {
      alert(`Maximum ${site.capacity.maxVehicles} vehicles allowed`);
      return;
    }

    if (site.capacity.petsAllowed && pets > site.capacity.maxPets) {
      alert(`Maximum ${site.capacity.maxPets} pets allowed`);
      return;
    }

    try {
      setIsLoading(true);

      // Check availability and get pricing from backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sites/${site._id}/calculate-pricing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkIn: dateRange.from.toISOString(),
            checkOut: dateRange.to.toISOString(),
            guests,
            pets,
            vehicles,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to calculate pricing');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Pricing calculation failed');
      }

      // Navigate to payment page with booking details
      const params = new URLSearchParams({
        siteId: site._id,
        propertyId: site.property.toString(),
        name: site.name,
        // location: `${site.location.city}, ${site.location.state}`,
        image: site.images?.[0] || '',
        checkIn: dateRange.from.toISOString(),
        checkOut: dateRange.to.toISOString(),
        guests: guests.toString(),
        pets: pets.toString(),
        vehicles: vehicles.toString(),
        // Pricing from backend
        basePrice: result.data.basePrice.toString(),
        nights: result.data.nights.toString(),
        cleaningFee: result.data.cleaningFee.toString(),
        petFee: result.data.petFee.toString(),
        additionalGuestFee: result.data.additionalGuestFee.toString(),
        total: result.data.total.toString(),
      });

      router.push(`/checkouts/payment?${params.toString()}`);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to process booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="sticky top-4 border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">{formatPrice(basePrice)}</span>
            <span className="text-muted-foreground text-sm"> / đêm</span>
          </div>
          {site.rating.average > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">
                {site.rating.average.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({site.rating.count})
              </span>
            </div>
          )}
        </div>
        {site.bookingSettings.instantBook && (
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
          <label className="text-sm font-medium">Khách & Phương tiện</label>
          <Popover open={guestPopoverOpen} onOpenChange={setGuestPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>
                  {guests} khách, {vehicles} xe
                  {pets > 0 && `, ${pets} thú cưng`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                {/* Guests */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Khách</p>
                    <p className="text-muted-foreground text-xs">
                      Tối đa {site.capacity.maxGuests}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleGuestChange('guests', -1)}
                      disabled={guests <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{guests}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleGuestChange('guests', 1)}
                      disabled={guests >= site.capacity.maxGuests}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Vehicles */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <Car className="h-4 w-4" />
                      Phương tiện
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Tối đa {site.capacity.maxVehicles}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleGuestChange('vehicles', -1)}
                      disabled={vehicles <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{vehicles}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleGuestChange('vehicles', 1)}
                      disabled={vehicles >= site.capacity.maxVehicles}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Pets */}
                {site.capacity.petsAllowed && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="flex items-center gap-2 font-medium">
                        <PawPrint className="h-4 w-4" />
                        Thú cưng
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Tối đa {site.capacity.maxPets}
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
                        disabled={pets >= site.capacity.maxPets}
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

        <Button
          className="w-full"
          size="lg"
          onClick={handleBooking}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Kiểm tra khả dụng và đặt chỗ'}
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

        {/* Booking Requirements */}
        <div className="text-muted-foreground mt-4 space-y-1 border-t pt-4 text-xs">
          <p>• Tối thiểu {site.bookingSettings.minNights} đêm</p>
          {site.bookingSettings.maxNights && (
            <p>• Tối đa {site.bookingSettings.maxNights} đêm</p>
          )}
          {site.bookingSettings.advanceNotice && (
            <p>• Đặt trước {site.bookingSettings.advanceNotice} giờ</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
