/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

interface PropertyLocationProps {
  data: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
    directions?: string;
    parkingInstructions?: string;
  };
  onChange: (data: any) => void;
}

export function PropertyLocation({ data, onChange }: PropertyLocationProps) {
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            coordinates: {
              type: "Point",
              coordinates: [position.coords.longitude, position.coords.latitude],
            },
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Địa chỉ Property
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Cung cấp thông tin vị trí chính xác của property
        </p>
      </div>

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
          <div className="mt-2 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat" className="text-sm">
                  Vĩ độ (Latitude)
                </Label>
                <Input
                  id="lat"
                  type="number"
                  value={data.coordinates.coordinates[1] || ""}
                  onChange={(e) =>
                    onChange({
                      coordinates: {
                        type: "Point",
                        coordinates: [
                          data.coordinates.coordinates[0],
                          parseFloat(e.target.value),
                        ],
                      },
                    })
                  }
                  placeholder="11.9404"
                  step="0.000001"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lng" className="text-sm">
                  Kinh độ (Longitude)
                </Label>
                <Input
                  id="lng"
                  type="number"
                  value={data.coordinates.coordinates[0] || ""}
                  onChange={(e) =>
                    onChange({
                      coordinates: {
                        type: "Point",
                        coordinates: [
                          parseFloat(e.target.value),
                          data.coordinates.coordinates[1],
                        ],
                      },
                    })
                  }
                  placeholder="108.4583"
                  step="0.000001"
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={loadingLocation}
              className="w-full"
            >
              <Navigation className="mr-2 h-4 w-4" />
              {loadingLocation ? "Đang lấy vị trí..." : "Lấy vị trí hiện tại"}
            </Button>
          </div>
        </div>

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
          <Label htmlFor="parkingInstructions">
            Hướng dẫn đậu xe
          </Label>
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