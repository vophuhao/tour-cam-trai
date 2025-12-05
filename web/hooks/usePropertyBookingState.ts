'use client';

import { type DateRangeType } from '@/components/search/date-range-picker';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';

/**
 * Custom hook to manage booking state (dates, guests, pets) synced with URL search params
 *
 * Best Practice: URL as single source of truth
 * - Shareable URLs with pre-filled booking data
 * - Browser back/forward works correctly
 * - State persists on page refresh
 * - No prop drilling between components
 *
 * Usage:
 * const booking = usePropertyBookingState({ initialGuests: 2, initialPets: 0 })
 *
 * // Read state
 * booking.dateRange, booking.guests, booking.pets
 *
 * // Update state (updates URL automatically)
 * booking.setDateRange(newRange)
 * booking.setGuests(4)
 * booking.setPets(1)
 */

interface UsePropertyBookingStateOptions {
  initialGuests?: number;
  initialPets?: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
}

export function usePropertyBookingState(
  options: UsePropertyBookingStateOptions = {},
) {
  const {
    initialGuests = 2,
    initialPets = 0,
    initialCheckIn,
    initialCheckOut,
  } = options;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse date range from URL or initial values
  const dateRange = useMemo<DateRangeType | undefined>(() => {
    const checkIn = searchParams.get('checkIn') || initialCheckIn;
    const checkOut = searchParams.get('checkOut') || initialCheckOut;

    if (checkIn && checkOut) {
      return {
        from: new Date(checkIn),
        to: new Date(checkOut),
      };
    }
    return undefined;
  }, [searchParams, initialCheckIn, initialCheckOut]);

  // Parse guests from URL or initial value
  const guests = useMemo(() => {
    const param = searchParams.get('guests');
    return param ? parseInt(param, 10) : initialGuests;
  }, [searchParams, initialGuests]);

  // Parse pets from URL or initial value
  const pets = useMemo(() => {
    const param = searchParams.get('pets');
    return param ? parseInt(param, 10) : initialPets;
  }, [searchParams, initialPets]);

  // Helper to update URL search params
  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === '') {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        });

        // Use replaceState to avoid adding to history stack for each change
        window.history.replaceState(
          null,
          '',
          `${pathname}?${params.toString()}`,
        );
      });
    },
    [pathname, searchParams],
  );

  // Update date range
  const setDateRange = useCallback(
    (newDateRange: DateRangeType | undefined) => {
      if (newDateRange?.from && newDateRange?.to) {
        updateSearchParams({
          checkIn: newDateRange.from.toISOString().split('T')[0],
          checkOut: newDateRange.to.toISOString().split('T')[0],
        });
      } else {
        updateSearchParams({
          checkIn: null,
          checkOut: null,
        });
      }
    },
    [updateSearchParams],
  );

  // Update guests count
  const setGuests = useCallback(
    (newGuests: number) => {
      updateSearchParams({
        guests: newGuests > 0 ? newGuests.toString() : null,
      });
    },
    [updateSearchParams],
  );

  // Update pets count
  const setPets = useCallback(
    (newPets: number) => {
      updateSearchParams({
        pets: newPets > 0 ? newPets.toString() : null,
      });
    },
    [updateSearchParams],
  );

  return {
    // State
    dateRange,
    guests,
    pets,

    // Setters
    setDateRange,
    setGuests,
    setPets,

    // Helpers
    isPending,
  };
}
