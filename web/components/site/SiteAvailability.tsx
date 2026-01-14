'use client';

import { Badge } from '@/components/ui/badge';
import { getSiteAvailability } from '@/lib/client-actions';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface SiteAvailabilityProps {
  siteId: string;
  checkIn?: string;
  checkOut?: string;
  capacity?: { maxConcurrentBookings?: number };
  className?: string;
}

/**
 * SiteAvailability Component
 *
 * Hiển thị availability status của site với maxConcurrentBookings
 * - Designated (capacity = 1): "Available" / "Booked"
 * - Undesignated (capacity > 1): "X sites left" / "Fully booked"
 */
export function SiteAvailability({
  siteId,
  checkIn,
  checkOut,
  capacity,
  className,
}: SiteAvailabilityProps) {
  const maxConcurrentBookings = capacity?.maxConcurrentBookings ?? 1;
  const { data, isLoading, error } = useQuery({
    queryKey: ['site-availability', siteId, checkIn, checkOut],
    queryFn: async () => {
      const response = await getSiteAvailability(siteId, checkIn, checkOut);
      return response.data as {
        isAvailable: boolean;
        reason?: string;
        blockedDates?: string[];
        spotsLeft?: number;
      };
    },
    enabled: !!siteId,
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) {
    return (
      <Badge variant="outline" className={className}>
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        Checking...
      </Badge>
    );
  }

  if (error || !data) {
    return (
      <Badge variant="destructive" className={className}>
        <AlertCircle className="mr-1 h-3 w-3" />
        Unable to check
      </Badge>
    );
  }

  const isAvailable = data.isAvailable;
  const spotsLeft = data.spotsLeft ?? 0;

  // Designated site (capacity = 1)
  if (maxConcurrentBookings === 1) {
    return isAvailable ? (
      <Badge variant="default" className={`bg-green-600 ${className}`}>
        <CheckCircle className="mr-1 h-3 w-3" />
        Available
      </Badge>
    ) : (
      <Badge variant="secondary" className={className}>
        <AlertCircle className="mr-1 h-3 w-3" />
        Booked
      </Badge>
    );
  }

  // Undesignated site (capacity > 1) - Hipcamp style
  if (spotsLeft === 0) {
    return (
      <Badge variant="secondary" className={className}>
        <AlertCircle className="mr-1 h-3 w-3" />
        Fully booked
      </Badge>
    );
  }

  // Show "X sites left"
  const urgencyColor =
    spotsLeft === 1
      ? 'bg-orange-600'
      : spotsLeft <= 3
        ? 'bg-yellow-600'
        : 'bg-green-600';

  return (
    <Badge variant="default" className={`${urgencyColor} ${className}`}>
      <CheckCircle className="mr-1 h-3 w-3" />
      {spotsLeft} {spotsLeft === 1 ? 'site' : 'sites'} left
    </Badge>
  );
}

/**
 * SiteCapacityBadge Component
 *
 * Hiển thị loại site dựa trên capacity.maxConcurrentBookings
 */
export function SiteCapacityBadge({
  capacity,
  className,
}: {
  capacity: { maxConcurrentBookings: number };
  className?: string;
}) {
  const maxConcurrentBookings = capacity.maxConcurrentBookings;
  if (maxConcurrentBookings === 1) {
    return (
      <Badge variant="outline" className={className}>
        Designated Site
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={className}>
      Undesignated ({maxConcurrentBookings} spots)
    </Badge>
  );
}
