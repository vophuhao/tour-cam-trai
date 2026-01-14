'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Settings2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

interface Amenity {
  _id: string;
  name: string;
  category?: string;
  icon?: string;
}

export function AmenitiesFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get selected amenities from URL
  const selectedAmenityIds = searchParams.getAll('amenities');

  // Temporary state for pending amenity changes
  const [pendingAmenityIds, setPendingAmenityIds] = useState<string[]>([]);

  // Sync pending state when popover opens
  const handleAmenitiesOpenChange = (open: boolean) => {
    setAmenitiesOpen(open);
    if (open) {
      setPendingAmenityIds(selectedAmenityIds);
    }
  };

  // Fetch amenities from backend
  useEffect(() => {
    const fetchAmenities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/amenities`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch amenities');
        }
        const result = await response.json();
        setAmenities(result.data || []);
      } catch (err) {
        console.error('Error fetching amenities:', err);
        setError('Không thể tải danh sách tiện ích');
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  const createQueryString = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        // Remove existing values for this key
        params.delete(key);

        if (value === null || value === '') {
          return;
        }

        if (Array.isArray(value)) {
          // Add multiple values for array params
          value.forEach(v => v && params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      return params.toString();
    },
    [searchParams],
  );

  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    startTransition(() => {
      const queryString = createQueryString(updates);
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    });
  };

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = pendingAmenityIds.includes(amenityId)
      ? pendingAmenityIds.filter(id => id !== amenityId)
      : [...pendingAmenityIds, amenityId];
    setPendingAmenityIds(newAmenities);
  };

  const handleApplyAmenities = () => {
    updateFilters({
      amenities: pendingAmenityIds.length > 0 ? pendingAmenityIds : null,
    });
    setAmenitiesOpen(false);
  };

  // Group amenities by category
  const groupedAmenities = amenities.reduce(
    (acc, amenity) => {
      const category = amenity.category || 'Khác';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(amenity);
      return acc;
    },
    {} as Record<string, Amenity[]>,
  );

  return (
    <Popover open={amenitiesOpen} onOpenChange={handleAmenitiesOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={selectedAmenityIds.length > 0 ? 'default' : 'outline'}
          className="h-9 cursor-pointer border-gray-300"
          disabled={isPending || loading}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Tiện ích
          {selectedAmenityIds.length > 0 && (
            <span className="text-primary ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs">
              {selectedAmenityIds.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-4" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold">Tiện ích</h4>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          {!loading && !error && amenities.length === 0 && (
            <p className="text-sm text-gray-500">Không có tiện ích nào</p>
          )}

          {!loading && !error && amenities.length > 0 && (
            <>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {Object.entries(groupedAmenities).map(([category, items]) => (
                    <div key={category}>
                      <h5 className="mb-2 text-sm font-medium text-gray-700">
                        {category}
                      </h5>
                      <div className="space-y-2">
                        {items.map(amenity => (
                          <div
                            key={amenity._id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`amenity-${amenity._id}`}
                              checked={pendingAmenityIds.includes(amenity._id)}
                              onCheckedChange={() =>
                                handleAmenityToggle(amenity._id)
                              }
                            />
                            <label
                              htmlFor={`amenity-${amenity._id}`}
                              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {amenity.icon && (
                                <span className="mr-1">{amenity.icon}</span>
                              )}
                              {amenity.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2 border-t pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setPendingAmenityIds([]);
                  }}
                >
                  Xóa
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleApplyAmenities}
                >
                  Áp dụng
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
