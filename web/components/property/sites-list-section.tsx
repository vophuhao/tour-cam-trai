'use client';

import { DateRangePopover } from '@/components/search/date-range-popover';
import { GuestPopover } from '@/components/search/guest-popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropertyBookingState } from '@/hooks/usePropertyBookingState';
import { getBlockedDates } from '@/lib/client-actions';
import type { Property, Site } from '@/types/property-site';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import {
  CalendarIcon,
  Car,
  ChevronLeft,
  ChevronRight,
  Dog,
  Flame,
  TreePine,
  Users,
  Utensils,
  Wifi,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const SiteMap = dynamic(
  () => import('@/components/property/site-map').then(mod => mod.SiteMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
          <p className="text-sm text-gray-500">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  },
);

interface SitesListSectionProps {
  sites: Site[];
  property: Property;
  propertySlug?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialPets?: number;
}

export function SitesListSection({
  sites,
  property,
  propertySlug,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  initialPets = 0,
}: SitesListSectionProps) {
  // Use shared booking state from URL
  const booking = usePropertyBookingState({
    initialGuests,
    initialPets,
    initialCheckIn,
    initialCheckOut,
  });

  // Local UI state only
  // Sync initial values from booking.guests (which comes from URL)
  const [adults, setAdults] = useState(() => Math.max(1, booking.guests));
  const [children, setChildren] = useState(0);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);

  // Ref for scrolling to date selector
  const dateRangeRef = useRef<HTMLDivElement>(null);

  // Embla carousel for suggested sites
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Helper to get amenity icon
  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet'))
      return <Wifi className="h-3.5 w-3.5" />;
    if (name.includes('điện') || name.includes('electric'))
      return <Zap className="h-3.5 w-3.5" />;
    if (name.includes('lửa') || name.includes('fire') || name.includes('bếp'))
      return <Flame className="h-3.5 w-3.5" />;
    if (name.includes('cây') || name.includes('tree') || name.includes('shade'))
      return <TreePine className="h-3.5 w-3.5" />;
    if (
      name.includes('ăn') ||
      name.includes('food') ||
      name.includes('kitchen')
    )
      return <Utensils className="h-3.5 w-3.5" />;
    if (
      name.includes('xe') ||
      name.includes('parking') ||
      name.includes('vehicle')
    )
      return <Car className="h-3.5 w-3.5" />;
    if (name.includes('pet') || name.includes('thú'))
      return <Dog className="h-3.5 w-3.5" />;
    return <span className="text-emerald-600">•</span>;
  };

  // Sync local adults state when booking.guests changes from URL
  useEffect(() => {
    if (booking.guests !== adults + children) {
      // Update adults only if total changed (preserve children if possible)
      const newAdults = Math.max(1, booking.guests - children);
      setAdults(newAdults);
    }
  }, [booking.guests]); // Only run when URL guests changes

  // Filter State
  const [filterType] = useState<string | null>(null);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [instantBook, setInstantBook] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [hoveredSite, setHoveredSite] = useState<Site | null>(null);

  // Sync adults+children to URL guests
  const handleGuestsChange = (newAdults: number, newChildren: number) => {
    setAdults(newAdults);
    setChildren(newChildren);
    booking.setGuests(newAdults + newChildren);
  };

  // Handle "Đặt ngay" click when no dates selected
  const handleBookNowClick = (e: React.MouseEvent) => {
    if (!booking.dateRange?.from || !booking.dateRange?.to) {
      e.preventDefault();
      // Scroll to date selector
      dateRangeRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      // Open date popover after a brief delay for smooth UX
      setTimeout(() => {
        setDatePopoverOpen(true);
      }, 500);
    }
  };

  const nights =
    booking.dateRange?.from && booking.dateRange?.to
      ? differenceInDays(booking.dateRange.to, booking.dateRange.from)
      : 1;

  // Create a map of site ID to reason why it's unavailable (if any)
  const siteUnavailableReason = useMemo(() => {
    const map = new Map<string, string>();
    if (!booking.dateRange?.from || !booking.dateRange?.to) {
      return map;
    }

    sites.forEach(site => {
      // Check booking settings
      const { minimumNights, maximumNights } = site.bookingSettings;

      if (minimumNights && nights < minimumNights) {
        map.set(site._id, `Tối thiểu ${minimumNights} đêm`);
      } else if (maximumNights && nights > maximumNights) {
        map.set(site._id, `Tối đa ${maximumNights} đêm`);
      }
    });

    return map;
  }, [sites, booking.dateRange, nights]);

  // Accommodation type labels
  const typeLabels: Record<string, string> = {
    tent: 'Lều',
    rv: 'Xe RV / nhà di động',
    cabin: 'Nhà gỗ',
    yurt: 'Nhà lều Mông Cổ (Yurt)',
    treehouse: 'Nhà trên cây',
    tiny_home: 'Nhà tí hon',
    safari_tent: 'Lều safari',
    bell_tent: 'Lều chuông (Bell tent)',
    glamping_pod: 'Nhà glamping (Glamping pod)',
    dome: 'Nhà mái vòm',
    airstream: 'Xe kéo Airstream',
    vintage_trailer: 'Xe kéo cổ (Vintage trailer)',
    van: 'Xe van cắm trại',
  };

  // Get max capacity from sites
  const maxCapacity = useMemo(() => {
    if (sites.length === 0) return { maxGuests: 20, maxPets: 5 };
    const maxGuests = Math.max(...sites.map(s => s.capacity.maxGuests || 20));
    const maxPets = Math.max(...sites.map(s => s.capacity.maxPets || 0));
    return { maxGuests, maxPets };
  }, [sites]);

  // Auto-detect if this is undesignated property
  const isUndesignated = useMemo(() => {
    return sites.some(site => (site.capacity.maxConcurrentBookings ?? 1) > 1);
  }, [sites]);

  // Collect all site IDs to check their availability
  const siteIdsForAvailability = useMemo(() => {
    if (sites.length > 0) {
      return sites.filter(s => s.isActive).map(s => s._id);
    }
    return [];
  }, [sites]);

  // Fetch blocked dates for a 6-month window from today (for calendar display)
  const availabilityWindow = useMemo(() => {
    const today = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(today.getMonth() + 6);
    return {
      checkIn: today.toISOString(),
      checkOut: sixMonthsLater.toISOString(),
    };
  }, []);

  // Fetch blocked dates for each site
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
    enabled: siteIdsForAvailability.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process blocked dates for calendar display (same logic as property-booking-card)
  const blockedDates = useMemo(() => {
    if (!siteAvailabilities || siteAvailabilities.length === 0) return [];

    if (isUndesignated) {
      // For UNDESIGNATED: Find undesignated sites and merge their blocked dates
      const undesignatedIndices: number[] = [];
      sites.forEach((site, index) => {
        if ((site.capacity.maxConcurrentBookings ?? 1) > 1) {
          undesignatedIndices.push(index);
        }
      });

      if (undesignatedIndices.length === 0) return [];

      // If only one undesignated site, use its blocked dates directly
      if (undesignatedIndices.length === 1) {
        const result = siteAvailabilities[undesignatedIndices[0]];
        if (result?.data?.blockedDates) {
          return result.data.blockedDates.map(
            (dateStr: string) => new Date(dateStr),
          );
        }
        return [];
      }

      // If multiple undesignated sites, block only when ALL are blocked
      const dateBlockedCount = new Map<string, number>();
      undesignatedIndices.forEach(index => {
        const result = siteAvailabilities[index];
        if (result?.data?.blockedDates) {
          result.data.blockedDates.forEach((dateStr: string) => {
            dateBlockedCount.set(
              dateStr,
              (dateBlockedCount.get(dateStr) || 0) + 1,
            );
          });
        }
      });

      const fullyBlockedDates: string[] = [];
      dateBlockedCount.forEach((count, dateStr) => {
        if (count === undesignatedIndices.length) {
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

      const fullyBlockedDates: string[] = [];
      dateBlockedCount.forEach((count, dateStr) => {
        if (count === siteAvailabilities.length) {
          fullyBlockedDates.push(dateStr);
        }
      });

      return fullyBlockedDates.map(dateStr => new Date(dateStr));
    }
  }, [siteAvailabilities, isUndesignated, sites]);

  // Separate query for checking site blocking in user's selected date range
  const selectedDateWindow = useMemo(() => {
    if (!booking.dateRange?.from || !booking.dateRange?.to) return null;
    return {
      checkIn: booking.dateRange.from.toISOString(),
      checkOut: booking.dateRange.to.toISOString(),
    };
  }, [booking.dateRange]);

  const { data: selectedDateAvailabilities } = useQuery({
    queryKey: [
      'site-selected-dates-blocked',
      siteIdsForAvailability,
      selectedDateWindow,
    ],
    queryFn: async () => {
      if (siteIdsForAvailability.length === 0 || !selectedDateWindow) return [];
      const results = await Promise.all(
        siteIdsForAvailability.map(siteId =>
          getBlockedDates(
            siteId,
            selectedDateWindow.checkIn,
            selectedDateWindow.checkOut,
          ),
        ),
      );
      return results;
    },
    enabled: siteIdsForAvailability.length > 0 && !!selectedDateWindow,
    staleTime: 5 * 60 * 1000,
  });

  // Create a map of site ID to blocked status (for filtering)
  const siteBlockedMap = useMemo(() => {
    const map = new Map<string, boolean>();
    if (
      !selectedDateAvailabilities ||
      !booking.dateRange?.from ||
      !booking.dateRange?.to
    ) {
      return map;
    }

    sites.forEach((site, index) => {
      const result = selectedDateAvailabilities[index];
      // If site has any blocked dates in the selected range, mark as blocked
      const hasBlockedDates =
        result?.data?.blockedDates && result.data.blockedDates.length > 0;

      // Also mark as blocked if nights exceed booking settings
      const exceedsBookingSettings = siteUnavailableReason.has(site._id);

      map.set(site._id, hasBlockedDates || exceedsBookingSettings);
    });

    return map;
  }, [
    selectedDateAvailabilities,
    sites,
    booking.dateRange,
    siteUnavailableReason,
  ]);

  // Filter sites
  const filteredSites = useMemo(() => {
    let result = sites.filter(site => site.isActive);

    // Filter by accommodation type
    if (filterType) {
      result = result.filter(s => s.accommodationType === filterType);
    }

    // Filter by capacity
    if (booking.guests) {
      result = result.filter(s => s.capacity.maxGuests >= booking.guests);
    }

    // Filter by pets
    if (petsAllowed && booking.pets > 0) {
      result = result.filter(
        s => s.capacity.maxPets && s.capacity.maxPets >= booking.pets,
      );
    }

    // Filter by instant book
    if (instantBook) {
      result = result.filter(s => s.bookingSettings.instantBook);
    }

    // Filter by availability - exclude blocked sites when dates are selected
    if (
      booking.dateRange?.from &&
      booking.dateRange?.to &&
      siteBlockedMap.size > 0
    ) {
      result = result.filter(s => !siteBlockedMap.get(s._id));
    }

    return result;
  }, [
    sites,
    filterType,
    booking.guests,
    booking.pets,
    petsAllowed,
    instantBook,
    booking.dateRange,
    siteBlockedMap,
  ]);

  // Group sites by accommodation type
  const groupedSites = useMemo(() => {
    const groups: Record<string, Site[]> = {};
    filteredSites.forEach(site => {
      const type = site.accommodationType;
      if (!groups[type]) groups[type] = [];
      groups[type].push(site);
    });
    return groups;
  }, [filteredSites]);

  const accommodationTypes = Object.keys(groupedSites);

  // Compute visible site count for a group.
  // If a site is "undesignated" (can have multiple concurrent bookings),
  // count its `maxConcurrentBookings` instead of 1 so the displayed total
  // reflects the actual number of available bookable positions.
  const getSiteCount = (sitesGroup: Site[]) => {
    return sitesGroup.reduce((sum, s) => {
      const concurrent = s.capacity?.maxConcurrentBookings ?? 1;
      return sum + Math.max(1, concurrent);
    }, 0);
  };

  return (
    <div className="relative" id="sites">
      {/* Sites List + Map Layout */}
      <div className="flex min-h-0 gap-0">
        {/* Sites List - Scrollable */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scroll-smooth pr-4 lg:pr-6">
            {/* Select a site header */}
            <h2 className="mb-6 text-xl font-bold sm:text-2xl">
              Chọn vị trí cắm trại
            </h2>

            {/* Date & Guest Selectors Row */}
            <div
              className="mb-4 flex flex-wrap items-center gap-3"
              ref={dateRangeRef}
            >
              {/* Date Range */}
              <DateRangePopover
                dateRange={booking.dateRange}
                onDateChange={booking.setDateRange}
                disabledDates={blockedDates}
                open={datePopoverOpen}
                onOpenChange={setDatePopoverOpen}
                placeholder="Chọn ngày"
                buttonClassName="h-11 border-gray-300 bg-white px-4"
                align="start"
                dateFormat="MMM d"
                icon={<CalendarIcon className="mr-2 h-4 w-4 text-gray-600" />}
              />

              {/* Guests */}
              <GuestPopover
                adults={adults}
                childrenCount={children}
                pets={booking.pets}
                onAdultsChange={newAdults =>
                  handleGuestsChange(newAdults, children)
                }
                onChildrenChange={newChildren =>
                  handleGuestsChange(adults, newChildren)
                }
                onPetsChange={booking.setPets}
                open={guestPopoverOpen}
                onOpenChange={setGuestPopoverOpen}
                maxGuests={maxCapacity.maxGuests}
                maxPets={maxCapacity.maxPets}
                buttonClassName="h-11 border-gray-300 bg-white px-4"
                align="start"
                icon={<Users className="mr-2 h-4 w-4 text-gray-600" />}
                labels={{
                  adults: 'Khách',
                  adultsSubtext: 'Từ 13 tuổi trở lên',
                  children: 'Trẻ em',
                  childrenSubtext: 'Dưới 13 tuổi',
                  pets: 'Thú cưng',
                  petsSubtext: `Tối đa ${maxCapacity.maxPets}`,
                  guestsText: guests => `${guests} khách`,
                  childrenText: children => `${children} trẻ em`,
                }}
              />

              <Button
                variant={instantBook ? 'default' : 'outline'}
                size="sm"
                className={`h-9 rounded-full transition-all ${
                  instantBook
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                }`}
                onClick={() => setInstantBook(!instantBook)}
              >
                ⚡ Đặt ngay
              </Button>
            </div>

            {/* Filter Buttons Row */}
            {/* <div className="mb-6 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-gray-300 hover:border-orange-500 hover:bg-orange-50"
              >
                <MapPin className="mr-1 h-4 w-4" />
                Loại hình
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-gray-300 hover:border-orange-500 hover:bg-orange-50"
              >
                Tiện nghi
              </Button>
              <Button
                variant={petsAllowed ? 'default' : 'outline'}
                size="sm"
                className={`h-9 rounded-full transition-all ${
                  petsAllowed
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                }`}
                onClick={() => setPetsAllowed(!petsAllowed)}
              >
                <Dog className="mr-1 h-4 w-4" />
                Cho phép thú cưng
              </Button>
            </div> */}

            {/* Sites content */}
            {accommodationTypes.map(type => {
              const sitesInGroup = groupedSites[type];
              return (
                <div key={type} className="mb-8">
                  {/* Group Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">
                      {typeLabels[type] || type}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getSiteCount(sitesInGroup)} vị trí hiện có
                    </p>
                  </div>

                  {/* Sites in Group */}
                  <div className="space-y-4">
                    {sitesInGroup.map(site => {
                      const totalPrice = site.pricing.basePrice * nights;

                      return (
                        <Card
                          key={site._id}
                          className={`group cursor-pointer overflow-hidden border-0 transition-all duration-200 ${
                            selectedSite?._id === site._id
                              ? 'shadow-md ring-2'
                              : 'hover:border-orange-200 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedSite(site)}
                          onMouseEnter={() => setHoveredSite(site)}
                          onMouseLeave={() => setHoveredSite(null)}
                        >
                          <div className="flex gap-4">
                            {/* Site Image */}
                            {site.photos && site.photos.length > 0 && (
                              <div className="relative flex h-62 shrink-0 basis-[45%] overflow-hidden rounded-lg bg-gray-100">
                                <img
                                  src={
                                    site.photos.find(p => p.isCover)?.url ||
                                    site.photos[0].url
                                  }
                                  alt={site.name}
                                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                  loading="lazy"
                                />
                                {site.photos.length > 1 && (
                                  <div className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                                    +{site.photos.length - 1}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Site Info - Max height matches image */}
                            <div
                              className="flex flex-1 flex-col justify-between overflow-hidden"
                              style={{ maxHeight: '248px' }}
                            >
                              <div>
                                {/* Title & Rating */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-md font-bold">
                                        {site.name}
                                      </h4>
                                      {site.bookingSettings.instantBook && (
                                        <Badge
                                          variant="outline"
                                          className="text-center text-xs"
                                        >
                                          Đặt ngay
                                        </Badge>
                                      )}
                                      {/* Show unavailable reason badge */}
                                      {siteUnavailableReason.has(site._id) && (
                                        <Badge
                                          variant="destructive"
                                          className="text-xs"
                                        >
                                          {siteUnavailableReason.get(site._id)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {/* {site.stats?.averageRating &&
                                    site.stats.averageRating > 0 && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-lg">👍</span>
                                        <span className="text-sm font-semibold">
                                          {Math.round(
                                            (site.stats.averageRating / 5) *
                                              100,
                                          )}
                                          %
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          ({site.stats.totalReviews || 0})
                                        </span>
                                      </div>
                                    )} */}
                                </div>

                                {/* Details */}
                                <p className="mb-1 text-xs text-gray-700">
                                  {typeLabels[site.accommodationType]} · Tối đa{' '}
                                  {site.capacity.maxGuests} người
                                  {site.capacity.maxVehicles &&
                                    site.capacity.maxVehicles > 0 &&
                                    ` · Xe dưới ${site.capacity.rvMaxLength || 35} ft`}
                                </p>

                                {/* Description */}
                                {site.description && (
                                  <p className="mb-2 line-clamp-2 text-xs text-gray-600">
                                    {site.description}
                                  </p>
                                )}

                                {/* Amenities Grid - 2 columns x 3 rows */}
                                {site.amenities &&
                                  site.amenities.length > 0 && (
                                    <div className="mb-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600">
                                      {site.amenities
                                        .slice(0, 6)
                                        .map((amenity, idx) => {
                                          const amenityName =
                                            typeof amenity === 'string'
                                              ? amenity
                                              : amenity.name;
                                          const icon =
                                            getAmenityIcon(amenityName);
                                          return (
                                            <span
                                              key={idx}
                                              className="flex items-center gap-1.5 truncate"
                                            >
                                              {icon}
                                              <span className="truncate">
                                                {amenityName}
                                              </span>
                                            </span>
                                          );
                                        })}
                                    </div>
                                  )}
                              </div>

                              {/* Price & CTA */}
                              <div className="flex items-end justify-between">
                                <div>
                                  <p className="text-md font-bold">
                                    {site.pricing.basePrice} VND
                                    <span className="text-sm font-normal text-gray-600">
                                      {' '}
                                      / đêm
                                    </span>
                                  </p>

                                  {site.capacity.maxConcurrentBookings > 1 && (
                                    <div className="mt-1 flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                        <span className="text-xs font-medium text-green-700">
                                          {site.capacity.maxConcurrentBookings}{' '}
                                          vị trí có sẵn
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="lg"
                                  className="hover:bg-primary/90 m-2 px-8"
                                  asChild={
                                    !!(
                                      booking.dateRange?.from &&
                                      booking.dateRange?.to
                                    )
                                  }
                                  onClick={handleBookNowClick}
                                >
                                  {booking.dateRange?.from &&
                                  booking.dateRange?.to ? (
                                    <Link
                                      href={
                                        `/checkouts/payment?` +
                                        new URLSearchParams({
                                          siteId: site._id,
                                          propertyId:
                                            typeof site.property === 'string'
                                              ? site.property
                                              : site.property._id,
                                          name: site.name,
                                          location: `${property.location.city}, ${property.location.state}`,
                                          image:
                                            site.photos?.find(p => p.isCover)
                                              ?.url ||
                                            site.photos?.[0]?.url ||
                                            '',
                                          checkIn:
                                            booking.dateRange.from.toISOString(),
                                          checkOut:
                                            booking.dateRange.to.toISOString(),
                                          basePrice:
                                            site.pricing.basePrice.toString(),
                                          nights: nights.toString(),
                                          cleaningFee: (
                                            site.pricing.cleaningFee || 0
                                          ).toString(),
                                          petFee: booking.pets
                                            ? (
                                                (site.pricing.petFee || 0) *
                                                booking.pets
                                              ).toString()
                                            : '0',
                                          additionalGuestFee:
                                            booking.guests >
                                            site.capacity.maxGuests
                                              ? (
                                                  (site.pricing
                                                    .additionalGuestFee || 0) *
                                                  (booking.guests -
                                                    site.capacity.maxGuests)
                                                ).toString()
                                              : '0',
                                          total: totalPrice.toString(),
                                          currency:
                                            site.pricing.currency || 'VND',
                                          guests: booking.guests.toString(),
                                          pets: booking.pets.toString(),
                                          vehicles: '1',
                                        }).toString()
                                      }
                                    >
                                      Đặt
                                    </Link>
                                  ) : (
                                    <span>Đặt</span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* No Results */}
            {accommodationTypes.length === 0 && (
              <div className="mt-20 py-12 text-center">
                <p className="text-gray-500">Không có vị trí nào phù hợp</p>
              </div>
            )}

            {/* "These aren't exact matches" section - Carousel */}
            {filteredSites.length < sites.length && (
              <div className="mt-12">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold">
                    Những vị trí này có thể phù hợp với bạn
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => emblaApi?.scrollPrev()}
                      disabled={!canScrollPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => emblaApi?.scrollNext()}
                      disabled={!canScrollNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex gap-4">
                    {sites
                      .filter(s => !filteredSites.includes(s) && s.isActive)
                      .map(site => {
                        const isBlocked = siteBlockedMap.get(site._id);
                        const totalPrice = site.pricing.basePrice * nights;
                        return (
                          <div
                            key={site._id}
                            className="max-w-60 min-w-[300px] shrink-0"
                          >
                            <Card className="h-full overflow-hidden border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                              {site.photos && site.photos.length > 0 && (
                                <div className="relative h-[220px] w-full overflow-hidden">
                                  <img
                                    src={site.photos[0].url}
                                    alt={site.name}
                                    className="h-full w-full object-cover"
                                  />
                                  {isBlocked &&
                                    booking.dateRange?.from &&
                                    booking.dateRange?.to && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <Badge
                                          variant="destructive"
                                          className="text-sm"
                                        >
                                          {siteUnavailableReason.get(
                                            site._id,
                                          ) || 'Không khả dụng'}
                                        </Badge>
                                      </div>
                                    )}
                                </div>
                              )}
                              <CardContent className="p-4">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                  <h4 className="line-clamp-1 font-semibold">
                                    {site.name}
                                  </h4>
                                  {site.stats?.averageRating && (
                                    <span className="flex shrink-0 items-center gap-1 text-sm">
                                      👍
                                      <span className="font-medium">
                                        {Math.round(
                                          (site.stats.averageRating / 5) * 100,
                                        )}
                                        %
                                      </span>
                                      <span className="text-gray-400">
                                        ({site.stats.totalReviews || 0})
                                      </span>
                                    </span>
                                  )}
                                </div>
                                <p className="mb-3 text-sm text-gray-600">
                                  {typeLabels[site.accommodationType]} · Tối đa{' '}
                                  {site.capacity.maxGuests} người
                                  {site.capacity.maxVehicles &&
                                    site.capacity.maxVehicles > 0 &&
                                    ` · Xe dưới ${site.capacity.rvMaxLength || 35} ft`}
                                </p>
                                <div className="flex items-end justify-between">
                                  <div>
                                    <div className="flex items-baseline gap-2">
                                      <p className="text-lg font-bold">
                                        {site.pricing.basePrice.toLocaleString()}{' '}
                                      </p>
                                      <span className="text-sm text-gray-500">
                                        / đêm
                                      </span>
                                    </div>
                                    {booking.dateRange?.from &&
                                      booking.dateRange?.to && (
                                        <p className="text-sm text-gray-500">
                                          {totalPrice.toLocaleString()} ₫ tổng
                                        </p>
                                      )}
                                  </div>
                                  {isBlocked &&
                                  booking.dateRange?.from &&
                                  booking.dateRange?.to ? (
                                    <Button
                                      size="default"
                                      variant="outline"
                                      disabled
                                      className="cursor-not-allowed"
                                    >
                                      Không khả dụng
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => toast('hehe')}
                                      size="default"
                                      asChild
                                    >
                                      Đặt chỗ
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="hidden lg:block lg:w-[45%]">
          <div className="sticky top-0 h-screen overflow-hidden rounded-2xl">
            <SiteMap
              sites={filteredSites}
              property={property}
              selectedSite={selectedSite}
              hoveredSite={hoveredSite}
              onSiteSelect={setSelectedSite}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
