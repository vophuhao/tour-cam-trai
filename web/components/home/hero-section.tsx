'use client';

import type { DateRangeType } from '@/components/search/date-range-picker';
import { saveSearchToHistory } from '@/components/search/location-search';
import { SearchBar } from '@/components/search/search-bar';
import { format } from 'date-fns';
import { Award, MapPin, Tent, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const stats = [
  { icon: Tent, label: 'Địa điểm cắm trại', value: '50+' },
  { icon: Users, label: 'Khách hàng hài lòng', value: '10,000+' },
  { icon: MapPin, label: 'Tỉnh thành', value: '30+' },
  { icon: Award, label: 'Đánh giá 5 sao', value: '95%' },
];

export default function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  }>();
  const [dateRange, setDateRange] = useState<DateRangeType>();
  const [guests, setGuests] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [pets, setPets] = useState(0);

  const handleSearch = () => {
    const params = new URLSearchParams();

    // Add coordinates if available (geospatial search)
    if (coordinates) {
      params.set('lat', coordinates.lat.toString());
      params.set('lng', coordinates.lng.toString());
      params.set('radius', '50'); // 50km radius
      // Save to recent searches with date and guest info
      const totalGuests = guests + childrenCount;
      saveSearchToHistory(
        location,
        coordinates,
        dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
        totalGuests || undefined,
      );
    }
    // Otherwise use city name for text-based search
    else if (location) {
      params.set('city', location);
    }

    if (dateRange?.from) {
      params.set('checkIn', format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange?.to) {
      params.set('checkOut', format(dateRange.to, 'yyyy-MM-dd'));
    }
    const totalGuests = guests + childrenCount;
    if (totalGuests) params.set('minGuests', totalGuests.toString());

    router.push(`/search?${params.toString()}`);
  };

  const handleNearbyClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          setCoordinates(coords);
          setLocation('Vị trí hiện tại');
        },
        error => {
          console.error('Error getting location:', error);
          alert('Không thể lấy vị trí hiện tại');
        },
      );
    } else {
      alert('Trình duyệt không hỗ trợ định vị');
    }
  };

  return (
    <section className="relative -mt-16 min-h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/landing-image-1.avif"
          alt="Camping in nature"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center px-4 pt-16">
        <div className="mb-12 text-center text-white">
          <h1 className="mb-6 text-5xl leading-tight font-bold md:text-6xl lg:text-7xl">
            Tìm Địa Điểm
            <br />
            <span className="bg-linear-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Cắm Trại Hoàn Hảo
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-100 md:text-xl">
            Khám phá hơn 50+ địa điểm cắm trại tuyệt vời trên khắp Việt Nam
          </p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto w-full max-w-6xl">
          <SearchBar
            location={location}
            onLocationChange={setLocation}
            onLocationSelect={(loc, coords) => {
              setLocation(loc);
              setCoordinates(coords);
            }}
            onNearbyClick={handleNearbyClick}
            dateRange={dateRange}
            onDateChange={setDateRange}
            guests={guests}
            childrenCount={childrenCount}
            pets={pets}
            onGuestsChange={setGuests}
            onChildrenChange={setChildrenCount}
            onPetsChange={setPets}
            onSearch={handleSearch}
            onRecentSearchDateSelect={(checkIn, checkOut) => {
              setDateRange({
                from: new Date(checkIn),
                to: new Date(checkOut),
              });
            }}
            onRecentSearchGuestsSelect={totalGuests => {
              setGuests(totalGuests);
              setChildrenCount(0);
            }}
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute right-0 bottom-0 left-0 z-10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-900"
                >
                  <div className="rounded-full bg-emerald-100 p-3">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
