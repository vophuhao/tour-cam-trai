/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
import { X, Plus, Search, Loader2 } from "lucide-react";
import { getAllAmenities, getAllActivities } from "@/lib/client-actions";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Amenity {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  category: "basic" | "comfort" | "safety" | "outdoor" | "special";
  isActive: boolean;
}

interface Activity {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  category: "water" | "hiking" | "wildlife" | "winter" | "adventure" | "relaxation" | "other";
  isActive: boolean;
}

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
    amenities?: string[]; // IDs of selected amenities
    activities?: string[]; // IDs of selected activities
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

const AMENITY_CATEGORY_LABELS: Record<string, string> = {
  basic: "Cơ bản",
  comfort: "Tiện nghi",
  safety: "An toàn",
  outdoor: "Ngoài trời",
  special: "Đặc biệt",
};

const ACTIVITY_CATEGORY_LABELS: Record<string, string> = {
  water: "Hoạt động nước",
  hiking: "Leo núi/Trekking",
  wildlife: "Động vật hoang dã",
  winter: "Mùa đông",
  adventure: "Mạo hiểm",
  relaxation: "Thư giãn",
  other: "Khác",
};

export function PropertyAmenities({ data, onChange }: PropertyAmenitiesProps) {
  const [newCommonArea, setNewCommonArea] = useState("");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [amenitySearch, setAmenitySearch] = useState("");
  const [activitySearch, setActivitySearch] = useState("");

  // Fetch amenities and activities
  useEffect(() => {
    fetchAmenities();
    fetchActivities();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoadingAmenities(true);
      const response = await getAllAmenities();
      if (response.success && response.data) {
        setAmenities(response.data.filter((a) => a.isActive));
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast.error("Không thể tải danh sách tiện nghi");
    } finally {
      setLoadingAmenities(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await getAllActivities();
      if (response.success && response.data) {
        setActivities(response.data.filter((a) => a.isActive));
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Không thể tải danh sách hoạt động");
    } finally {
      setLoadingActivities(false);
    }
  };

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

  const toggleAmenity = (amenityId: string) => {
    const currentAmenities = data.amenities || [];
    const isSelected = currentAmenities.includes(amenityId);

    onChange({
      amenities: isSelected
        ? currentAmenities.filter((id) => id !== amenityId)
        : [...currentAmenities, amenityId],
    });
  };

  const toggleActivity = (activityId: string) => {
    const currentActivities = data.activities || [];
    const isSelected = currentActivities.includes(activityId);

    onChange({
      activities: isSelected
        ? currentActivities.filter((id) => id !== activityId)
        : [...currentActivities, activityId],
    });
  };

  // Group amenities by category
  const groupedAmenities = amenities.reduce((acc, amenity) => {
    const category = amenity.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  // Group activities by category
  const groupedActivities = activities.reduce((acc, activity) => {
    const category = activity.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  // Filter amenities by search
  const filteredAmenities = amenitySearch
    ? amenities.filter((a) =>
        a.name.toLowerCase().includes(amenitySearch.toLowerCase())
      )
    : amenities;

  // Filter activities by search
  const filteredActivities = activitySearch
    ? activities.filter((a) =>
        a.name.toLowerCase().includes(activitySearch.toLowerCase())
      )
    : activities;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tiện nghi & Hoạt động của Property
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Các tiện nghi và hoạt động được chia sẻ chung cho tất cả các site
        </p>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {/* Basic Facilities */}
        <AccordionItem value="facilities" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <h4 className="font-semibold text-gray-900">Cơ sở vật chất cơ bản</h4>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-6 pt-4">
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

              {/* Other Basic Amenities */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-900">Tiện ích khác</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="laundry"
                      checked={data.laundry}
                      onCheckedChange={(checked) =>
                        onChange({ laundry: !!checked })
                      }
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
          </AccordionContent>
        </AccordionItem>

        {/* Common Areas */}
        <AccordionItem value="common-areas" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <h4 className="font-semibold text-gray-900">
              Khu vực chung ({data.commonAreas?.length || 0})
            </h4>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4 pt-4">
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
          </AccordionContent>
        </AccordionItem>

        {/* Amenities */}
        <AccordionItem value="amenities" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <h4 className="font-semibold text-gray-900">
              Tiện nghi ({data.amenities?.length || 0})
            </h4>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {loadingAmenities ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm tiện nghi..."
                    value={amenitySearch}
                    onChange={(e) => setAmenitySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Amenities by Category */}
                {amenitySearch ? (
                  <div className="space-y-2">
                    {filteredAmenities.map((amenity) => {
                      const isSelected = data.amenities?.includes(amenity._id);
                      return (
                        <div
                          key={amenity._id}
                          className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                        >
                          <Checkbox
                            id={`amenity-${amenity._id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleAmenity(amenity._id)}
                          />
                          <Label
                            htmlFor={`amenity-${amenity._id}`}
                            className="flex-1 cursor-pointer font-normal"
                          >
                            <div className="flex items-center gap-2">
                              {amenity.icon && (
                                <span className="text-lg">{amenity.icon}</span>
                              )}
                              <div>
                                <div className="font-medium">{amenity.name}</div>
                                {amenity.description && (
                                  <div className="text-xs text-gray-500">
                                    {amenity.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {AMENITY_CATEGORY_LABELS[amenity.category]}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {Object.entries(groupedAmenities).map(([category, items]) => (
                      <AccordionItem
                        key={category}
                        value={category}
                        className="border rounded-lg"
                      >
                        <AccordionTrigger className="px-4 py-2 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">
                              {AMENITY_CATEGORY_LABELS[category]}
                            </span>
                            <Badge variant="secondary" className="ml-2">
                              {items.filter((a) => data.amenities?.includes(a._id)).length}/
                              {items.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-2">
                            {items.map((amenity) => {
                              const isSelected = data.amenities?.includes(
                                amenity._id
                              );
                              return (
                                <div
                                  key={amenity._id}
                                  className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                                >
                                  <Checkbox
                                    id={`amenity-${amenity._id}`}
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      toggleAmenity(amenity._id)
                                    }
                                  />
                                  <Label
                                    htmlFor={`amenity-${amenity._id}`}
                                    className="flex-1 cursor-pointer font-normal"
                                  >
                                    <div className="flex items-center gap-2">
                                      {amenity.icon && (
                                        <span className="text-lg">
                                          {amenity.icon}
                                        </span>
                                      )}
                                      <div>
                                        <div className="font-medium">
                                          {amenity.name}
                                        </div>
                                        {amenity.description && (
                                          <div className="text-xs text-gray-500">
                                            {amenity.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Activities */}
        <AccordionItem value="activities" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <h4 className="font-semibold text-gray-900">
              Hoạt động ({data.activities?.length || 0})
            </h4>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {loadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm hoạt động..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Activities by Category */}
                {activitySearch ? (
                  <div className="space-y-2">
                    {filteredActivities.map((activity) => {
                      const isSelected = data.activities?.includes(activity._id);
                      return (
                        <div
                          key={activity._id}
                          className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                        >
                          <Checkbox
                            id={`activity-${activity._id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleActivity(activity._id)}
                          />
                          <Label
                            htmlFor={`activity-${activity._id}`}
                            className="flex-1 cursor-pointer font-normal"
                          >
                            <div className="flex items-center gap-2">
                              {activity.icon && (
                                <span className="text-lg">{activity.icon}</span>
                              )}
                              <div>
                                <div className="font-medium">{activity.name}</div>
                                {activity.description && (
                                  <div className="text-xs text-gray-500">
                                    {activity.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {ACTIVITY_CATEGORY_LABELS[activity.category]}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {Object.entries(groupedActivities).map(([category, items]) => (
                      <AccordionItem
                        key={category}
                        value={category}
                        className="border rounded-lg"
                      >
                        <AccordionTrigger className="px-4 py-2 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">
                              {ACTIVITY_CATEGORY_LABELS[category]}
                            </span>
                            <Badge variant="secondary" className="ml-2">
                              {
                                items.filter((a) =>
                                  data.activities?.includes(a._id)
                                ).length
                              }
                              /{items.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-2">
                            {items.map((activity) => {
                              const isSelected = data.activities?.includes(
                                activity._id
                              );
                              return (
                                <div
                                  key={activity._id}
                                  className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                                >
                                  <Checkbox
                                    id={`activity-${activity._id}`}
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      toggleActivity(activity._id)
                                    }
                                  />
                                  <Label
                                    htmlFor={`activity-${activity._id}`}
                                    className="flex-1 cursor-pointer font-normal"
                                  >
                                    <div className="flex items-center gap-2">
                                      {activity.icon && (
                                        <span className="text-lg">
                                          {activity.icon}
                                        </span>
                                      )}
                                      <div>
                                        <div className="font-medium">
                                          {activity.name}
                                        </div>
                                        {activity.description && (
                                          <div className="text-xs text-gray-500">
                                            {activity.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}