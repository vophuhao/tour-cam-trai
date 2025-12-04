/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Flame, Coffee, Zap, Droplet, Wind } from "lucide-react";

interface SiteAmenitiesProps {
  data: {
    firePit: boolean;
    picnicTable: boolean;
    grillGrate: boolean;
    waterAccess: boolean;
    electricalHookup: boolean;
    sewerHookup: boolean;
    shadeStructure: boolean;
    customAmenities: string[];
  };
  siteType: string;
  onChange: (data: any) => void;
}

const AMENITY_GROUPS = {
  basic: [
    { id: "firePit", label: "Lò lửa / Fire pit", icon: Flame },
    { id: "picnicTable", label: "Bàn picnic", icon: Coffee },
    { id: "grillGrate", label: "Vỉ nướng", icon: Flame },
    { id: "shadeStructure", label: "Mái che", icon: Wind },
  ],
  utilities: [
    { id: "waterAccess", label: "Nguồn nước", icon: Droplet },
    { id: "electricalHookup", label: "Điện", icon: Zap },
    { id: "sewerHookup", label: "Thoát nước", icon: Droplet },
  ],
};

export function SiteAmenities({ data, onChange, siteType }: SiteAmenitiesProps) {
  const [newAmenity, setNewAmenity] = useState("");

  const toggleAmenity = (amenityId: string) => {
    onChange({ [amenityId]: !data[amenityId as keyof typeof data] });
  };

  const addCustomAmenity = () => {
    if (newAmenity.trim() && !data.customAmenities.includes(newAmenity.trim())) {
      onChange({
        customAmenities: [...data.customAmenities, newAmenity.trim()],
      });
      setNewAmenity("");
    }
  };

  const removeCustomAmenity = (amenity: string) => {
    onChange({
      customAmenities: data.customAmenities.filter((a) => a !== amenity),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tiện nghi Site
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Chọn các tiện nghi có sẵn tại site này
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Tiện nghi cơ bản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {AMENITY_GROUPS.basic.map((amenity) => {
                const Icon = amenity.icon;
                return (
                  <div
                    key={amenity.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      data[amenity.id as keyof typeof data]
                        ? "bg-emerald-50 border-emerald-300"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleAmenity(amenity.id)}
                  >
                    <Checkbox
                      id={amenity.id}
                      checked={!!data[amenity.id as keyof typeof data]}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                    />
                    <Icon className="h-5 w-5 text-gray-600" />
                    <Label htmlFor={amenity.id} className="font-normal cursor-pointer flex-1">
                      {amenity.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Utilities */}
        <Card>
          <CardHeader>
            <CardTitle>Tiện ích (Utilities)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {AMENITY_GROUPS.utilities.map((amenity) => {
                const Icon = amenity.icon;
                return (
                  <div
                    key={amenity.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      data[amenity.id as keyof typeof data]
                        ? "bg-emerald-50 border-emerald-300"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleAmenity(amenity.id)}
                  >
                    <Checkbox
                      id={amenity.id}
                      checked={!!data[amenity.id as keyof typeof data]}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                    />
                    <Icon className="h-5 w-5 text-gray-600" />
                    <Label htmlFor={amenity.id} className="font-normal cursor-pointer flex-1">
                      {amenity.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Tiện nghi tùy chỉnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="VD: Võng, Bluetooth speaker..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
              />
              <Button type="button" onClick={addCustomAmenity} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {data.customAmenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.customAmenities.map((amenity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeCustomAmenity(amenity)}
                  >
                    {amenity}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {(Object.values(data).some(v => v === true) || data.customAmenities.length > 0) && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 text-base">
                Tổng số tiện nghi: {
                  Object.entries(data)
                    .filter(([key, value]) => key !== 'customAmenities' && value === true)
                    .length + data.customAmenities.length
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                Site của bạn được trang bị đầy đủ tiện nghi, sẽ thu hút nhiều khách hơn!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}