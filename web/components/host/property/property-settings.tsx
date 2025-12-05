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
import { Textarea } from "@/components/ui/textarea";

interface PropertySettingsProps {
  data: any;
  onChange: (data: any) => void;
}

const TIMEZONES = [
  { value: "Asia/Ho_Chi_Minh", label: "Việt Nam (GMT+7)" },
  { value: "Asia/Bangkok", label: "Thái Lan (GMT+7)" },
  { value: "Asia/Singapore", label: "Singapore (GMT+8)" },
];

export function PropertySettings({ data, onChange }: PropertySettingsProps) {
  // support both flattened shape (instantBooking, minimumNotice, advanceBooking, etc.)
  // and nested shape (settings.*)
  const instantBooking =
    data.instantBooking ?? data.instantBookEnabled ?? data.settings?.instantBookEnabled ?? false;
  const requireApproval =
    typeof data.requireApproval !== "undefined"
      ? data.requireApproval
      : data.settings?.requireApproval ?? true;
  const minimumNotice =
    data.minimumNotice ??
    data.minimumAdvanceNotice ??
    data.settings?.minimumAdvanceNotice ??
    24;
  const advanceBooking =
    data.advanceBooking ?? data.bookingWindow ?? data.settings?.bookingWindow ?? 365;
  const allowWholePropertyBooking =
    typeof data.allowWholePropertyBooking !== "undefined"
      ? data.allowWholePropertyBooking
      : data.settings?.allowWholePropertyBooking ?? false;

  const checkInInstructions = data.checkInInstructions ?? data.settings?.checkInInstructions ?? "";
  const checkOutInstructions = data.checkOutInstructions ?? data.settings?.checkOutInstructions ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt Property</h3>
        <p className="text-sm text-gray-500 mb-6">Cấu hình các tùy chọn hoạt động của property</p>
      </div>

      <div className="space-y-6">
        {/* Status & Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái & Hiển thị</CardTitle>
            <CardDescription>Kiểm soát cách property hiển thị với khách</CardDescription>
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
              <p className="text-xs text-gray-500 mt-1">Chỉ property "Đã xuất bản" mới hiển thị với khách</p>
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
                      <div className="text-xs text-gray-500">Hiển thị trong kết quả tìm kiếm</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="unlisted">
                    <div>
                      <div className="font-semibold">Không liệt kê</div>
                      <div className="text-xs text-gray-500">Chỉ truy cập qua link trực tiếp</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div>
                      <div className="font-semibold">Riêng tư</div>
                      <div className="text-xs text-gray-500">Chỉ bạn có thể xem</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Booking Settings (mapped to model.settings) */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt đặt chỗ</CardTitle>
            <CardDescription>Cấu hình quy trình đặt chỗ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instantBooking"
                  checked={!!instantBooking}
                  onCheckedChange={(checked) =>
                    onChange({
                      instantBooking: !!checked,
                      settings: { ...(data.settings ?? {}), instantBookEnabled: !!checked },
                    })
                  }
                />
                <div>
                  <Label htmlFor="instantBooking" className="font-normal">
                    Đặt chỗ ngay lập tức
                  </Label>
                  <p className="text-xs text-gray-500">Khách có thể đặt mà không cần chờ phê duyệt</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requireApproval"
                  checked={!!requireApproval}
                  onCheckedChange={(checked) =>
                    onChange({
                      requireApproval: !!checked,
                      settings: { ...(data.settings ?? {}), requireApproval: !!checked },
                    })
                  }
                />
                <div>
                  <Label htmlFor="requireApproval" className="font-normal">
                    Yêu cầu phê duyệt
                  </Label>
                  <p className="text-xs text-gray-500">Bạn phải chấp nhận từng yêu cầu đặt chỗ</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowWholePropertyBooking"
                  checked={!!allowWholePropertyBooking}
                  onCheckedChange={(checked) =>
                    onChange({
                      allowWholePropertyBooking: !!checked,
                      settings: { ...(data.settings ?? {}), allowWholePropertyBooking: !!checked },
                    })
                  }
                />
                <div>
                  <Label htmlFor="allowWholePropertyBooking" className="font-normal">
                    Cho phép đặt cả property
                  </Label>
                  <p className="text-xs text-gray-500">Cho phép khách đặt toàn bộ property (nếu có nhiều site)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimumNotice">Thời gian báo trước tối thiểu (giờ)</Label>
                <Input
                  id="minimumNotice"
                  type="number"
                  value={minimumNotice || ""}
                  onChange={(e) =>
                    onChange({
                      minimumNotice: parseInt(e.target.value || "0"),
                      settings: { ...(data.settings ?? {}), minimumAdvanceNotice: parseInt(e.target.value || "0") },
                    })
                  }
                  min={0}
                  placeholder="24"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Khách phải đặt trước ít nhất X giờ</p>
              </div>

              <div>
                <Label htmlFor="advanceBooking">Đặt trước tối đa (ngày)</Label>
                <Input
                  id="advanceBooking"
                  type="number"
                  value={advanceBooking || ""}
                  onChange={(e) =>
                    onChange({
                      advanceBooking: parseInt(e.target.value || "1"),
                      settings: { ...(data.settings ?? {}), bookingWindow: parseInt(e.target.value || "1") },
                    })
                  }
                  min={1}
                  placeholder="365"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Khách có thể đặt trước tối đa X ngày</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in / Check-out instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn nhận/trả phòng</CardTitle>
            <CardDescription>Hướng dẫn ngắn cho khách khi nhận và trả chỗ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Check-in instructions</Label>
              <Textarea
                value={checkInInstructions}
                onChange={(e) =>
                  onChange({
                    checkInInstructions: e.target.value,
                    settings: { ...(data.settings ?? {}), checkInInstructions: e.target.value },
                  })
                }
                placeholder="Ví dụ: nhận chìa khóa tại quầy, giờ nhận phòng, mã cổng..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Check-out instructions</Label>
              <Textarea
                value={checkOutInstructions}
                onChange={(e) =>
                  onChange({
                    checkOutInstructions: e.target.value,
                    settings: { ...(data.settings ?? {}), checkOutInstructions: e.target.value },
                  })
                }
                placeholder="Ví dụ: trả chìa khóa, dọn dẹp, giờ trả phòng..."
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Timezone */}
        <Card>
          <CardHeader>
            <CardTitle>Múi giờ</CardTitle>
            <CardDescription>Chọn múi giờ của property</CardDescription>
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
