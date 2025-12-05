/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface NearbyAttraction {
  name: string;
  distance?: number;
  type?: string;
}

interface PropertyBasicInfoProps {
  data: {
    name: string;
    tagline: string;
    description: string;
    propertyType: string;
    terrain?: string;
    landSize?: {
      value: number;
      unit: "acres" | "hectares" | "square_meters";
    };
    nearbyAttractions?: NearbyAttraction[];
    status?: "active" | "inactive" | "pending_approval" | "suspended";
    isActive?: boolean;
    isFeatured?: boolean;
  };
  onChange: (data: any) => void;
}


export function PropertyBasicInfo({ data, onChange }: PropertyBasicInfoProps) {
  const addAttraction = () => {
    const list = data.nearbyAttractions ? [...data.nearbyAttractions] : [];
    list.push({ name: "", distance: 0, type: "" });
    onChange({ ...data, nearbyAttractions: list });
  };

  const updateAttraction = (idx: number, patch: Partial<NearbyAttraction>) => {
    const list = (data.nearbyAttractions ?? []).map((a: NearbyAttraction, i: number) =>
      i === idx ? { ...a, ...patch } : a
    );
    onChange({ ...data, nearbyAttractions: list });
  };

  const removeAttraction = (idx: number) => {
    const list = (data.nearbyAttractions ?? []).filter((_: any, i: number) => i !== idx);
    onChange({ ...data, nearbyAttractions: list });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Thông tin cơ bản</h3>
        <p className="text-sm text-gray-500">Cung cấp thông tin cơ bản về property của bạn. Gọn, rõ để người dùng dễ scan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Main fields */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Tên Property <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                className="mt-1"
                placeholder="Nhập tên property"
              />
              <p className="text-xs text-gray-500 mt-1">Tên sẽ hiển thị trên trang chủ và kết quả tìm kiếm</p>
            </div>

            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={data.tagline}
                onChange={(e) => onChange({ ...data, tagline: e.target.value })}
                placeholder="Câu mô tả ngắn gọn (tối đa 150 ký tự)"
                className="mt-1"
                maxLength={150}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="propertyType">Loại Property <span className="text-red-500">*</span></Label>
            <Select
              value={data.propertyType}
              onValueChange={(value) => onChange({ ...data, propertyType: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn loại property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private_land">Đất tư nhân</SelectItem>
                <SelectItem value="farm">Trang trại</SelectItem>
                <SelectItem value="ranch">Trang trại chăn nuôi</SelectItem>
                <SelectItem value="campground">Khu cắm trại</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div>
              <Label htmlFor="landSize">Diện tích</Label>
              <div className="flex gap-2">
                <Input
                  id="landSize"
                  type="number"
                  value={data.landSize?.value || ""}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      landSize: {
                        value: parseFloat(e.target.value) || 0,
                        unit: data.landSize?.unit || "square_meters",
                      },
                    })
                  }
                  placeholder="0"
                  min="0"
                  className="mt-1"
                />
                <Select
                  value={data.landSize?.unit || "square_meters"}
                  onValueChange={(value: any) =>
                    onChange({
                      ...data,
                      landSize: {
                        value: data.landSize?.value || 0,
                        unit: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="mt-1 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square_meters">m²</SelectItem>
                    <SelectItem value="hectares">Hecta</SelectItem>
                    <SelectItem value="acres">Acres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

      
          </div>

          <div>
            <Label htmlFor="description">Mô tả chi tiết <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              placeholder="Mô tả chi tiết về property, cảnh quan, điểm nổi bật..."
              rows={6}
              maxLength={5000}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">{data.description?.length || 0}/5000 ký tự</p>
          </div>

          {/* Nearby attractions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Nearby attractions</Label>
              <Button size="sm" onClick={addAttraction}>Thêm</Button>
            </div>

            <div className="space-y-2">
              {(data.nearbyAttractions ?? []).map((a: NearbyAttraction, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start bg-white border rounded-lg p-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <Input
                      placeholder="Tên điểm"
                      value={a.name}
                      onChange={(e) => updateAttraction(idx, { name: e.target.value })}
                    />
                    <Input
                      placeholder="Khoảng cách (km)"
                      type="number"
                      value={a.distance ?? ""}
                      onChange={(e) => updateAttraction(idx, { distance: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Loại"
                      value={a.type}
                      onChange={(e) => updateAttraction(idx, { type: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Button size="sm" variant="ghost" onClick={() => removeAttraction(idx)}>Xóa</Button>
                  </div>
                </div>
              ))}

              {(data.nearbyAttractions ?? []).length === 0 && (
                <p className="text-xs text-gray-500">Chưa có điểm nổi bật nào</p>
              )}
            </div>
          </div>
        </div>

        {/* Right - status & flags */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <Label>Trạng thái hiển thị</Label>
            <Select
              value={data.status || "active"}
              onValueChange={(value) => onChange({ ...data, status: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="pending_approval">Chờ duyệt</SelectItem>
                <SelectItem value="suspended">Bị khoá</SelectItem>
              </SelectContent>
            </Select>

            <div className="mt-4 space-y-2">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Cho phép hiển thị (isActive)</span>
                <input
                  type="checkbox"
                  checked={!!data.isActive}
                  onChange={(e) => onChange({ ...data, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Nổi bật (isFeatured)</span>
                <input
                  type="checkbox"
                  checked={!!data.isFeatured}
                  onChange={(e) => onChange({ ...data, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </label>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Tóm tắt nhanh</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Loại</span>
                <strong className="text-gray-900">{data.propertyType || "-"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Diện tích</span>
                <strong className="text-gray-900">{data.landSize?.value ? `${data.landSize.value} ${data.landSize.unit}` : "-"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Điểm nổi bật</span>
                <strong className="text-gray-900">{(data.nearbyAttractions ?? []).length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
