'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Property } from '@/types/property-site';
import { CheckCircle2 } from 'lucide-react';

interface SharedAmenitiesSectionProps {
  sharedAmenities: Property['sharedAmenities'];
  activities: Property['activities'];
}

export function SharedAmenitiesSection({
  sharedAmenities,
  activities,
}: SharedAmenitiesSectionProps) {
  // Extract amenities that are available
  const availableAmenities = [];

  if (sharedAmenities.toilets && sharedAmenities.toilets.type !== 'none') {
    availableAmenities.push({
      name: `Nhà vệ sinh ${sharedAmenities.toilets.type}`,
      icon: '🚻',
      detail: `${sharedAmenities.toilets.count} nhà vệ sinh`,
    });
  }

  if (sharedAmenities.showers && sharedAmenities.showers.type !== 'none') {
    availableAmenities.push({
      name: `Vòi sen ${sharedAmenities.showers.type}`,
      icon: '🚿',
      detail: `${sharedAmenities.showers.count} vòi sen`,
    });
  }

  if (sharedAmenities.potableWater) {
    availableAmenities.push({
      name: 'Nước uống',
      icon: '💧',
      detail: `Nguồn: ${sharedAmenities.waterSource || 'Không rõ'}`,
    });
  }

  if (sharedAmenities.wifi) {
    availableAmenities.push({
      name: 'WiFi',
      icon: '📶',
      detail: `Tín hiệu di động: ${sharedAmenities.cellService || 'Không rõ'}`,
    });
  }

  if (sharedAmenities.electricityAvailable) {
    availableAmenities.push({
      name: 'Điện',
      icon: '⚡',
    });
  }

  if (sharedAmenities.parkingType) {
    availableAmenities.push({
      name: 'Bãi đỗ xe',
      icon: '🅿️',
      detail:
        sharedAmenities.parkingType === 'drive_in'
          ? 'Lái xe vào'
          : sharedAmenities.parkingType === 'walk_in'
            ? 'Đi bộ vào'
            : 'Gần đó',
    });
  }

  if (sharedAmenities.laundry) {
    availableAmenities.push({
      name: 'Giặt ủi',
      icon: '🧺',
    });
  }

  // Convert activities to array if needed
  const activitiesArray = Array.isArray(activities) ? activities : [];

  return (
    <div className="space-y-6" id="amenities">
      <h2 className="text-2xl font-bold">Tiện nghi chung & Hoạt động</h2>

      {/* Shared Amenities */}
      {availableAmenities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tiện nghi chung của khu đất</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableAmenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                {amenity.icon ? (
                  <span className="text-2xl">{amenity.icon}</span>
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{amenity.name}</p>
                  {amenity.detail && (
                    <p className="text-muted-foreground text-xs">
                      {amenity.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableAmenities.length > 0 && activitiesArray.length > 0 && (
        <Separator />
      )}

      {/* Activities */}
      {activitiesArray.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hoạt động có thể tham gia</h3>
          <div className="flex flex-wrap gap-2">
            {activitiesArray.map(activity => {
              const activityData: {
                _id: string;
                name?: string;
                icon?: string;
              } =
                typeof activity === 'object'
                  ? (activity as { _id: string; name?: string; icon?: string })
                  : { _id: activity as string, name: activity as string };

              return (
                <Badge
                  key={activityData._id}
                  variant="secondary"
                  className="text-sm"
                >
                  {activityData.icon && (
                    <span className="mr-1">{activityData.icon}</span>
                  )}
                  {activityData.name || activityData._id}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
