/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertySettingsProps {
  data: {
    status?: "draft" | "published" | "suspended";
    visibility?: "public" | "private" | "unlisted";
    instantBooking: boolean;
    requireApproval: boolean;
    minimumNotice?: number;
    advanceBooking?: number;
    timezone?: string;
  };
  onChange: (data: any) => void;
}

const TIMEZONES = [
  { value: "Asia/Ho_Chi_Minh", label: "Việt Nam (GMT+7)" },
  { value: "Asia/Bangkok", label: "Thái Lan (GMT+7)" },
  { value: "Asia/Singapore", label: "Singapore (GMT+8)" },
];

export function PropertySettings({ data, onChange }: PropertySettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cài đặt Property
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Cấu hình các tùy chọn hoạt động của property
        </p>
      </div>

      <div className="space-y-6">
        {/* Status & Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái & Hiển thị</CardTitle>
            <CardDescription>
              Kiểm soát cách property hiển thị với khách
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={data.status}
                onValueChange={(value: any) => onChange({ status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                  <SelectItem value="suspended">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Chỉ property "Đã xuất bản" mới hiển thị với khách
              </p>
            </div>

            <div>
              <Label htmlFor="visibility">Chế độ hiển thị</Label>
              <Select
                value={data.visibility}
                onValueChange={(value: any) => onChange({ visibility: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div>
                      <div className="font-semibold">Công khai</div>
                      <div className="text-xs text-gray-500">
                        Hiển thị trong kết quả tìm kiếm
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="unlisted">
                    <div>
                      <div className="font-semibold">Không liệt kê</div>
                      <div className="text-xs text-gray-500">
                        Chỉ truy cập qua link trực tiếp
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div>
                      <div className="font-semibold">Riêng tư</div>
                      <div className="text-xs text-gray-500">
                        Chỉ bạn có thể xem
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Booking Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt đặt chỗ</CardTitle>
            <CardDescription>
              Cấu hình quy trình đặt chỗ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instantBooking"
                  checked={data.instantBooking}
                  onCheckedChange={(checked) =>
                    onChange({ instantBooking: !!checked })
                  }
                />
                <div>
                  <Label htmlFor="instantBooking" className="font-normal">
                    Đặt chỗ ngay lập tức
                  </Label>
                  <p className="text-xs text-gray-500">
                    Khách có thể đặt mà không cần chờ phê duyệt
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requireApproval"
                  checked={data.requireApproval}
                  onCheckedChange={(checked) =>
                    onChange({ requireApproval: !!checked })
                  }
                />
                <div>
                  <Label htmlFor="requireApproval" className="font-normal">
                    Yêu cầu phê duyệt
                  </Label>
                  <p className="text-xs text-gray-500">
                    Bạn phải chấp nhận từng yêu cầu đặt chỗ
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimumNotice">
                  Thời gian báo trước tối thiểu (giờ)
                </Label>
                <Input
                  id="minimumNotice"
                  type="number"
                  value={data.minimumNotice || ""}
                  onChange={(e) =>
                    onChange({ minimumNotice: parseInt(e.target.value) })
                  }
                  min="0"
                  placeholder="24"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Khách phải đặt trước ít nhất X giờ
                </p>
              </div>

              <div>
                <Label htmlFor="advanceBooking">
                  Đặt trước tối đa (ngày)
                </Label>
                <Input
                  id="advanceBooking"
                  type="number"
                  value={data.advanceBooking || ""}
                  onChange={(e) =>
                    onChange({ advanceBooking: parseInt(e.target.value) })
                  }
                  min="1"
                  placeholder="365"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Khách có thể đặt trước tối đa X ngày
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timezone */}
        <Card>
          <CardHeader>
            <CardTitle>Múi giờ</CardTitle>
            <CardDescription>
              Chọn múi giờ của property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={data.timezone}
              onValueChange={(value) => onChange({ timezone: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn múi giờ" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}