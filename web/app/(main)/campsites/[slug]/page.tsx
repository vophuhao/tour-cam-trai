import { AmenitiesSection } from '@/components/campsite/amenities-section';
import { BookingCard } from '@/components/campsite/booking-card';
import { CampsiteGallery } from '@/components/campsite/campsite-gallery';
import { CampsiteOverview } from '@/components/campsite/campsite-overview';
import { LocationSection } from '@/components/campsite/location-section';
import { ReviewsSection } from '@/components/campsite/reviews-section';
import { SimilarCampsites } from '@/components/campsite/similar-campsites';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';

interface CampsitePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    adults?: string;
    children?: string;
    pets?: string;
    checkIn?: string;
    checkOut?: string;
  }>;
}

async function fetchCampsite(slug: string): Promise<Campsite | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/campsites/${slug}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return null;
    }

    const result: ApiResponse<Campsite> = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Failed to fetch campsite:', error);
    return null;
  }
}

async function fetchSimilarCampsites(
  campsiteId: string,
  city: string,
): Promise<Campsite[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/campsites?city=${encodeURIComponent(city)}&limit=4`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return [];
    }

    const result: PaginatedResponse<Campsite> = await response.json();
    // Filter out current campsite
    return (result.data || []).filter(site => site._id !== campsiteId);
  } catch (error) {
    console.error('Failed to fetch similar campsites:', error);
    return [];
  }
}

export default async function CampsitePage({
  params,
  searchParams,
}: CampsitePageProps) {
  const { slug } = await params;
  const search = await searchParams;

  const campsite = await fetchCampsite(slug);

  if (!campsite) {
    notFound();
  }

  const similarCampsites = await fetchSimilarCampsites(
    campsite._id,
    campsite.location.city,
  );

  // Parse search params for booking
  const adults = parseInt(search.adults || '2');
  const children = parseInt(search.children || '0');
  const pets = parseInt(search.pets || '0');

  return (
    <div className="bg-background container mx-auto">
      {/* Gallery */}
      <CampsiteGallery images={campsite.images} name={campsite.name} />

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <CampsiteOverview campsite={campsite} />

            <Separator className="my-8" />

            {/* Amenities */}
            <AmenitiesSection amenities={campsite.amenities} />

            <Separator className="my-8" />

            {/* Reviews */}
            <ReviewsSection
              campsiteId={campsite._id}
              rating={campsite.rating}
            />

            <Separator className="my-8" />

            {/* Location */}
            <LocationSection location={campsite.location} />
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingCard
                campsite={campsite}
                initialGuests={adults}
                initialChildren={children}
                initialPets={pets}
                checkIn={search.checkIn}
                checkOut={search.checkOut}
              />
            </div>
          </div>
        </div>

        {/* Similar Campsites */}
        {similarCampsites.length > 0 && (
          <>
            <Separator className="my-12" />
            <SimilarCampsites campsites={similarCampsites} />
          </>
        )}
      </div>
    </div>
  );
}
