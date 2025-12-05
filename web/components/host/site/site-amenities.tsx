/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Flame, Coffee, Zap, Droplet, Wind, Loader2 } from "lucide-react";
import { getAllAmenities } from "@/lib/client-actions";

type Amenity = {
  _id: string;
  name: string;
  description?: string;
  category: "basic" | "comfort" | "safety" | "outdoor" | "special";
  icon ?: React.ComponentType<any>;
};

interface SiteAmenitiesProps {
  // selected amenity ids (ObjectId strings)
  data: string[] | undefined;
  siteType?: string;
  onChange: (selectedAmenityIds: string[]) => void;
}

async function fetchAmenities(): Promise<Amenity[]> {
  const res = await getAllAmenities();

  // If API returns a wrapper with a success flag and it failed
  if (res && typeof res === "object" && "success" in res && !res.success) {
    throw new Error("Failed to load amenities");
  }

  // Normalize possible shapes:
  // - Amenity[]
  // - { data: Amenity[] }
  if (Array.isArray(res)) {
    return res;
  }

  if (res && typeof res === "object" && "data" in res && Array.isArray((res as any).data)) {
    return (res as any).data as Amenity[];
  }

  // Unexpected shape
  throw new Error("Unexpected amenities response shape");
}

export function SiteAmenities({ data = [], onChange, siteType }: SiteAmenitiesProps) {
  const [filter, setFilter] = useState("");
  const { data: amenities = [], isLoading, isError } = useQuery<Amenity[]>({
    queryKey: ["amenities"],
    queryFn: fetchAmenities,
    staleTime: 1000 * 60 * 5,
  });

  const grouped = useMemo(() => {
    const map: Record<string, Amenity[]> = {
      basic: [],
      comfort: [],
      safety: [],
      outdoor: [],
      special: [],
    };
    (amenities || []).forEach((a) => {
      if (!map[a.category]) map[a.category] = [];
      map[a.category].push(a);
    });
    return map;
  }, [amenities]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return grouped;
    const q = filter.toLowerCase();
    const out: Record<string, Amenity[]> = {};
    Object.entries(grouped).forEach(([k, list]) => {
      out[k] = list.filter(
        (a) => a.name.toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q)
      );
    });
    return out;
  }, [grouped, filter]);

  const toggle = (id: string) => {
    const set = new Set(data);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange(Array.from(set));
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg border text-center">
        <Loader2 className="animate-spin mx-auto h-6 w-6 text-gray-600" />
        <div className="text-sm text-gray-600 mt-2">Đang tải tiện nghi...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
        Không thể tải danh sách tiện nghi. Thử refresh trang hoặc kiểm tra API /api/amenities.
      </div>
    );
  }
  console.log("amenities", amenities);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-semibold text-gray-900 mb-1">Tiện nghi Site</p>
       
      </div>


      {/* Groups */}
      <div className="space-y-4">
        {(["basic", "comfort", "safety", "outdoor", "special"] as const).map((category) => {
          const list = filtered[category] || [];
          if (list.length === 0) return null;
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {list.map((amenity) => {
                    const checked = data.includes(amenity._id);
                    return (
                      <label
                        key={amenity._id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          checked ? "bg-emerald-50 border-emerald-300" : "hover:bg-gray-50"
                        }`}
                      >
                        <Checkbox
                          id={amenity._id}
                          checked={checked}
                          onCheckedChange={() => toggle(amenity._id)}
                        />
                        <div className="flex-1">
                      
                          <div className="font-medium text-sm text-gray-900">{amenity.name}</div>
                          {amenity.description && (
                            <div className="text-xs text-gray-500">{amenity.description}</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected summary */}
      <Card>
        <CardHeader>
          <CardTitle>Đã chọn ({data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-sm text-gray-400">Chưa chọn tiện nghi nào</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.map((id) => {
                const a = amenities.find((am) => am._id === id);
                return (
                  <Badge key={id} className="flex items-center gap-2">
                    {a ? a.name : id}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggle(id)}
                      className="p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}