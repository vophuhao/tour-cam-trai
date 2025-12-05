'use client';

import type { Property } from '@/types/property-site';
import { CheckCircle2 } from 'lucide-react';

interface Amenity {
  _id: string;
  name: string;
  icon?: string;
  category?: string;
  description?: string;
}

interface PropertyAmenitiesSectionProps {
  amenities: Property['amenities']; // string[] | Amenity[]
}

export function SharedAmenitiesSection({
  amenities,
}: PropertyAmenitiesSectionProps) {
  // Convert to array format
  const amenitiesArray = Array.isArray(amenities) ? amenities : [];

  if (amenitiesArray.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" id="amenities">
      <h2 className="text-2xl font-bold">Tiện nghi của khu đất</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {amenitiesArray.map(amenity => {
          // Handle both string IDs and populated Amenity objects
          const amenityData: Amenity =
            typeof amenity === 'object'
              ? (amenity as Amenity)
              : { _id: amenity as string, name: amenity as string };

          return (
            <div
              key={amenityData._id}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              {amenityData.icon ? (
                <span className="text-2xl">{amenityData.icon}</span>
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{amenityData.name}</p>
                {amenityData.description && (
                  <p className="text-muted-foreground text-xs">
                    {amenityData.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
