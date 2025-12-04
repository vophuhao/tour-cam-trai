/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Home, Mountain, Sun } from "lucide-react";

interface SiteCapacityProps {
  data: {
    capacity: {
      maxGuests: number;
      maxVehicles: number;
      maxTents: number;
      maxRVs: number;
    };
    size: {
      value: number;
      unit: "square_meters" | "square_feet";
    };
    accessibility: {
      wheelchairAccessible: boolean;
      rvAccessible: boolean;
      pullThrough: boolean;
      backIn: boolean;
    };
    terrain: "flat" | "sloped" | "mixed";
    shadeLevel: "full_sun" | "partial" | "full_shade";
  };
  onChange: (data: any) => void;
}

export function SiteCapacity({ data, onChange }: SiteCapacityProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sức chứa & Đặc điểm Site
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Thiết lập giới hạn và mô tả đặc điểm vật lý của site
        </p>
      </div>

      <div className="space-y-6">
        {/* Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sức chứa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxGuests">Số khách tối đa</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  value={data.capacity.maxGuests}
                  onChange={(e) =>
                    onChange({
                      capacity: {
                        ...data.capacity,
                        maxGuests: parseInt(e.target.value),
                      },
                    })
                  }
                  min="1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxVehicles">Số xe tối đa</Label>
                <Input
                  id="maxVehicles"
                  type="number"
                  value={data.capacity.maxVehicles}
                  onChange={(e) =>
                    onChange({
                      capacity: {
                        ...data.capacity,
                        maxVehicles: parseInt(e.target.value),
                      },
                    })
                  }
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxTents">Số lều tối đa</Label>
                <Input
                  id="maxTents"
                  type="number"
                  value={data.capacity.maxTents}
                  onChange={(e) =>
                    onChange({
                      capacity: {
                        ...data.capacity,
                        maxTents: parseInt(e.target.value),
                      },
                    })
                  }
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxRVs">Số RV tối đa</Label>
                <Input
                  id="maxRVs"
                  type="number"
                  value={data.capacity.maxRVs}
                  onChange={(e) =>
                    onChange({
                      capacity: {
                        ...data.capacity,
                        maxRVs: parseInt(e.target.value),
                      },
                    })
                  }
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Diện tích
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sizeValue">Diện tích</Label>
                <Input
                  id="sizeValue"
                  type="number"
                  value={data.size.value}
                  onChange={(e) =>
                    onChange({
                      size: {
                        ...data.size,
                        value: parseFloat(e.target.value),
                      },
                    })
                  }
                  min="0"
                  step="0.1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sizeUnit">Đơn vị</Label>
                <Select
                  value={data.size.unit}
                  onValueChange={(value: any) =>
                    onChange({
                      size: { ...data.size, unit: value },
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square_meters">m²</SelectItem>
                    <SelectItem value="square_feet">ft²</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terrain & Shade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mountain className="h-5 w-5" />
              Địa hình & Bóng mát
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="terrain">Địa hình</Label>
              <Select
                value={data.terrain}
                onValueChange={(value: any) => onChange({ terrain: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Bằng phẳng</SelectItem>
                  <SelectItem value="sloped">Dốc</SelectItem>
                  <SelectItem value="mixed">Hỗn hợp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shadeLevel">Mức độ bóng mát</Label>
              <Select
                value={data.shadeLevel}
                onValueChange={(value: any) => onChange({ shadeLevel: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_sun">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Nắng hoàn toàn
                    </div>
                  </SelectItem>
                  <SelectItem value="partial">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 opacity-60" />
                      Bóng mát một phần
                    </div>
                  </SelectItem>
                  <SelectItem value="full_shade">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 opacity-30" />
                      Bóng mát hoàn toàn
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Khả năng tiếp cận
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wheelchairAccessible"
                checked={data.accessibility.wheelchairAccessible}
                onCheckedChange={(checked) =>
                  onChange({
                    accessibility: {
                      ...data.accessibility,
                      wheelchairAccessible: !!checked,
                    },
                  })
                }
              />
              <Label htmlFor="wheelchairAccessible" className="font-normal">
                Xe lăn có thể tiếp cận
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rvAccessible"
                checked={data.accessibility.rvAccessible}
                onCheckedChange={(checked) =>
                  onChange({
                    accessibility: {
                      ...data.accessibility,
                      rvAccessible: !!checked,
                    },
                  })
                }
              />
              <Label htmlFor="rvAccessible" className="font-normal">
                RV có thể vào
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pullThrough"
                checked={data.accessibility.pullThrough}
                onCheckedChange={(checked) =>
                  onChange({
                    accessibility: {
                      ...data.accessibility,
                      pullThrough: !!checked,
                    },
                  })
                }
              />
              <Label htmlFor="pullThrough" className="font-normal">
                Pull-through (lái thẳng vào/ra)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="backIn"
                checked={data.accessibility.backIn}
                onCheckedChange={(checked) =>
                  onChange({
                    accessibility: {
                      ...data.accessibility,
                      backIn: !!checked,
                    },
                  })
                }
              />
              <Label htmlFor="backIn" className="font-normal">
                Back-in (lùi xe vào)
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}