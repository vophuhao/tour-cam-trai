'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';

interface AmenitiesSectionProps {
  amenities: Array<{
    _id: string;
    name: string;
    icon?: string;
  }>;
  activities: Array<{
    _id: string;
    name: string;
    icon?: string;
  }>;
}

export function AmenitiesSection({
  amenities,
  activities,
}: AmenitiesSectionProps) {
  return (
    <div className="space-y-6" id="amenities">
      <h2 className="text-2xl font-bold">Tiện nghi & Hoạt động</h2>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tiện nghi</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map(amenity => (
              <div
                key={amenity._id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {amenity.icon ? (
                  <span className="text-2xl">{amenity.icon}</span>
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <span className="text-sm font-medium">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {amenities.length > 0 && activities.length > 0 && <Separator />}

      {/* Activities */}
      {activities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hoạt động</h3>
          <div className="flex flex-wrap gap-2">
            {activities.map(activity => (
              <Badge key={activity._id} variant="secondary" className="text-sm">
                {activity.icon && <span className="mr-1">{activity.icon}</span>}
                {activity.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
