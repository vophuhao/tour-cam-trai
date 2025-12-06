'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Property } from '@/types/property-site';
import { MapPin, Mountain, Store, Trees, Utensils } from 'lucide-react';

interface NearbyAttractionsSectionProps {
  attractions: Property['nearbyAttractions'];
}

const attractionIcons: Record<string, React.ReactNode> = {
  national_park: <Trees className="h-5 w-5" />,
  lake: <Mountain className="h-5 w-5" />,
  town: <Store className="h-5 w-5" />,
  restaurant: <Utensils className="h-5 w-5" />,
};

const attractionTypeLabels: Record<string, string> = {
  national_park: 'Công viên quốc gia',
  lake: 'Hồ',
  town: 'Thị trấn',
  restaurant: 'Nhà hàng',
  beach: 'Bãi biển',
  hiking_trail: 'Đường đi bộ đường dài',
  viewpoint: 'Điểm ngắm cảnh',
};

export function NearbyAttractionsSection({
  attractions,
}: NearbyAttractionsSectionProps) {
  if (!attractions || attractions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Địa điểm gần đây</h2>
        <p className="text-muted-foreground text-sm">
          Những địa điểm thú vị xung quanh khu vực
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {attractions
          .sort((a, b) => a.distance - b.distance)
          .map((attraction, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-muted-foreground mt-1">
                    {attractionIcons[attraction.type] || (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{attraction.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {attraction.distance} km
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {attractionTypeLabels[attraction.type] || attraction.type}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
