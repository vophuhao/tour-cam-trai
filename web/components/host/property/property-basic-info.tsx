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
  };
  onChange: (data: any) => void;
}

export function PropertyBasicInfo({ data, onChange }: PropertyBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin cơ bản
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Cung cấp thông tin cơ bản về property của bạn
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">
            Tên Property <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) =>
              onChange({
                ...data,
                name: e.target.value,
              })
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Tên sẽ hiển thị trên trang chủ và kết quả tìm kiếm
          </p>
        </div>

        <div>
          <Label htmlFor="tagline">Tagline (Khẩu hiệu)</Label>
          <Input
            id="tagline"
            value={data.tagline}
            onChange={(e) => onChange({ ...data, tagline: e.target.value })}
            placeholder="VD: Trải nghiệm thiên nhiên hoang dã giữa lòng rừng thông"
            maxLength={150}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Câu mô tả ngắn gọn, hấp dẫn (tối đa 150 ký tự)
          </p>
        </div>

        <div>
          <Label htmlFor="propertyType">
            Loại Property <span className="text-red-500">*</span>
          </Label>
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

        <div>
          <Label htmlFor="terrain">Địa hình</Label>
          <Select
            value={data.terrain}
            onValueChange={(value) => onChange({ ...data, terrain: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Chọn địa hình" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="forest">Rừng</SelectItem>
              <SelectItem value="beach">Bãi biển</SelectItem>
              <SelectItem value="mountain">Núi</SelectItem>
              <SelectItem value="desert">Sa mạc</SelectItem>
              <SelectItem value="farm">Đồng ruộng</SelectItem>
              <SelectItem value="riverside">Ven sông</SelectItem>
              <SelectItem value="lakeside">Ven hồ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="landSize">Diện tích đất</Label>
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
              step="0.1"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="landSizeUnit">Đơn vị</Label>
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
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square_meters">m²</SelectItem>
                <SelectItem value="hectares">Hecta</SelectItem>
                <SelectItem value="acres">Acres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Mô tả chi tiết về property của bạn, bao gồm cảnh quan, môi trường xung quanh, điểm đặc biệt..."
            rows={8}
            maxLength={5000}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            {data.description?.length || 0}/5000 ký tự
          </p>
        </div>
      </div>
    </div>
  );
}