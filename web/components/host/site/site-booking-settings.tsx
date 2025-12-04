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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Clock, Settings } from "lucide-react";

interface SiteBookingSettingsProps {
  data: {
    status: "available" | "unavailable" | "maintenance";
    instantBooking: boolean;
    requireApproval: boolean;
    advanceNotice: number;
    prepTimeHours?: number;
    bufferDays?: number;
  };
  onChange: (data: any) => void;
}

export function SiteBookingSettings({ data, onChange }: SiteBookingSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cài đặt đặt chỗ cho Site
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Cấu hình cách khách có thể đặt site này
        </p>
      </div>

      <div className="space-y-6">
        {/* Site Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Trạng thái Site
            </CardTitle>
            <CardDescription>
              Kiểm soát tình trạng hoạt động của site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="siteStatus">Trạng thái hiện tại</Label>
              <Select
                value={data.status}
                onValueChange={(value: any) => onChange({ status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div>
                        <div className="font-semibold">Sẵn sàng</div>
                        <div className="text-xs text-gray-500">
                          Khách có thể đặt site này
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="unavailable">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <div>
                        <div className="font-semibold">Không khả dụng</div>
                        <div className="text-xs text-gray-500">
                          Site tạm ngưng nhận khách
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <div>
                        <div className="font-semibold">Bảo trì</div>
                        <div className="text-xs text-gray-500">
                          Đang sửa chữa, bảo dưỡng
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Booking Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Tùy chọn đặt chỗ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <Label htmlFor="instantBooking" className="text-base">
                  Đặt chỗ ngay lập tức
                </Label>
                <p className="text-sm text-gray-500">
                  Khách có thể đặt mà không cần chờ phê duyệt
                </p>
              </div>
              <Switch
                id="instantBooking"
                checked={data.instantBooking}
                onCheckedChange={(checked) => {
                  onChange({
                    instantBooking: checked,
                    requireApproval: !checked,
                  });
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="requireApproval" className="text-base">
                  Yêu cầu phê duyệt
                </Label>
                <p className="text-sm text-gray-500">
                  Bạn phải chấp nhận từng yêu cầu đặt chỗ
                </p>
              </div>
              <Switch
                id="requireApproval"
                checked={data.requireApproval}
                onCheckedChange={(checked) => {
                  onChange({
                    requireApproval: checked,
                    instantBooking: !checked,
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cài đặt thời gian
            </CardTitle>
            <CardDescription>
              Thời gian báo trước và chuẩn bị
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="advanceNotice">
                Thời gian báo trước tối thiểu (giờ)
              </Label>
              <Input
                id="advanceNotice"
                type="number"
                value={data.advanceNotice}
                onChange={(e) =>
                  onChange({ advanceNotice: parseInt(e.target.value) })
                }
                min="0"
                step="1"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Khách phải đặt trước ít nhất bao nhiêu giờ
              </p>
            </div>

            <div>
              <Label htmlFor="prepTimeHours">
                Thời gian chuẩn bị (giờ)
              </Label>
              <Input
                id="prepTimeHours"
                type="number"
                value={data.prepTimeHours || ""}
                onChange={(e) =>
                  onChange({ prepTimeHours: parseInt(e.target.value) || undefined })
                }
                min="0"
                placeholder="0"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Thời gian cần để chuẩn bị site giữa các booking
              </p>
            </div>

            <div>
              <Label htmlFor="bufferDays">
                Khoảng cách tối thiểu giữa các booking (ngày)
              </Label>
              <Input
                id="bufferDays"
                type="number"
                value={data.bufferDays || ""}
                onChange={(e) =>
                  onChange({ bufferDays: parseInt(e.target.value) || undefined })
                }
                min="0"
                placeholder="0"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Số ngày trống tối thiểu giữa các lượt khách
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">Tóm tắt cài đặt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  data.status === 'available' ? 'bg-green-500' :
                  data.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-gray-700">
                  Trạng thái: <strong>{
                    data.status === 'available' ? 'Sẵn sàng' :
                    data.status === 'maintenance' ? 'Bảo trì' : 'Không khả dụng'
                  }</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-gray-700">
                  {data.instantBooking ? 'Đặt ngay lập tức' : 'Cần phê duyệt'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span className="text-gray-700">
                  Báo trước tối thiểu: <strong>{data.advanceNotice} giờ</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}