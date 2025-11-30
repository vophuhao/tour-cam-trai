import { CampsiteList } from '@/components/search/campsite-list';
import { SearchHeader } from '@/components/search/search-header';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

interface Amenity {
  _id: string;
  name: string;
  icon?: string;
  category?: string;
  isActive?: boolean;
}

interface SearchPageProps {
  searchParams: Promise<SearchCampsiteParams>;
}

// Fetch amenities for filters
async function fetchAmenities(): Promise<Amenity[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/amenities`,
      {
        cache: 'force-cache', // Cache amenities as they don't change often
        next: { revalidate: 3600 }, // Revalidate every hour
      },
    );

    if (!response.ok) {
      return [];
    }

    const result: ApiResponse<Amenity[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Failed to fetch amenities:', error);
    return [];
  }
}

// Server Component - fetches data with automatic caching
async function fetchCampsites(
  params: SearchCampsiteParams,
): Promise<PaginatedResponse<Campsite>> {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = String(value);
          }
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();

  const url = `${process.env.NEXT_PUBLIC_API_URL}/campsites${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    cache: 'no-store', // Use 'force-cache' for static, 'no-store' for dynamic
  });

  if (!response.ok) {
    return {
      success: false,
      message: 'Failed to fetch campsites',
      timestamp: new Date().toISOString(),
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  return response.json();
}

// Loading component
function SearchLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
}

// Main Server Component
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  // Parse and normalize search params
  const normalizedParams: SearchCampsiteParams = {
    search: params.search,
    city: params.city,
    state: params.state,
    lat: params.lat ? Number(params.lat) : undefined,
    lng: params.lng ? Number(params.lng) : undefined,
    radius: params.radius ? Number(params.radius) : undefined,
    propertyType: params.propertyType,
    minGuests: params.minGuests ? Number(params.minGuests) : undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    amenities: params.amenities
      ? Array.isArray(params.amenities)
        ? params.amenities
        : params.amenities.split(',')
      : undefined,
    activities: params.activities
      ? Array.isArray(params.activities)
        ? params.activities
        : params.activities.split(',')
      : undefined,
    allowPets: params.allowPets ? params.allowPets === 'true' : undefined,
    isInstantBook: params.isInstantBook
      ? params.isInstantBook === 'true'
      : undefined,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    sort: params.sort,
    page: params.page ? Number(params.page) : 1,
    limit: params.limit ? Number(params.limit) : 20,
  };

  // Fetch data on server with automatic caching
  const [response, amenities] = await Promise.all([
    fetchCampsites(normalizedParams),
    fetchAmenities(),
  ]);
  const campsites = response.data || [];
  const totalResults = response.pagination?.total || 0;

  // Extract search coordinates if available
  const searchCoordinates =
    normalizedParams.lat && normalizedParams.lng
      ? { lat: normalizedParams.lat, lng: normalizedParams.lng }
      : null;

  return (
    <div className="flex flex-col">
      <Suspense fallback={null}>
        <SearchHeader amenities={amenities} />
      </Suspense>

      {/* Main Content with Suspense */}
      <div className="w-full">
        <Suspense fallback={<SearchLoading />}>
          <CampsiteList
            initialCampsites={campsites}
            totalResults={totalResults}
            searchCoordinates={searchCoordinates}
          />
        </Suspense>
      </div>
    </div>
  );
}
