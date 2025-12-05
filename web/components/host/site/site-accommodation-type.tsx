"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tent, Home, Caravan, TreePine, Mountain, Waves, Trees, Sun } from "lucide-react";

const ACCOMMODATION_TYPES = [
  { value: "tent", label: "Lều (Tent)", icon: Tent },
  { value: "rv", label: "RV/Camper", icon: Caravan },
  { value: "cabin", label: "Cabin", icon: Home },
  { value: "yurt", label: "Yurt", icon: TreePine },
  { value: "treehouse", label: "Nhà trên cây", icon: TreePine },
  { value: "tiny_home", label: "Tiny Home", icon: Home },
  { value: "safari_tent", label: "Safari Tent", icon: Tent },
  { value: "bell_tent", label: "Bell Tent", icon: Tent },
  { value: "glamping_pod", label: "Glamping Pod", icon: Home },
  { value: "dome", label: "Dome", icon: Home },
  { value: "airstream", label: "Airstream", icon: Caravan },
  { value: "vintage_trailer", label: "Vintage Trailer", icon: Caravan },
  { value: "van", label: "Van", icon: Caravan },
];

const LODGING_PROVIDED = [
  { value: "bring_your_own", label: "Khách tự mang", description: "Khách mang lều/thiết bị riêng" },
  { value: "structure_provided", label: "Có sẵn cấu trúc", description: "Có cabin, yurt, lều cố định..." },
  { value: "vehicle_provided", label: "Xe có sẵn", description: "RV, trailer, van đã có sẵn" },
];

const TERRAIN_OPTIONS = [
  { value: "forest", label: "Rừng", icon: Trees },
  { value: "beach", label: "Bãi biển", icon: Waves },
  { value: "mountain", label: "Núi", icon: Mountain },
  { value: "desert", label: "Sa mạc", icon: Sun },
  { value: "farm", label: "Trang trại", icon: Home },
];

interface SiteAccommodationTypeProps {
  data: { type: string; lodgingProvided?: string; terrain?: string };
  onChange: (patch: { type?: string; lodgingProvided?: string; terrain?: string }) => void;
}

export function SiteAccommodationType({ data, onChange }: SiteAccommodationTypeProps) {
  return (
    <div className="space-y-6">
      <div><p className="text-3xl font-semibold text-gray-900 mb-4">Loại chỗ ở & Địa hình</p></div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Kiểu chỗ ở</CardTitle>
            <CardDescription>Site này phù hợp với loại hình nào?</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="accommodationType">Chọn loại <span className="text-red-500">*</span></Label>
            <Select value={data.type} onValueChange={(v) => onChange({ type: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-80">
                {ACCOMMODATION_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-gray-500" /><span>{t.label}</span></div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thiết bị/Cấu trúc</CardTitle>
            <CardDescription>Khách có cần mang theo lều/thiết bị không?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {LODGING_PROVIDED.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    data.lodgingProvided === opt.value ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input type="radio" name="lodgingProvided" value={opt.value} checked={data.lodgingProvided === opt.value} onChange={(e) => onChange({ lodgingProvided: e.target.value })} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{opt.label}</div>
                    <div className="text-sm text-gray-500">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Địa hình</CardTitle>
            <CardDescription>Loại địa hình chính của site</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="terrain">Chọn địa hình</Label>
            <Select value={data.terrain ?? ""} onValueChange={(v) => onChange({ terrain: v || undefined })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Không chọn" /></SelectTrigger>
              <SelectContent>
                {TERRAIN_OPTIONS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-gray-500" /><span>{t.label}</span></div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}