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
import { getBlockedDates } from '@/lib/client-actions';
import type { Property, Site } from '@/types/property-site';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Minus, Plus, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface PropertyBookingCardProps {
  property: Property;
  sites: Site[];
  initialGuests?: number;
  initialPets?: number;
  checkIn?: string;
  checkOut?: string;
  isUndesignated?: boolean; // New prop to handle undesignated properties
  onSearch?: (params: {
    checkIn: string;
    checkOut: string;
    guests: number;
    pets: number;
  }) => void;
}

export function PropertyBookingCard({
  property,
  sites,
  initialGuests = 2,
  initialPets = 0,
  checkIn,
  checkOut,
  isUndesignated = false,
  onSearch,
}: PropertyBookingCardProps) {
  const [dateRange, setDateRange] = useState<DateRangeType | undefined>(() => {
    if (checkIn && checkOut) {
      return {
        from: new Date(checkIn),
        to: new Date(checkOut),
      };
    }
    return undefined;
  });
  const [adults, setAdults] = useState(Math.max(1, initialGuests - 0)); // At least 1 adult
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(initialPets);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);

  // Total guests = adults + children
  const guests = adults + children;

  // Collect all site IDs to check their availability (for both designated and undesignated)
  const siteIdsForAvailability = useMemo(() => {
    if (sites.length > 0) {
      return sites.filter(s => s.isActive).map(s => s._id);
    }
    return [];
  }, [sites]);

  // Fetch blocked dates for all sites (designated) or group (undesignated)
  // We'll fetch availability for a 6-month window from today
  const availabilityWindow = useMemo(() => {
    const today = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(today.getMonth() + 6);
    return {
      checkIn: today.toISOString(),
      checkOut: sixMonthsLater.toISOString(),
    };
  }, []);

  // For designated: fetch blocked dates for each site and merge them
  const { data: siteAvailabilities } = useQuery({
    queryKey: ['site-blocked-dates', siteIdsForAvailability],
    queryFn: async () => {
      if (siteIdsForAvailability.length === 0) return [];
      const results = await Promise.all(
        siteIdsForAvailability.map(siteId =>
          getBlockedDates(
            siteId,
            availabilityWindow.checkIn,
            availabilityWindow.checkOut,
          ),
        ),
      );
      return results;
    },
    enabled: siteIdsForAvailability.length > 0, // Enable for both designated and undesignated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process blocked dates using useMemo
  const blockedDates = useMemo(() => {
    if (!siteAvailabilities || siteAvailabilities.length === 0) return [];

    if (isUndesignated) {
      // For UNDESIGNATED: Block dates only when ALL sites are blocked
      // (same logic as designated - only block if no sites available)
      const dateBlockedCount = new Map<string, number>();

      siteAvailabilities.forEach(
        (result: { data?: { blockedDates?: string[] } }) => {
          if (result.data?.blockedDates) {
            result.data.blockedDates.forEach((dateStr: string) => {
              dateBlockedCount.set(
                dateStr,
                (dateBlockedCount.get(dateStr) || 0) + 1,
              );
            });
          }
        },
      );

      // Only block dates that are blocked in ALL sites
      const fullyBlockedDates: string[] = [];
      dateBlockedCount.forEach((count, dateStr) => {
        if (count === siteAvailabilities.length) {
          fullyBlockedDates.push(dateStr);
        }
      });

      return fullyBlockedDates.map(dateStr => new Date(dateStr));
    } else {
      // For DESIGNATED: Block dates only when ALL sites are blocked
      const dateBlockedCount = new Map<string, number>();

      siteAvailabilities.forEach(
        (result: { data?: { blockedDates?: string[] } }) => {
          if (result.data?.blockedDates) {
            result.data.blockedDates.forEach((dateStr: string) => {
              dateBlockedCount.set(
                dateStr,
                (dateBlockedCount.get(dateStr) || 0) + 1,
              );
            });
          }
        },
      );

      // Only block dates that are blocked in ALL sites
      const fullyBlockedDates: string[] = [];
      dateBlockedCount.forEach((count, dateStr) => {
        if (count === siteAvailabilities.length) {
          fullyBlockedDates.push(dateStr);
        }
      });

      return fullyBlockedDates.map(dateStr => new Date(dateStr));
    }
  }, [siteAvailabilities, isUndesignated]);

  // Calculate pricing range from available sites
  const prices = sites
    .filter(site => site.isActive)
    .map(site => site.pricing.basePrice);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // Calculate nights
  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 1;

  // Get maximumNights from sites (for undesignated)
  const maximumNights = useMemo(() => {
    if (!isUndesignated || sites.length === 0) return undefined;
    // All sites in undesignated group should have same maximumNights
    return sites[0]?.bookingSettings?.maximumNights;
  }, [isUndesignated, sites]);

  // Check if selected nights exceed maximum for undesignated
  const exceedsMaxNights = useMemo(() => {
    if (!isUndesignated || !maximumNights || !dateRange?.from || !dateRange?.to)
      return false;
    return nights > maximumNights;
  }, [isUndesignated, maximumNights, nights, dateRange]);

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

  // Get max capacity from sites
  const maxCapacity = useMemo(() => {
    if (sites.length === 0) return { maxGuests: 20, maxPets: 5 };
    const maxGuests = Math.max(...sites.map(s => s.capacity.maxGuests || 20));
    const maxPets = Math.max(...sites.map(s => s.capacity.maxPets || 5));
    return { maxGuests, maxPets };
  }, [sites]);

  const handleGuestChange = (
    type: 'adults' | 'children' | 'pets',
    delta: number,
  ) => {
    if (type === 'adults') {
      const newValue = Math.max(1, adults + delta);
      // Check if total guests would exceed capacity
      if (newValue + children <= maxCapacity.maxGuests) {
        setAdults(newValue);
      }
    } else if (type === 'children') {
      const newValue = Math.max(0, children + delta);
      // Check if total guests would exceed capacity
      if (adults + newValue <= maxCapacity.maxGuests) {
        setChildren(newValue);
      }
    } else {
      const newValue = Math.max(0, pets + delta);
      if (newValue <= maxCapacity.maxPets) {
        setPets(newValue);
      }
    }
  };

  const handleSearch = () => {
    // Validation: Check if dates are selected
    if (!dateRange?.from || !dateRange?.to) {
      setDatePopoverOpen(true);
      return;
    }

    // For undesignated properties, scroll is not needed as there's no sites list
    if (!isUndesignated) {
      // Scroll to sites section with search params
      if (onSearch) {
        onSearch({
          checkIn: dateRange.from.toISOString(),
          checkOut: dateRange.to.toISOString(),
          guests,
          pets,
        });
      }

      // Scroll to sites section
      const sitesSection = document.getElementById('sites');
      if (sitesSection) {
        sitesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Build checkout URL for undesignated booking
  const buildUndesignatedCheckoutUrl = () => {
    if (!dateRange?.from || !dateRange?.to || sites.length === 0) return '#';

    // Get first site (all sites in group have same pricing)
    const representativeSite = sites[0];
    const groupId = representativeSite.groupedSiteInfo?.groupId;

    if (!groupId) return '#';

    const totalPrice = representativeSite.pricing.basePrice * nights;

    return (
      `/checkouts/payment?` +
      new URLSearchParams({
        groupId, // Pass groupId instead of siteId
        propertyId:
          typeof representativeSite.property === 'string'
            ? representativeSite.property
            : representativeSite.property._id,
        name: property.name, // Use property name for undesignated
        location: `${property.location.city}, ${property.location.state}`,
        image: property.photos?.[0]?.url || '',
        checkIn: dateRange.from.toISOString(),
        checkOut: dateRange.to.toISOString(),
        basePrice: representativeSite.pricing.basePrice.toString(),
        nights: nights.toString(),
        cleaningFee: (representativeSite.pricing.cleaningFee || 0).toString(),
        petFee: pets
          ? ((representativeSite.pricing.petFee || 0) * pets).toString()
          : '0',
        additionalGuestFee:
          guests > representativeSite.capacity.maxGuests
            ? (
                (representativeSite.pricing.additionalGuestFee || 0) *
                (guests - representativeSite.capacity.maxGuests)
              ).toString()
            : '0',
        total: totalPrice.toString(),
        currency: representativeSite.pricing.currency || 'VND',
        guests: guests.toString(),
        pets: pets.toString(),
        vehicles: '1',
      }).toString()
    );
  };

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            {minPrice === maxPrice ? (
              <>
                <span className="text-muted-foreground mr-2 text-sm">Từ</span>
                <span className="text-2xl font-bold">
                  {formatPrice(minPrice)}
                </span>
                <span className="text-muted-foreground text-sm"> / đêm</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold">
                  {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                </span>
                <span className="text-muted-foreground text-sm"> / đêm</span>
              </>
            )}
          </div>
          {property.rating && property.rating.average > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">
                {property.rating.average.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({property.rating.count})
              </span>
            </div>
          )}
        </div>
        {property.stats && property.stats.totalSites > 0 && (
          <Badge variant="secondary" className="mt-2 w-fit">
            {property.stats.totalSites} vị trí cắm trại
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
                disabledDates={blockedDates}
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
                  {guests} khách
                  {children > 0 && ` (${children} trẻ em)`}
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
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleGuestChange('adults', -1)}
                      disabled={adults <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{adults}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleGuestChange('adults', 1)}
                      disabled={adults + children >= maxCapacity.maxGuests}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Trẻ em</p>
                    <p className="text-muted-foreground text-xs">
                      Dưới 13 tuổi
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleGuestChange('children', -1)}
                      disabled={children <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{children}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleGuestChange('children', 1)}
                      disabled={adults + children >= maxCapacity.maxGuests}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Pets */}
                {property.petPolicy?.allowed && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Thú cưng</p>
                      <p className="text-muted-foreground text-xs">
                        Tối đa {maxCapacity.maxPets}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleGuestChange('pets', -1)}
                        disabled={pets <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{pets}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleGuestChange('pets', 1)}
                        disabled={pets >= maxCapacity.maxPets}
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

        {/* CTA Button - Different for designated vs undesignated */}
        {isUndesignated ? (
          <div className="space-y-2">
            {/* Maximum nights warning */}
            {exceedsMaxNights && maximumNights && (
              <p className="text-destructive text-center text-sm font-medium">
                Tối đa {maximumNights} đêm
              </p>
            )}
            {/* Undesignated: Direct booking button */}
            <Button
              className="w-full"
              size="lg"
              disabled={!dateRange?.from || !dateRange?.to || exceedsMaxNights}
              asChild={
                !!(dateRange?.from && dateRange?.to && !exceedsMaxNights)
              }
              variant={exceedsMaxNights ? 'outline' : 'default'}
            >
              {dateRange?.from && dateRange?.to ? (
                exceedsMaxNights ? (
                  <span>Đổi ngày</span>
                ) : (
                  <Link href={buildUndesignatedCheckoutUrl()}>
                    Đặt chỗ ngay
                  </Link>
                )
              ) : (
                <span>Chọn ngày để đặt chỗ</span>
              )}
            </Button>
          </div>
        ) : (
          // Designated: Search for available sites
          <Button className="w-full" size="lg" onClick={handleSearch}>
            Tìm vị trí cắm trại phù hợp
          </Button>
        )}

        {/* Info Text */}
        {dateRange?.from && dateRange?.to && !exceedsMaxNights && (
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {nights} đêm · {guests} khách
              {children > 0 && ` (${children} trẻ em)`}
              {pets > 0 && ` · ${pets} thú cưng`}
            </p>
            {isUndesignated ? (
              <p className="text-muted-foreground mt-1 text-xs">
                Vị trí cụ thể sẽ được chọn khi check-in
              </p>
            ) : (
              <p className="text-muted-foreground mt-1 text-xs">
                Giá cụ thể sẽ hiển thị khi chọn vị trí cắm trại
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
