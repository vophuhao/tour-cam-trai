/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface PropertyAmenitiesProps {
  data: {
    toilets?: {
      type: "none" | "portable" | "flush" | "vault" | "composting";
      count: number;
      isShared: boolean;
    };
    showers?: {
      type: "none" | "outdoor" | "indoor" | "hot" | "cold";
      count: number;
      isShared: boolean;
    };
    potableWater: boolean;
    waterSource?: "tap" | "well" | "stream" | "none";
    parkingType?: "drive_in" | "walk_in" | "nearby";
    parkingSpaces?: number;
    commonAreas?: string[];
    laundry: boolean;
    wifi: boolean;
    cellService?: "excellent" | "good" | "limited" | "none";
    electricityAvailable: boolean;
  };
  onChange: (data: any) => void;
}

const COMMON_AREAS = [
  "fire_pit_area",
  "picnic_area",
  "kitchen",
  "dining_area",
  "lounge",
  "playground",
  "sports_field",
  "garden",
];

export function PropertyAmenities({ data, onChange }: PropertyAmenitiesProps) {
  const [newCommonArea, setNewCommonArea] = useState("");

  const addCommonArea = () => {
    if (newCommonArea && !data.commonAreas?.includes(newCommonArea)) {
      onChange({
        commonAreas: [...(data.commonAreas || []), newCommonArea],
      });
      setNewCommonArea("");
    }
  };

  const removeCommonArea = (area: string) => {
    onChange({
      commonAreas: data.commonAreas?.filter((a) => a !== area),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tiện nghi chung của Property
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Các tiện nghi được chia sẻ chung cho tất cả các site
        </p>
      </div>

      <div className="space-y-6">
        {/* Toilets */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Nhà vệ sinh</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="toiletType">Loại</Label>
              <Select
                value={data.toilets?.type}
                onValueChange={(value: any) =>
                  onChange({
                    toilets: { ...data.toilets, type: value },
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  <SelectItem value="portable">Di động</SelectItem>
                  <SelectItem value="flush">Xả nước</SelectItem>
                  <SelectItem value="vault">Hầm</SelectItem>
                  <SelectItem value="composting">Ủ phân</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="toiletCount">Số lượng</Label>
              <Input
                id="toiletCount"
                type="number"
                value={data.toilets?.count || 0}
                onChange={(e) =>
                  onChange({
                    toilets: {
                      ...data.toilets,
                      count: parseInt(e.target.value),
                    },
                  })
                }
                min="0"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="toiletShared"
              checked={data.toilets?.isShared}
              onCheckedChange={(checked) =>
                onChange({
                  toilets: { ...data.toilets, isShared: !!checked },
                })
              }
            />
            <Label htmlFor="toiletShared" className="font-normal">
              Nhà vệ sinh chung
            </Label>
          </div>
        </div>

        {/* Showers */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Phòng tắm</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="showerType">Loại</Label>
              <Select
                value={data.showers?.type}
                onValueChange={(value: any) =>
                  onChange({
                    showers: { ...data.showers, type: value },
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  <SelectItem value="outdoor">Ngoài trời</SelectItem>
                  <SelectItem value="indoor">Trong nhà</SelectItem>
                  <SelectItem value="hot">Nước nóng</SelectItem>
                  <SelectItem value="cold">Nước lạnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="showerCount">Số lượng</Label>
              <Input
                id="showerCount"
                type="number"
                value={data.showers?.count || 0}
                onChange={(e) =>
                  onChange({
                    showers: {
                      ...data.showers,
                      count: parseInt(e.target.value),
                    },
                  })
                }
                min="0"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showerShared"
              checked={data.showers?.isShared}
              onCheckedChange={(checked) =>
                onChange({
                  showers: { ...data.showers, isShared: !!checked },
                })
              }
            />
            <Label htmlFor="showerShared" className="font-normal">
              Phòng tắm chung
            </Label>
          </div>
        </div>

        {/* Water */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Nước</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="waterSource">Nguồn nước</Label>
              <Select
                value={data.waterSource}
                onValueChange={(value: any) =>
                  onChange({ waterSource: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn nguồn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tap">Vòi nước</SelectItem>
                  <SelectItem value="well">Giếng</SelectItem>
                  <SelectItem value="stream">Suối</SelectItem>
                  <SelectItem value="none">Không có</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="potableWater"
                  checked={data.potableWater}
                  onCheckedChange={(checked) =>
                    onChange({ potableWater: !!checked })
                  }
                />
                <Label htmlFor="potableWater" className="font-normal">
                  Nước uống được
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Parking */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Bãi đỗ xe</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parkingType">Loại bãi đỗ</Label>
              <Select
                value={data.parkingType}
                onValueChange={(value: any) =>
                  onChange({ parkingType: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drive_in">Lái xe vào</SelectItem>
                  <SelectItem value="walk_in">Đi bộ vào</SelectItem>
                  <SelectItem value="nearby">Gần đó</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="parkingSpaces">Số chỗ đậu</Label>
              <Input
                id="parkingSpaces"
                type="number"
                value={data.parkingSpaces || 0}
                onChange={(e) =>
                  onChange({ parkingSpaces: parseInt(e.target.value) })
                }
                min="0"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Common Areas */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Khu vực chung</h4>
          <div className="flex flex-wrap gap-2">
            {COMMON_AREAS.map((area) => {
              const isSelected = data.commonAreas?.includes(area);
              return (
                <Badge
                  key={area}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (isSelected) {
                      removeCommonArea(area);
                    } else {
                      onChange({
                        commonAreas: [...(data.commonAreas || []), area],
                      });
                    }
                  }}
                >
                  {area.replace(/_/g, " ")}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              value={newCommonArea}
              onChange={(e) => setNewCommonArea(e.target.value)}
              placeholder="Thêm khu vực khác..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCommonArea();
                }
              }}
            />
            <Button type="button" onClick={addCommonArea} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {data.commonAreas && data.commonAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.commonAreas
                .filter((area) => !COMMON_AREAS.includes(area))
                .map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeCommonArea(area)}
                  >
                    {area}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
            </div>
          )}
        </div>

        {/* Other Amenities */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Tiện ích khác</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="laundry"
                checked={data.laundry}
                onCheckedChange={(checked) => onChange({ laundry: !!checked })}
              />
              <Label htmlFor="laundry" className="font-normal">
                Giặt ủi
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wifi"
                checked={data.wifi}
                onCheckedChange={(checked) => onChange({ wifi: !!checked })}
              />
              <Label htmlFor="wifi" className="font-normal">
                WiFi
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="electricity"
                checked={data.electricityAvailable}
                onCheckedChange={(checked) =>
                  onChange({ electricityAvailable: !!checked })
                }
              />
              <Label htmlFor="electricity" className="font-normal">
                Điện
              </Label>
            </div>
            <div>
              <Label htmlFor="cellService">Sóng điện thoại</Label>
              <Select
                value={data.cellService}
                onValueChange={(value: any) =>
                  onChange({ cellService: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Rất tốt</SelectItem>
                  <SelectItem value="good">Tốt</SelectItem>
                  <SelectItem value="limited">Hạn chế</SelectItem>
                  <SelectItem value="none">Không có</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}