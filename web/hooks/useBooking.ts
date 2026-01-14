import { getBooking, getUserBookings } from '@/lib/client-actions';
import type { Booking } from '@/types/property-site';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch a single booking by ID
 */
export function useBooking(bookingId: string | null) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const response = await getBooking(bookingId);
      return response.data as Booking;
    },
    enabled: !!bookingId,
  });
}

/**
 * Hook to fetch user's bookings with filters
 */
export function useUserBookings(params?: {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  role?: 'guest' | 'host';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['user-bookings', params],
    queryFn: async () => {
      const response = await getUserBookings(params);
      return response.data as Booking[];
    },
  });
}
