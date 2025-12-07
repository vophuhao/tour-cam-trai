/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Target, Copy } from "lucide-react";

const MapPreview: any = dynamic(() => import("./site-map-review"), { ssr: false });

interface PropertyLocation {
  coordinates?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface ExistingSite {
  _id: string;
  name: string;
  siteLocation?: {
    coordinates?: {
      type: "Point";
      coordinates: [number, number];
    };
    mapPinLabel?: string;
    relativeDescription?: string;
  };
}

interface SiteLocationProps {
  data: {
    coordinates?: { type: "Point"; coordinates: [number, number] } | undefined;
    mapPinLabel?: string;
    relativeDescription?: string;
  } | undefined;
  propertyLocation?: PropertyLocation | undefined;
  onChange: (data: any) => void;
  maxDistanceKm?: number;
  currentSiteId?: string; // ID của site đang edit (nếu có)
  existingSites?: ExistingSite[]; // Danh sách các site khác trong property
}

const EARTH_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_KM * c;
}

function toFixedNum(v: number | undefined) {
  return v === undefined || isNaN(v) ? "—" : v.toFixed(6);
}

export function SiteLocation({
  data,
  propertyLocation,
  onChange,
  maxDistanceKm = 10,
  currentSiteId,
  existingSites = [],
}: SiteLocationProps) {
  const propCoords = propertyLocation?.coordinates;
  const propLng = propCoords?.coordinates[0];
  const propLat = propCoords?.coordinates[1];

  const initialLng =
    data?.coordinates?.coordinates?.[0] ?? (propLng ?? undefined);
  const initialLat =
    data?.coordinates?.coordinates?.[1] ?? (propLat ?? undefined);

  const [lat, setLat] = useState<number | "">(initialLat ?? "");
  const [lng, setLng] = useState<number | "">(initialLng ?? "");
  const [mapPinLabel, setMapPinLabel] = useState(data?.mapPinLabel ?? "");
  const [relativeDescription, setRelativeDescription] = useState(
    data?.relativeDescription ?? ""
  );

  // Filter out current site and sites without coordinates
  const otherSites = existingSites.filter((site) => {
    const hasCoordinates = 
      site.siteLocation?.coordinates?.coordinates &&
      Array.isArray(site.siteLocation.coordinates.coordinates) &&
      site.siteLocation.coordinates.coordinates.length === 2 &&
      site.siteLocation.coordinates.coordinates[0] !== 0 &&
      site.siteLocation.coordinates.coordinates[1] !== 0;
    
    const isNotCurrentSite = site._id !== currentSiteId;
    return hasCoordinates && isNotCurrentSite;
  });


  useEffect(() => {
    const siteHasCoords =
      !!data?.coordinates?.coordinates &&
      Array.isArray(data.coordinates.coordinates) &&
      data.coordinates.coordinates[0] !== 0 &&
      data.coordinates.coordinates[1] !== 0;

    if (!siteHasCoords && propCoords) {
      setLng(propLng ?? "");
      setLat(propLat ?? "");
      onChange({
        coordinates: { type: "Point", coordinates: [propLng ?? 0, propLat ?? 0] },
        mapPinLabel,
        relativeDescription,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propLng, propLat]);

  useEffect(() => {
    if (lat === "" || lng === "") {
      onChange({
        coordinates: undefined,
        mapPinLabel,
        relativeDescription,
      });
      return;
    }

    const ltn = typeof lat === "string" ? parseFloat(lat) : lat;
    const lgn = typeof lng === "string" ? parseFloat(lng) : lng;
    if (isNaN(ltn) || isNaN(lgn)) return;

    if (propCoords) {
      const distKm = haversineKm(propLat ?? 0, propLng ?? 0, ltn, lgn);
      if (distKm > maxDistanceKm) {
        toast.error(
          `Vị trí phải nằm trong ${maxDistanceKm} km từ property (hiện tại ${distKm.toFixed(
            2
          )} km).`
        );
        return;
      }
    }

    onChange({
      coordinates: { type: "Point", coordinates: [lgn, ltn] },
      mapPinLabel,
      relativeDescription,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, mapPinLabel, relativeDescription]);

  const handleUsePropertyCoords = () => {
    if (propCoords == null) {
      toast.error("Property chưa có tọa độ");
      return;
    }
    setLat(propLat ?? "");
    setLng(propLng ?? "");
    onChange({
      coordinates: { type: "Point", coordinates: [propLng ?? 0, propLat ?? 0] },
      mapPinLabel,
      relativeDescription,
    });
    toast.success("Sử dụng tọa độ của property");
  };

  const handleMapPick = (pickedLat: number, pickedLng: number) => {
    if (!propCoords) {
      setLat(pickedLat);
      setLng(pickedLng);
      return;
    }
    const distKm = haversineKm(propLat ?? 0, propLng ?? 0, pickedLat, pickedLng);
    if (distKm > maxDistanceKm) {
      toast.error(
        `Vị trí chọn nằm ngoài ${maxDistanceKm} km (hiện ${distKm.toFixed(2)} km).`
      );
      return;
    }
    setLat(pickedLat);
    setLng(pickedLng);
    onChange({
      coordinates: { type: "Point", coordinates: [pickedLng, pickedLat] },
      mapPinLabel,
      relativeDescription,
    });
    toast.success("Đã chọn vị trí");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép");
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  return (
    <div className="space-y-6">
      {/* Property info (read-only) */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <div>
            <div className="text-sm font-semibold text-gray-900">Tọa độ Property (không sửa)</div>
            <div className="text-xs text-gray-500">Dùng làm tâm tham chiếu — site chỉ có thể chọn trong vòng {maxDistanceKm} km</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <Label className="text-xs">Latitude</Label>
            <div className="mt-1 flex items-center gap-2">
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm">{toFixedNum(propLat)}</div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(String(propLat ?? ""))}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs">Longitude</Label>
            <div className="mt-1 flex items-center gap-2">
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm">{toFixedNum(propLng)}</div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(String(propLng ?? ""))}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs">Địa chỉ</Label>
            <div className="mt-1 text-sm text-gray-700">
              {propertyLocation?.address ? (
                <div className="truncate">{`${propertyLocation.address}, ${propertyLocation.city ?? ""} ${propertyLocation.state ?? ""}`}</div>
              ) : (
                <div className="text-gray-400">Chưa có địa chỉ</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Site selection card */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-sky-600" />
            <div>
              <div className="text-sm font-semibold text-gray-900">Vị trí Site</div>
              <div className="text-xs text-gray-500">
                Mặc định lấy tọa độ property, có thể chỉnh vị trí trong vùng cho phép.
                {otherSites.length > 0 && (
                  <span className="text-blue-600 font-medium ml-1">
                    ({otherSites.length} site khác đang hiển thị trên bản đồ)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleUsePropertyCoords}>
              Sử dụng property
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Latitude</Label>
            <Input
              placeholder="vd: 10.776..."
              value={lat === "" ? "" : String(lat)}
              onChange={(e) => {
                const v = e.target.value.trim();
                setLat(v === "" ? "" : Number(v));
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Longitude</Label>
            <Input
              placeholder="vd: 106.700..."
              value={lng === "" ? "" : String(lng)}
              onChange={(e) => {
                const v = e.target.value.trim();
                setLng(v === "" ? "" : Number(v));
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Khoảng cách tới property</Label>
            <div className="mt-1 text-sm text-gray-700">
              {lat === "" || lng === "" || propLat === undefined || propLng === undefined
                ? "—"
                : `${haversineKm(propLat, propLng, Number(lat), Number(lng)).toFixed(2)} km`}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div>
            <Label className="text-xs">Nhãn điểm ghim (map pin label)</Label>
            <Input
              placeholder="VD: Site A, RV #3"
              value={mapPinLabel}
              onChange={(e) => {
                setMapPinLabel(e.target.value);
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Mô tả vị trí (relative description)</Label>
            <Textarea
              placeholder="VD: Gần sông, cạnh rừng..."
              value={relativeDescription}
              onChange={(e) => {
                setRelativeDescription(e.target.value);
              }}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        {/* Map always visible */}
        <div className="mt-4 rounded border p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">
              Bản đồ vị trí
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Site hiện tại</span>
              </div>
              {otherSites.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Site khác ({otherSites.length})</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Property</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Click hoặc kéo marker đỏ để thay đổi vị trí site (giới hạn {maxDistanceKm} km từ property).
            {otherSites.length > 0 && " Các marker xanh là vị trí của sites khác (chỉ xem, không thay đổi được)."}
          </div>
          <div className="h-[400px] rounded overflow-hidden">
            <MapPreview
              lat={lat === "" ? propLat ?? 16.0544 : Number(lat)}
              lng={lng === "" ? propLng ?? 108.2022 : Number(lng)}
              zoom={15}
              height={400}
              interactive={true}
              onLocationChange={(newLat: number, newLng: number) => {
                handleMapPick(newLat, newLng);
              }}
              circleCenter={propCoords ? { lat: propLat ?? 0, lng: propLng ?? 0, km: maxDistanceKm } : undefined}
              // Pass other sites as read-only markers
              otherMarkers={otherSites.map(site => ({
                lat: site.siteLocation!.coordinates!.coordinates[1],
                lng: site.siteLocation!.coordinates!.coordinates[0],
                label: site.siteLocation?.mapPinLabel || site.name,
                color: 'blue',
                draggable: false,
              }))}
              // Pass property center
              propertyCenter={propCoords ? {
                lat: propLat ?? 0,
                lng: propLng ?? 0,
                label: 'Property Center',
              } : undefined}
            />
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <strong>Lưu ý:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Marker đỏ: vị trí site hiện tại (có thể kéo thả để thay đổi)</li>
          {otherSites.length > 0 && (
            <li>Marker xanh ({otherSites.length}): vị trí các site khác trong property (chỉ xem, không thể thay đổi)</li>
          )}
          <li>Marker xanh lá: vị trí trung tâm property (tham chiếu)</li>
          <li>Vùng tròn: giới hạn {maxDistanceKm} km từ property center</li>
          <li>Tọa độ property không thể sửa từ đây. Nếu muốn thay đổi, vui lòng chỉnh trong thông tin Property.</li>
        </ul>
      </div>
    </div>
  );
}