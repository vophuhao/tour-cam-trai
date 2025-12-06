import type { Property } from '@/types/property-site';
import { MapPin, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '../reveal-on-scroll';
import { StaggerContainer, StaggerItem } from '../stagger-animation';
import { Card } from '../ui/card';

interface TopDestinationsProps {
  destinations: Array<{
    state: string;
    city?: string;
    coordinates: { lat: number; lng: number };
    count: number;
    sampleProperty: Property;
  }>;
}

/**
 * TopDestinations Component (Server Component)
 * Shows top camping destinations grouped by state/region with geospatial coordinates
 */
export default function TopDestinations({
  destinations,
}: TopDestinationsProps) {
  if (!destinations || destinations.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-linear-to-b from-gray-50 to-white">
      <div className="container-padding mx-auto max-w-7xl">
        <RevealOnScroll>
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
              Điểm đến hàng đầu
            </span>
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Khám Phá Việt Nam
            </h2>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map(destination => {
            // Build search URL with geospatial coordinates
            const searchUrl = `/search?lat=${destination.coordinates.lat}&lng=${destination.coordinates.lng}&radius=50`;

            return (
              <StaggerItem key={destination.state}>
                <Link href={searchUrl}>
                  <DestinationCard destination={destination} />
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function DestinationCard({
  destination,
}: {
  destination: {
    state: string;
    city?: string;
    coordinates: { lat: number; lng: number };
    count: number;
    sampleProperty: Property;
  };
}) {
  const mainPhoto =
    (destination.sampleProperty?.photos?.[0] as { url: string })?.url ||
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800';

  return (
    <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative h-80">
        <Image
          src={mainPhoto}
          alt={destination.state}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
          <div className="flex-center mb-4 rounded-full bg-white/20 p-4 backdrop-blur-sm transition-transform group-hover:scale-110">
            <MapPin className="h-12 w-12" />
          </div>

          <h3 className="mb-3 text-center text-3xl font-bold">
            {destination.state}
          </h3>

          <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="font-semibold">{destination.count} địa điểm</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
