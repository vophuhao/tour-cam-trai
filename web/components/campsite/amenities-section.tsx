'use client';

import { CheckCircle2 } from 'lucide-react';

interface AmenitiesSectionProps {
  amenities: Array<{
    _id: string;
    name: string;
    icon?: string;
    description?: string;
  }>;
}

export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" id="amenities">
      <h2 className="text-2xl font-bold">Tiện nghi</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map(amenity => (
          <div
            key={amenity._id}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            {amenity.icon ? (
              <span className="text-2xl">{amenity.icon}</span>
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{amenity.name}</p>
              {amenity.description && (
                <p className="text-muted-foreground text-xs">
                  {amenity.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
