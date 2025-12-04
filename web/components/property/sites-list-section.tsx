'use client';

import {
  DateRangePicker,
  type DateRangeType,
} from '@/components/search/date-range-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import type { Property, Site } from '@/types/property-site';
import { differenceInDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Dog, MapPin, Minus, Plus, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';

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
  // Date & Guest State
  const [dateRange, setDateRange] = useState<DateRangeType | undefined>(() => {
    if (initialCheckIn && initialCheckOut) {
      return { from: new Date(initialCheckIn), to: new Date(initialCheckOut) };
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

  // Filter State
  const [filterType] = useState<string | null>(null);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [instantBook, setInstantBook] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [hoveredSite, setHoveredSite] = useState<Site | null>(null);

  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 1;

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

  // Filter sites
  const filteredSites = useMemo(() => {
    let result = sites.filter(site => site.isActive);

    // Filter by accommodation type
    if (filterType) {
      result = result.filter(s => s.accommodationType === filterType);
    }

    // Filter by capacity
    if (guests) {
      result = result.filter(s => s.capacity.maxGuests >= guests);
    }

    // Filter by pets
    if (petsAllowed && pets > 0) {
      result = result.filter(
        s => s.capacity.maxPets && s.capacity.maxPets >= pets,
      );
    }

    // Filter by instant book
    if (instantBook) {
      result = result.filter(s => s.bookingSettings.instantBook);
    }

    return result;
  }, [sites, filterType, guests, pets, petsAllowed, instantBook]);

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

  // Get max capacity from sites
  const maxCapacity = useMemo(() => {
    if (sites.length === 0) return { maxGuests: 20, maxPets: 5 };
    const maxGuests = Math.max(...sites.map(s => s.capacity.maxGuests || 20));
    const maxPets = Math.max(...sites.map(s => s.capacity.maxPets || 5));
    return { maxGuests, maxPets };
  }, [sites]);

  const handleDateChange = (newDateRange?: DateRangeType) => {
    setDateRange(newDateRange);
    if (newDateRange?.from && newDateRange?.to) {
      setDatePopoverOpen(false);
    }
  };

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
            </div>

            {/* Date & Guest Selectors Row */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {/* Date Range */}
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 justify-start border-gray-300 bg-white px-4"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-600" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span className="font-normal">
                          {format(dateRange.from, 'MMM d', { locale: vi })} –{' '}
                          {format(dateRange.to, 'd', { locale: vi })}
                        </span>
                      ) : (
                        format(dateRange.from, 'MMM d', { locale: vi })
                      )
                    ) : (
                      <span className="font-normal">Add dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-5" align="start">
                  <DateRangePicker
                    date={dateRange}
                    onDateChange={handleDateChange}
                  />
                </PopoverContent>
              </Popover>

              {/* Guests */}
              <Popover
                open={guestPopoverOpen}
                onOpenChange={setGuestPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 justify-start border-gray-300 bg-white px-4"
                  >
                    <Users className="mr-2 h-4 w-4 text-gray-600" />
                    <span className="font-normal">
                      {guests} guest{guests > 1 ? 's' : ''}
                      {children > 0 && ` (${children} children)`}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Guests</p>
                        <p className="text-muted-foreground text-xs">
                          Ages 13 or above
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

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Children</p>
                        <p className="text-muted-foreground text-xs">
                          Ages 0-12
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

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pets</p>
                        <p className="text-muted-foreground text-xs">
                          Max {maxCapacity.maxPets}
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
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filter Buttons Row */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-gray-300"
              >
                <MapPin className="mr-1 h-4 w-4" />
                Camping style
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-gray-300"
              >
                Amenities
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-gray-300"
                onClick={() => setPetsAllowed(!petsAllowed)}
              >
                Pets allowed
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-gray-300"
                onClick={() => setInstantBook(!instantBook)}
              >
                Instant book
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
                          className={`cursor-pointer overflow-hidden border transition-all hover:shadow-md ${
                            selectedSite?._id === site._id
                              ? 'ring-2 ring-orange-500'
                              : ''
                          }`}
                          onClick={() => setSelectedSite(site)}
                          onMouseEnter={() => setHoveredSite(site)}
                          onMouseLeave={() => setHoveredSite(null)}
                        >
                          <div className="flex gap-4 p-4">
                            {/* Site Image */}
                            {site.photos && site.photos.length > 0 && (
                              <div className="relative h-48 w-72 shrink-0 overflow-hidden rounded-lg">
                                <img
                                  src={
                                    site.photos.find(p => p.isCover)?.url ||
                                    site.photos[0].url
                                  }
                                  alt={site.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}

                            {/* Site Info */}
                            <div className="flex flex-1 flex-col justify-between">
                              <div>
                                {/* Title & Rating */}
                                <div className="mb-2 flex items-start justify-between">
                                  <h4 className="text-lg font-bold">
                                    {site.name}
                                  </h4>
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
                                  {dateRange?.from && dateRange?.to && (
                                    <p className="text-xs text-gray-500">
                                      €{totalPrice} total incl. taxes and fees
                                    </p>
                                  )}
                                  {sitesInGroup.length > 1 && (
                                    <p className="mt-1 text-sm font-medium text-orange-600">
                                      {sitesInGroup.length} sites left
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="lg"
                                  className="bg-orange-600 px-8 hover:bg-orange-700"
                                  asChild
                                >
                                  <Link
                                    href={
                                      dateRange?.from && dateRange?.to
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
                                              dateRange.from.toISOString(),
                                            checkOut:
                                              dateRange.to.toISOString(),
                                            basePrice:
                                              site.pricing.basePrice.toString(),
                                            nights: nights.toString(),
                                            cleaningFee: (
                                              site.pricing.cleaningFee || 0
                                            ).toString(),
                                            petFee: pets
                                              ? (
                                                  (site.pricing.petFee || 0) *
                                                  pets
                                                ).toString()
                                              : '0',
                                            additionalGuestFee:
                                              guests > site.capacity.maxGuests
                                                ? (
                                                    (site.pricing
                                                      .additionalGuestFee ||
                                                      0) *
                                                    (guests -
                                                      site.capacity.maxGuests)
                                                  ).toString()
                                                : '0',
                                            total: totalPrice.toString(),
                                            currency:
                                              site.pricing.currency || 'VND',
                                            guests: guests.toString(),
                                            pets: pets.toString(),
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sites
                    .filter(s => !filteredSites.includes(s) && s.isActive)
                    .slice(0, 3)
                    .map(site => (
                      <Card key={site._id} className="overflow-hidden">
                        {site.photos && site.photos.length > 0 && (
                          <img
                            src={site.photos[0].url}
                            alt={site.name}
                            className="h-48 w-full object-cover"
                          />
                        )}
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-bold">{site.name}</h4>
                            {site.stats?.averageRating && (
                              <span className="text-sm">
                                👍{' '}
                                {Math.round(
                                  (site.stats.averageRating / 5) * 100,
                                )}
                                %
                              </span>
                            )}
                          </div>
                          <p className="mb-3 text-sm text-gray-600">
                            {typeLabels[site.accommodationType]} · Sleeps{' '}
                            {site.capacity.maxGuests}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold">
                                €{site.pricing.basePrice}
                              </p>
                              <p className="text-xs text-gray-500">/ night</p>
                            </div>
                            <Button
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                              asChild
                            >
                              <Link
                                href={
                                  dateRange?.from && dateRange?.to
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
                                          site.photos?.[0]?.url ||
                                          site.images?.[0] ||
                                          '',
                                        checkIn: dateRange.from.toISOString(),
                                        checkOut: dateRange.to.toISOString(),
                                        basePrice:
                                          site.pricing.basePrice.toString(),
                                        nights: nights.toString(),
                                        cleaningFee: (
                                          site.pricing.cleaningFee || 0
                                        ).toString(),
                                        petFee: pets
                                          ? (
                                              (site.pricing.petFee || 0) * pets
                                            ).toString()
                                          : '0',
                                        additionalGuestFee:
                                          guests > site.capacity.maxGuests
                                            ? (
                                                (site.pricing
                                                  .additionalGuestFee || 0) *
                                                (guests -
                                                  site.capacity.maxGuests)
                                              ).toString()
                                            : '0',
                                        total: (
                                          site.pricing.basePrice * nights
                                        ).toString(),
                                        currency:
                                          site.pricing.currency || 'VND',
                                        guests: guests.toString(),
                                        pets: pets.toString(),
                                        vehicles: '1',
                                      }).toString()
                                    : `/land/${propertySlug}/sites/${site.slug}`
                                }
                              >
                                Reserve
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="hidden lg:block lg:w-[45%]">
          <div className="sticky top-0 h-screen">
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
