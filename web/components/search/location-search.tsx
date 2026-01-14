'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Clock, Loader2, MapPin, Navigation, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface LocationSearchProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  onNearbyClick?: () => void;
  onClose?: () => void;
  showDropdown?: boolean;
  showInlineResults?: boolean;
  className?: string;
  onDateRangeSelect?: (checkIn: string, checkOut: string) => void;
  onGuestsSelect?: (guests: number) => void;
}

interface RecentSearch {
  location: string;
  coordinates?: { lat: number; lng: number };
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface MapboxGeocodeResponse {
  type: string;
  features: MapboxFeature[];
}

const MAX_RECENT_SEARCHES = 5;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export function LocationSearch({
  value,
  onChange,
  placeholder = 'Khu vực bản đồ',
  onNearbyClick,
  onClose,
  showDropdown = true,
  showInlineResults = true,
  className,
  onDateRangeSelect,
  onGuestsSelect,
}: LocationSearchProps) {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Fetch suggestions from Mapbox Geocoding API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token not found');
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&language=vi&country=VN&types=place,locality,neighborhood,address`;

      const response = await fetch(url);
      const data: MapboxGeocodeResponse = await response.json();

      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced version of fetchSuggestions
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedFetch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    },
    [fetchSuggestions],
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    debouncedFetch(newValue);
  };

  const handleSelectSuggestion = (feature: MapboxFeature) => {
    const coords = {
      lng: feature.center[0],
      lat: feature.center[1],
    };

    // Extract city name from place_name (e.g., "Đà Lạt, Lâm Đồng, Vietnam" -> "Đà Lạt")
    // Use feature.text which is the primary name, not the full place_name
    const cityName = feature.text || feature.place_name.split(',')[0].trim();

    onChange(cityName, coords);
    setSuggestions([]);
    setShowSuggestions(false);

    // Save only city name to prevent duplicates in recent searches
    saveToRecentSearches(cityName, coords);

    // Close popover if callback provided
    onClose?.();
  };

  const handleSelectRecent = (search: RecentSearch) => {
    onChange(search.location, search.coordinates);

    // Auto-fill dates if available
    if (search.checkIn && search.checkOut && onDateRangeSelect) {
      onDateRangeSelect(search.checkIn, search.checkOut);
    }

    // Auto-fill guests if available
    if (search.guests && onGuestsSelect) {
      onGuestsSelect(search.guests);
    }

    setShowSuggestions(false);
    onClose?.();
  };

  const handleNearby = () => {
    onChange('Nearby');
    onNearbyClick?.();
    setShowSuggestions(false);
    onClose?.();
  };

  const saveToRecentSearches = (
    location: string,
    coordinates?: { lat: number; lng: number },
    checkIn?: string,
    checkOut?: string,
    guests?: number,
  ) => {
    if (
      !location.trim() ||
      location === 'Khu vực bản đồ' ||
      location === 'Nearby'
    )
      return;

    const newSearch: RecentSearch = {
      location,
      coordinates,
      checkIn,
      checkOut,
      guests,
    };
    const updated = [
      newSearch,
      ...recentSearches.filter(s => s.location !== location),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  const getPlaceIcon = (placeTypes: string[]) => {
    if (placeTypes.includes('place') || placeTypes.includes('locality')) {
      return '🏙️';
    }
    if (placeTypes.includes('neighborhood')) {
      return '🏘️';
    }
    if (placeTypes.includes('address')) {
      return '📍';
    }
    return '📌';
  };

  return (
    <div className={cn('relative', className)}>
      {/* Input with search icon - only when showInlineResults is true */}
      {showInlineResults && (
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            className="pr-9 pl-9"
          />
          {isLoading && (
            <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>
      )}

      {/* Inline Suggestions - Only when showDropdown is false (inside popover) */}
      {!showDropdown &&
        showInlineResults &&
        (suggestions.length > 0 ||
          recentSearches.length > 0 ||
          !value.trim()) && (
          <div className="mt-3 max-h-[300px] space-y-1 overflow-y-auto">
            {/* Nearby - Only show when input is empty */}
            {!value.trim() && (
              <>
                <button
                  onClick={handleNearby}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-100"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <MapPin className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Vị trí hiện tại
                    </div>
                  </div>
                </button>
                {recentSearches.length > 0 && (
                  <div className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Tìm kiếm gần đây
                  </div>
                )}
              </>
            )}

            {/* Mapbox Suggestions */}
            {suggestions.length > 0 && (
              <>
                <div className="px-2 pb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Gợi ý
                </div>
                {suggestions.map(feature => (
                  <button
                    key={feature.id}
                    onClick={() => handleSelectSuggestion(feature)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-100"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      <span className="text-lg">
                        {getPlaceIcon(feature.place_type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-gray-900">
                        {feature.text}
                      </div>
                      <div className="truncate text-sm text-gray-500">
                        {feature.place_name}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Recent Searches - Only when input has value */}
            {recentSearches.length > 0 && value.trim() && (
              <>
                <div className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Tìm kiếm gần đây
                </div>
                {recentSearches.map((search, index) => {
                  const hasDateInfo = search.checkIn && search.checkOut;
                  const dateText = hasDateInfo
                    ? `${new Date(search.checkIn!).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })} - ${new Date(search.checkOut!).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}`
                    : null;
                  const guestText = search.guests
                    ? `${search.guests} khách`
                    : null;
                  const detailText = [dateText, guestText]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectRecent(search)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-100"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                        <Clock className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-900">
                          {search.location}
                        </div>
                        {detailText && (
                          <div className="truncate text-sm text-gray-500">
                            {detailText}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* Recent Searches - Show without header when input is empty */}
            {recentSearches.length > 0 && !value.trim() && (
              <>
                {recentSearches.map((search, index) => {
                  const hasDateInfo = search.checkIn && search.checkOut;
                  const dateText = hasDateInfo
                    ? `${new Date(search.checkIn!).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })} - ${new Date(search.checkOut!).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}`
                    : null;
                  const guestText = search.guests
                    ? `${search.guests} khách`
                    : null;
                  const detailText = [dateText, guestText]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectRecent(search)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-100"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                        <Clock className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-900">
                          {search.location}
                        </div>
                        {detailText && (
                          <div className="truncate text-sm text-gray-500">
                            {detailText}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* No results */}
            {suggestions.length === 0 &&
              recentSearches.length === 0 &&
              !isLoading &&
              value.length >= 2 && (
                <div className="px-3 py-8 text-center text-sm text-gray-500">
                  Không tìm thấy địa điểm phù hợp
                </div>
              )}

            {/* Empty state */}
            {suggestions.length === 0 &&
              recentSearches.length === 0 &&
              value.length < 2 && (
                <div className="px-3 py-8 text-center text-sm text-gray-500">
                  Nhập ít nhất 2 ký tự để tìm kiếm
                </div>
              )}
          </div>
        )}

      {/* Suggestions Dropdown - Only when showDropdown is true (standalone) */}
      {showDropdown && showSuggestions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowSuggestions(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 left-0 z-20 mt-2 max-h-[400px] overflow-y-auto rounded-lg border bg-white shadow-lg">
            {/* Nearby Option */}
            <button
              onClick={handleNearby}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Navigation className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">Vị trí hiện tại</div>
                <div className="text-sm text-gray-500">
                  Sử dụng GPS để tìm địa điểm gần bạn
                </div>
              </div>
            </button>

            {/* Mapbox Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-t">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500">
                  Gợi ý
                </div>
                {suggestions.map(feature => (
                  <button
                    key={feature.id}
                    onClick={() => handleSelectSuggestion(feature)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <span className="text-xl">
                        {getPlaceIcon(feature.place_type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">
                        {feature.text}
                      </div>
                      <div className="truncate text-sm text-gray-500">
                        {feature.place_name}
                      </div>
                    </div>
                    <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="border-t">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500">
                  Tìm kiếm gần đây
                </div>
                {recentSearches.map((search, index) => {
                  const hasDateInfo = search.checkIn && search.checkOut;
                  const dateText = hasDateInfo
                    ? `${new Date(search.checkIn!).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })} - ${new Date(search.checkOut!).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}`
                    : null;
                  const guestText = search.guests
                    ? `${search.guests} khách`
                    : null;
                  const detailText = [dateText, guestText]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectRecent(search)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Clock className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{search.location}</div>
                        {detailText && (
                          <div className="text-sm text-gray-500">
                            {detailText}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No results message */}
            {suggestions.length === 0 &&
              recentSearches.length === 0 &&
              !isLoading &&
              value.length >= 2 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  Không tìm thấy địa điểm phù hợp
                </div>
              )}

            {/* Empty state */}
            {suggestions.length === 0 &&
              recentSearches.length === 0 &&
              value.length < 2 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  Nhập ít nhất 2 ký tự để tìm kiếm
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
}

// Export function to save search when user actually performs a search
export function saveSearchToHistory(
  location: string,
  coordinates?: { lat: number; lng: number },
  checkIn?: string,
  checkOut?: string,
  guests?: number,
) {
  if (
    !location.trim() ||
    location === 'Khu vực bản đồ' ||
    location === 'Nearby'
  )
    return;

  try {
    const stored = localStorage.getItem('recentSearches');
    const existing: RecentSearch[] = stored ? JSON.parse(stored) : [];

    const newSearch: RecentSearch = {
      location,
      coordinates,
      checkIn,
      checkOut,
      guests,
    };
    const updated = [
      newSearch,
      ...existing.filter(s => s.location !== location),
    ].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving search:', error);
  }
}
