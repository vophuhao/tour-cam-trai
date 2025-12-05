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
import { differenceInDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Dog, MapPin, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
    tent: 'Tent',
    rv: 'RV',
    cabin: 'Cabin',
    glamping: 'Glamping',
    yurt: 'Yurt',
    treehouse: 'Treehouse',
    vehicle: 'Vehicle',
  };

  // Get max capacity from sites
  const maxCapacity = useMemo(() => {
    if (sites.length === 0) return { maxGuests: 20, maxPets: 5 };
    const maxGuests = Math.max(...sites.map(s => s.capacity.maxGuests || 20));
    const maxPets = Math.max(...sites.map(s => s.capacity.maxPets || 0));
    return { maxGuests, maxPets };
  }, [sites]);

  // Collect all site IDs to check their availability
  const siteIdsForAvailability = useMemo(() => {
    if (sites.length > 0) {
      return sites.filter(s => s.isActive).map(s => s._id);
    }
    return [];
  }, [sites]);

  // Fetch blocked dates for all sites when dates are selected
  const availabilityWindow = useMemo(() => {
    if (!booking.dateRange?.from || !booking.dateRange?.to) return null;
    return {
      checkIn: booking.dateRange.from.toISOString(),
      checkOut: booking.dateRange.to.toISOString(),
    };
  }, [booking.dateRange]);

  // Fetch blocked dates for each site
  const { data: siteAvailabilities } = useQuery({
    queryKey: [
      'site-blocked-dates',
      siteIdsForAvailability,
      availabilityWindow,
    ],
    queryFn: async () => {
      if (siteIdsForAvailability.length === 0 || !availabilityWindow) return [];
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
    enabled: siteIdsForAvailability.length > 0 && !!availabilityWindow,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create a map of site ID to blocked status
  const siteBlockedMap = useMemo(() => {
    const map = new Map<string, boolean>();
    if (
      !siteAvailabilities ||
      !booking.dateRange?.from ||
      !booking.dateRange?.to
    ) {
      return map;
    }

    sites.forEach((site, index) => {
      const result = siteAvailabilities[index];
      // If site has any blocked dates in the selected range, mark as blocked
      const hasBlockedDates =
        result?.data?.blockedDates && result.data.blockedDates.length > 0;

      // Also mark as blocked if nights exceed booking settings
      const exceedsBookingSettings = siteUnavailableReason.has(site._id);

      map.set(site._id, hasBlockedDates || exceedsBookingSettings);
    });

    return map;
  }, [siteAvailabilities, sites, booking.dateRange, siteUnavailableReason]);

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

  return (
    <div className="relative" id="sites">
      {/* Sites List + Map Layout */}
      <div className="flex min-h-0 gap-0">
        {/* Sites List - Scrollable */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto scroll-smooth pr-4 lg:pr-6">
            {/* Select a site header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold sm:text-3xl">Select a site</h2>
              {filteredSites.length > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  {filteredSites.length} site
                  {filteredSites.length > 1 ? 's' : ''} available
                  {booking.dateRange?.from && booking.dateRange?.to && (
                    <>
                      {' '}
                      for{' '}
                      {format(booking.dateRange.from, 'MMM d', {
                        locale: vi,
                      })}{' '}
                      – {format(booking.dateRange.to, 'd', { locale: vi })}
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Date & Guest Selectors Row */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {/* Date Range */}
              <DateRangePopover
                dateRange={booking.dateRange}
                onDateChange={booking.setDateRange}
                open={datePopoverOpen}
                onOpenChange={setDatePopoverOpen}
                placeholder="Add dates"
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
                  adults: 'Guests',
                  adultsSubtext: 'Ages 13 or above',
                  children: 'Children',
                  childrenSubtext: 'Ages 0-12',
                  pets: 'Pets',
                  petsSubtext: `Max ${maxCapacity.maxPets}`,
                  guestsText: guests =>
                    `${guests} guest${guests > 1 ? 's' : ''}`,
                  childrenText: children => `${children} children`,
                }}
              />
            </div>

            {/* Filter Buttons Row */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-gray-300 hover:border-orange-500 hover:bg-orange-50"
              >
                <MapPin className="mr-1 h-4 w-4" />
                Camping style
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-gray-300 hover:border-orange-500 hover:bg-orange-50"
              >
                Amenities
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
                Pets allowed
              </Button>
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
                ⚡ Instant book
              </Button>
            </div>

            {/* Sites content */}
            {accommodationTypes.map(type => {
              const sitesInGroup = groupedSites[type];
              return (
                <div key={type} className="mb-8">
                  {/* Group Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">
                      {typeLabels[type] || type} sites
                    </h3>
                    <p className="text-sm text-gray-600">
                      {sitesInGroup.length} site
                      {sitesInGroup.length > 1 ? 's' : ''} left
                    </p>
                  </div>

                  {/* Sites in Group */}
                  <div className="space-y-4">
                    {sitesInGroup.map(site => {
                      const totalPrice = site.pricing.basePrice * nights;
                      const amenityIcons: string[] = [];
                      if (site.amenities?.firePit) amenityIcons.push('🔥');
                      if (site.amenities?.electrical?.available)
                        amenityIcons.push('⚡');
                      if (site.amenities?.water?.hookup)
                        amenityIcons.push('💧');
                      if (site.amenities?.picnicTable) amenityIcons.push('🪑');

                      return (
                        <Card
                          key={site._id}
                          className={`group cursor-pointer overflow-hidden border transition-all duration-200 ${
                            selectedSite?._id === site._id
                              ? 'shadow-lg ring-2 ring-orange-500'
                              : 'hover:border-orange-200 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedSite(site)}
                          onMouseEnter={() => setHoveredSite(site)}
                          onMouseLeave={() => setHoveredSite(null)}
                        >
                          <div className="flex gap-4 p-4">
                            {/* Site Image */}
                            {site.photos && site.photos.length > 0 && (
                              <div className="relative h-48 w-72 shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
                                    +{site.photos.length - 1} photos
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Site Info */}
                            <div className="flex flex-1 flex-col justify-between">
                              <div>
                                {/* Title & Rating */}
                                <div className="mb-2 flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-lg font-bold">
                                        {site.name}
                                      </h4>
                                      {site.bookingSettings.instantBook && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          ⚡ Instant
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
                                  {site.stats?.averageRating &&
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
                                    )}
                                </div>

                                {/* Details */}
                                <p className="mb-2 text-sm text-gray-700">
                                  {typeLabels[site.accommodationType]} · Sleeps{' '}
                                  {site.capacity.maxGuests} ·{' '}
                                  {site.capacity.maxVehicles &&
                                    `Vehicles under ${site.capacity.rvMaxLength || 35} ft`}
                                </p>

                                {/* Description */}
                                {site.description && (
                                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                                    {site.description}
                                  </p>
                                )}

                                {/* Amenities Icons */}
                                <div className="mb-3 flex flex-wrap gap-4 text-sm">
                                  {amenityIcons.map((icon, idx) => (
                                    <span key={idx}>{icon}</span>
                                  ))}
                                  {site.amenities?.firePit && (
                                    <span className="text-gray-600">
                                      No campfires
                                    </span>
                                  )}
                                  {site.capacity.maxPets &&
                                    site.capacity.maxPets > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Dog className="h-4 w-4" /> Pets allowed
                                      </span>
                                    )}
                                  {site.amenities?.electrical?.available && (
                                    <span>Electrical hookup</span>
                                  )}
                                  {site.amenities?.water?.hookup && (
                                    <span>Water hookup</span>
                                  )}
                                </div>
                              </div>

                              {/* Price & CTA */}
                              <div className="flex items-end justify-between">
                                <div>
                                  <p className="text-2xl font-bold">
                                    €{site.pricing.basePrice}
                                    <span className="text-sm font-normal text-gray-600">
                                      {' '}
                                      / night
                                    </span>
                                  </p>

                                  {site.capacity.maxConcurrentBookings > 1 && (
                                    <div className="mt-1 flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                        <span className="text-sm font-medium text-green-700">
                                          {site.capacity.maxConcurrentBookings}{' '}
                                          spots available
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="lg"
                                  className="bg-orange-600 px-8 hover:bg-orange-700"
                                  asChild
                                >
                                  <Link
                                    href={
                                      booking.dateRange?.from &&
                                      booking.dateRange?.to
                                        ? `/checkouts/payment?` +
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
                                                      .additionalGuestFee ||
                                                      0) *
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
                                        : `/land/${propertySlug}/sites/${site.slug}`
                                    }
                                  >
                                    Reserve
                                  </Link>
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
              <div className="py-12 text-center">
                <p className="text-gray-500">No sites match your filters</p>
              </div>
            )}

            {/* "These aren't exact matches" section */}
            {filteredSites.length < sites.length && (
              <div className="mt-12">
                <h3 className="mb-4 text-xl font-bold">
                  These aren&apos;t exact matches
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {booking.dateRange?.from && booking.dateRange?.to
                    ? 'These sites are not available for your selected dates or do not meet all your criteria.'
                    : 'These sites do not meet all your selected criteria.'}
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sites
                    .filter(s => !filteredSites.includes(s) && s.isActive)
                    .slice(0, 3)
                    .map(site => {
                      const isBlocked = siteBlockedMap.get(site._id);
                      return (
                        <Card
                          key={site._id}
                          className="overflow-hidden opacity-75"
                        >
                          {site.photos && site.photos.length > 0 && (
                            <div className="relative">
                              <img
                                src={site.photos[0].url}
                                alt={site.name}
                                className="h-48 w-full object-cover grayscale"
                              />
                              {isBlocked &&
                                booking.dateRange?.from &&
                                booking.dateRange?.to && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <Badge
                                      variant="destructive"
                                      className="text-sm"
                                    >
                                      {siteUnavailableReason.get(site._id) ||
                                        'Not available'}
                                    </Badge>
                                  </div>
                                )}
                            </div>
                          )}
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-bold text-gray-600">
                                {site.name}
                              </h4>
                              {site.stats?.averageRating && (
                                <span className="text-sm text-gray-500">
                                  👍{' '}
                                  {Math.round(
                                    (site.stats.averageRating / 5) * 100,
                                  )}
                                  %
                                </span>
                              )}
                            </div>
                            <p className="mb-3 text-sm text-gray-500">
                              {typeLabels[site.accommodationType]} · Sleeps{' '}
                              {site.capacity.maxGuests}
                            </p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-bold text-gray-600">
                                  €{site.pricing.basePrice}
                                </p>
                                <p className="text-xs text-gray-400">/ night</p>
                              </div>
                              {isBlocked &&
                              booking.dateRange?.from &&
                              booking.dateRange?.to ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="cursor-not-allowed"
                                >
                                  Unavailable
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-400 text-gray-600 hover:bg-gray-100"
                                  asChild
                                >
                                  <Link
                                    href={`/land/${propertySlug}/sites/${site.slug}`}
                                  >
                                    View details
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
