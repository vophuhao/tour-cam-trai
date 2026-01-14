/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Navigation, 
  Search, 
  X, 
  Loader2, 
  Navigation2, 
  Target 
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Lazy load Map component
const MapPreview = dynamic(() => import("@/components/MapPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-lg border bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
});

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapboxFeature {
  id: string;
  place_type: string[];
  place_name: string;
  text: string;
  center: [number, number];
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface PropertyLocationProps {
  data: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat]
    };
    directions?: string;
    parkingInstructions?: string;
  };
  onChange: (data: any) => void;
}

export function PropertyLocation({ data, onChange }: PropertyLocationProps) {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocodingManual, setIsGeocodingManual] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoGeocodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current coordinates
  const lng = data.coordinates?.coordinates?.[0] || 0;
  const lat = data.coordinates?.coordinates?.[1] || 0;

  // Auto-geocode when address/city/state changes
  useEffect(() => {
    if (!data.address || !data.city || !data.state) return;

    if (autoGeocodeDebounceRef.current) {
      clearTimeout(autoGeocodeDebounceRef.current);
    }

    autoGeocodeDebounceRef.current = setTimeout(() => {
      handleAutoGeocode();
    }, 1000);

    return () => {
      if (autoGeocodeDebounceRef.current) {
        clearTimeout(autoGeocodeDebounceRef.current);
      }
    };
  }, [data.address, data.city, data.state]);

  // Auto-geocode function
  const handleAutoGeocode = async () => {
    if (!data.address || !data.city || !data.state || isGeocodingManual) return;

    const fullAddress = `${data.address}, ${data.city}, ${data.state}, Vietnam`;

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        fullAddress
      )}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=vi&country=VN&types=address,poi`;

      const response = await fetch(url);
      const apiData = await response.json();

      if (apiData.features && apiData.features.length > 0) {
        const feature = apiData.features[0];
        const newLng = feature.center[0];
        const newLat = feature.center[1];

        // Only update if significantly different
        const distance = Math.sqrt(
          Math.pow(newLng - lng, 2) + Math.pow(newLat - lat, 2)
        );

        if (distance > 0.001) {
          onChange({
            coordinates: {
              type: "Point",
              coordinates: [newLng, newLat],
            },
          });
        }
      }
    } catch (error) {
      console.error("Auto-geocoding error:", error);
    }
  };

  // Manual geocode button
  const handleManualGeocode = async () => {
    if (!data.address || !data.city || !data.state) {
      toast.error("Vui lòng nhập đủ địa chỉ, thành phố và tỉnh");
      return;
    }

    const fullAddress = `${data.address}, ${data.city}, ${data.state}, Vietnam`;
    setIsGeocodingManual(true);

    try {
      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        fullAddress
      )}.json?access_token=${MAPBOX_TOKEN}&limit=5&language=vi&country=VN&types=address,poi`;

      let response = await fetch(url);
      let apiData = await response.json();

      if (!apiData.features || apiData.features.length === 0) {
        url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          fullAddress
        )}.json?access_token=${MAPBOX_TOKEN}&limit=5&language=vi&country=VN`;

        response = await fetch(url);
        apiData = await response.json();
      }

      if (apiData.features && apiData.features.length > 0) {
        const feature = apiData.features[0];
        onChange({
          coordinates: {
            type: "Point",
            coordinates: [feature.center[0], feature.center[1]],
          },
        });

        toast.success(`Đã cập nhật tọa độ!\n📍 ${feature.place_name}`, {
          duration: 4000,
        });
      } else {
        toast.error("Không tìm thấy tọa độ cho địa chỉ này");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Lỗi khi tìm tọa độ");
    } finally {
      setIsGeocodingManual(false);
    }
  };

  // Fetch Mapbox suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (!MAPBOX_TOKEN) {
      console.error("Mapbox token not configured");
      toast.error("Chưa cấu hình Mapbox token");
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&language=vi&country=VN&types=place,locality,neighborhood,address,poi`;

      const response = await fetch(url);
      const apiData = await response.json();

      setSuggestions(apiData.features || []);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced fetch
  const debouncedFetch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    },
    [fetchSuggestions]
  );

  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressQuery(value);
    debouncedFetch(value);
    setShowSuggestions(true);
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (feature: MapboxFeature) => {
    const address = feature.text;
    let city = "";
    let state = "";

    if (feature.context) {
      const placeContext = feature.context.find(
        (c) => c.id.startsWith("place") || c.id.startsWith("locality")
      );
      const regionContext = feature.context.find((c) => c.id.startsWith("region"));
      const districtContext = feature.context.find((c) => c.id.startsWith("district"));

      city = placeContext?.text || districtContext?.text || feature.text;
      state = regionContext?.text || "";
    }

    if (!city && feature.place_type.includes("place")) {
      city = feature.text;
    }

    onChange({
      address,
      city,
      state,
      country: "Vietnam",
      coordinates: {
        type: "Point",
        coordinates: [feature.center[0], feature.center[1]],
      },
    });

    setAddressQuery("");
    setSuggestions([]);
    setShowSuggestions(false);

    toast.success("Đã tự động điền địa chỉ và tọa độ!");
  };

  // Get current location from browser
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLng = position.coords.longitude;
          const newLat = position.coords.latitude;

          onChange({
            coordinates: {
              type: "Point",
              coordinates: [newLng, newLat],
            },
          });

          // Reverse geocode to get address
          await reverseGeocode(newLat, newLng);
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Không thể lấy vị trí hiện tại");
          setLoadingLocation(false);
        }
      );
    } else {
      toast.error("Trình duyệt không hỗ trợ geolocation");
      setLoadingLocation(false);
    }
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=vi&country=VN`;

      const response = await fetch(url);
      const apiData = await response.json();

      if (apiData.features && apiData.features.length > 0) {
        const feature = apiData.features[0];

        const address = feature.text || "";
        let city = "";
        let state = "";

        if (feature.context) {
          const placeContext = feature.context.find(
            (c: any) => c.id.startsWith("place") || c.id.startsWith("locality")
          );
          const regionContext = feature.context.find((c: any) => c.id.startsWith("region"));

          city = placeContext?.text || "";
          state = regionContext?.text || "";
        }

        onChange({
          address: address || data.address,
          city: city || data.city,
          state: state || data.state,
        });

        toast.success("Đã tự động điền địa chỉ từ tọa độ!");
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  // Handle map location change
  const handleMapLocationChange = (newLat: number, newLng: number) => {
    onChange({
      coordinates: {
        type: "Point",
        coordinates: [newLng, newLat],
      },
    });
    toast.success(`Đã cập nhật tọa độ: ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
  };

  const getPlaceIcon = (placeTypes: string[]) => {
    if (placeTypes.includes("place") || placeTypes.includes("locality")) return "🏙️";
    if (placeTypes.includes("neighborhood")) return "🏘️";
    if (placeTypes.includes("address")) return "📍";
    if (placeTypes.includes("poi")) return "🏢";
    return "📌";
  };

  const hasValidCoordinates = lng !== 0 && lat !== 0 && !isNaN(lng) && !isNaN(lat);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ Property</h3>
        <p className="text-sm text-gray-500 mb-6">
          Cung cấp thông tin vị trí chính xác của property
        </p>
      </div>

      <div className="space-y-6 rounded-lg border p-4">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold">Vị trí</h3>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lấy...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-4 w-4" />
                  Vị trí hiện tại
                </>
              )}
            </Button>
            {data.address && data.city && data.state && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleManualGeocode}
                disabled={isGeocodingManual}
              >
                {isGeocodingManual ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tìm...
                  </>
                ) : (
                  <>
                    <Navigation2 className="mr-2 h-4 w-4" />
                    Cập nhật tọa độ
                  </>
                )}
              </Button>
            )}
            {hasValidCoordinates && (
              <Button
                type="button"
                variant={showInteractiveMap ? "default" : "outline"}
                size="sm"
                onClick={() => setShowInteractiveMap(!showInteractiveMap)}
              >
                <Target className="mr-2 h-4 w-4" />
                {showInteractiveMap ? "Đang chọn vị trí" : "Chọn trên bản đồ"}
              </Button>
            )}
          </div>
        </div>

        {/* Address Search */}
        <div className="relative">
          <Label className="mb-2 block">Tìm kiếm địa chỉ nhanh</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập địa chỉ để tìm kiếm..."
              value={addressQuery}
              onChange={handleAddressChange}
              onFocus={() => addressQuery.length >= 2 && setShowSuggestions(true)}
              className="pl-9 pr-10"
            />
            {addressQuery && (
              <button
                type="button"
                onClick={() => {
                  setAddressQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSuggestions(false)}
              />
              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[300px] overflow-y-auto rounded-lg border bg-white shadow-lg">
                {suggestions.map((feature) => (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(feature)}
                    className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <span className="text-xl">{getPlaceIcon(feature.place_type)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-gray-900">
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
            </>
          )}

          {/* No results */}
          {showSuggestions &&
            suggestions.length === 0 &&
            !isLoading &&
            addressQuery.length >= 2 && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSuggestions(false)}
                />
                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-lg border bg-white p-4 text-center text-sm text-gray-500 shadow-lg">
                  Không tìm thấy địa điểm phù hợp
                </div>
              </>
            )}
        </div>

        {/* Interactive Map */}
        {showInteractiveMap && hasValidCoordinates && (
          <div className="space-y-2 rounded-lg border-2 border-emerald-500 bg-emerald-50/50 p-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-emerald-900">
                Chọn vị trí chính xác trên bản đồ
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await reverseGeocode(lat, lng);
                  setShowInteractiveMap(false);
                }}
              >
                Xác nhận vị trí
              </Button>
            </div>
            <MapPreview
              lat={lat}
              lng={lng}
              zoom={18}
              height={500}
              interactive={true}
              onLocationChange={handleMapLocationChange}
            />
            <p className="text-sm text-emerald-700">
              📍 Tọa độ hiện tại: {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Manual Input Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="address">
              Địa chỉ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Số nhà, tên đường"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">
                Thành phố <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="VD: Đà Lạt"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                value={data.state}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="VD: Lâm Đồng"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Quốc gia</Label>
              <Input
                id="country"
                value={data.country}
                onChange={(e) => onChange({ country: e.target.value })}
                placeholder="Vietnam"
                className="mt-1"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Mã bưu điện</Label>
              <Input
                id="zipCode"
                value={data.zipCode}
                onChange={(e) => onChange({ zipCode: e.target.value })}
                placeholder="670000"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Tọa độ GPS</Label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lng" className="text-sm">
                  Kinh độ (Longitude)
                </Label>
                <Input
                  id="lng"
                  type="number"
                  value={lng || ""}
                  step="0.000001"
                  placeholder="108.4583"
                  className="mt-1 bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="lat" className="text-sm">
                  Vĩ độ (Latitude)
                </Label>
                <Input
                  id="lat"
                  type="number"
                  value={lat || ""}
                  step="0.000001"
                  placeholder="11.9404"
                  className="mt-1 bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map Preview (read-only) */}
        {!showInteractiveMap && hasValidCoordinates && (
          <div className="space-y-2">
            <Label>Xem trước bản đồ</Label>
            <MapPreview lat={lat} lng={lng} zoom={15} height={300} />
            <p className="text-sm text-gray-500">
              📍 Vị trí: {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Additional Instructions */}
        <div>
          <Label htmlFor="directions">Hướng dẫn đường đi</Label>
          <Textarea
            id="directions"
            value={data.directions}
            onChange={(e) => onChange({ directions: e.target.value })}
            placeholder="Hướng dẫn chi tiết cách đến property từ các địa điểm chính..."
            rows={4}
            maxLength={1000}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            {data.directions?.length || 0}/1000 ký tự
          </p>
        </div>

        <div>
          <Label htmlFor="parkingInstructions">Hướng dẫn đậu xe</Label>
          <Textarea
            id="parkingInstructions"
            value={data.parkingInstructions}
            onChange={(e) => onChange({ parkingInstructions: e.target.value })}
            placeholder="Hướng dẫn nơi đậu xe, loại xe được phép, vị trí bãi đỗ..."
            rows={3}
            maxLength={500}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            {data.parkingInstructions?.length || 0}/500 ký tự
          </p>
        </div>
      </div>
    </div>
  );
}