/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Calendar, Users, Car } from "lucide-react";
import { useState } from "react";

interface SitePricingProps {
  data: {
    basePrice: number;
    weekendPrice?: number;
    currency: string;
    minimumStay: number;
    maximumStay?: number;
    extraGuestFee?: number;
    extraVehicleFee?: number;
    seasonalPricing?: {
      enabled: boolean;
      seasons?: Array<{
        name: string;
        startDate: string;
        endDate: string;
        price: number;
      }>;
    };
    discounts?: {
      weekly?: number;
      monthly?: number;
    };
  };
  onChange: (data: any) => void;
}

export function SitePricing({ data, onChange }: SitePricingProps) {
  const [enableWeekendPricing, setEnableWeekendPricing] = useState(!!data.weekendPrice);
  const [enableSeasonalPricing, setEnableSeasonalPricing] = useState(
    data.seasonalPricing?.enabled || false
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thiết lập giá cho Site
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Cấu hình giá cả và các khoản phí bổ sung
        </p>
      </div>

      <div className="space-y-6">
        {/* Base Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Giá cơ bản
            </CardTitle>
            <CardDescription>
              Giá mỗi đêm cho site này
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="basePrice">
                Giá cơ bản (VNĐ/đêm) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="basePrice"
                type="number"
                value={data.basePrice}
                onChange={(e) =>
                  onChange({ basePrice: parseFloat(e.target.value) })
                }
                min="0"
                step="1000"
                placeholder="300000"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Giá áp dụng cho các ngày trong tuần
              </p>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <Label htmlFor="weekendPricing">Giá cuối tuần khác</Label>
                <p className="text-xs text-gray-500">
                  Thiết lập giá riêng cho thứ 7 & Chủ nhật
                </p>
              </div>
              <Switch
                id="weekendPricing"
                checked={enableWeekendPricing}
                onCheckedChange={(checked) => {
                  setEnableWeekendPricing(checked);
                  if (!checked) {
                    onChange({ weekendPrice: undefined });
                  }
                }}
              />
            </div>

            {enableWeekendPricing && (
              <div>
                <Label htmlFor="weekendPrice">Giá cuối tuần (VNĐ/đêm)</Label>
                <Input
                  id="weekendPrice"
                  type="number"
                  value={data.weekendPrice || data.basePrice}
                  onChange={(e) =>
                    onChange({ weekendPrice: parseFloat(e.target.value) })
                  }
                  min="0"
                  step="1000"
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stay Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Thời gian lưu trú
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimumStay">
                  Số đêm tối thiểu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="minimumStay"
                  type="number"
                  value={data.minimumStay}
                  onChange={(e) =>
                    onChange({ minimumStay: parseInt(e.target.value) })
                  }
                  min="1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maximumStay">Số đêm tối đa</Label>
                <Input
                  id="maximumStay"
                  type="number"
                  value={data.maximumStay || ""}
                  onChange={(e) =>
                    onChange({ maximumStay: parseInt(e.target.value) || undefined })
                  }
                  min="1"
                  placeholder="Không giới hạn"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extra Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Phí bổ sung</CardTitle>
            <CardDescription>
              Phí cho khách hoặc xe phụ trội
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="extraGuestFee" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Phí khách thêm (VNĐ/người/đêm)
                </Label>
                <Input
                  id="extraGuestFee"
                  type="number"
                  value={data.extraGuestFee || ""}
                  onChange={(e) =>
                    onChange({ extraGuestFee: parseFloat(e.target.value) || undefined })
                  }
                  min="0"
                  step="1000"
                  placeholder="0"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Áp dụng khi số khách vượt sức chứa cơ bản
                </p>
              </div>
              <div>
                <Label htmlFor="extraVehicleFee" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Phí xe thêm (VNĐ/xe/đêm)
                </Label>
                <Input
                  id="extraVehicleFee"
                  type="number"
                  value={data.extraVehicleFee || ""}
                  onChange={(e) =>
                    onChange({ extraVehicleFee: parseFloat(e.target.value) || undefined })
                  }
                  min="0"
                  step="1000"
                  placeholder="0"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phí cho mỗi xe vượt giới hạn
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discounts */}
        <Card>
          <CardHeader>
            <CardTitle>Giảm giá theo thời gian lưu trú</CardTitle>
            <CardDescription>
              Khuyến khích khách ở lâu hơn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weeklyDiscount">Giảm giá theo tuần (%)</Label>
                <Input
                  id="weeklyDiscount"
                  type="number"
                  value={data.discounts?.weekly || ""}
                  onChange={(e) =>
                    onChange({
                      discounts: {
                        ...data.discounts,
                        weekly: parseFloat(e.target.value) || undefined,
                      },
                    })
                  }
                  min="0"
                  max="100"
                  placeholder="10"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cho đặt 7 đêm trở lên
                </p>
              </div>
              <div>
                <Label htmlFor="monthlyDiscount">Giảm giá theo tháng (%)</Label>
                <Input
                  id="monthlyDiscount"
                  type="number"
                  value={data.discounts?.monthly || ""}
                  onChange={(e) =>
                    onChange({
                      discounts: {
                        ...data.discounts,
                        monthly: parseFloat(e.target.value) || undefined,
                      },
                    })
                  }
                  min="0"
                  max="100"
                  placeholder="20"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cho đặt 30 đêm trở lên
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Preview */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">Xem trước giá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">1 đêm (thứ 2-6):</span>
                <span className="font-semibold text-emerald-900">
                  {data.basePrice.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              {enableWeekendPricing && data.weekendPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-700">1 đêm (cuối tuần):</span>
                  <span className="font-semibold text-emerald-900">
                    {data.weekendPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              )}
              {data.discounts?.weekly && (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-700">7 đêm (giảm {data.discounts.weekly}%):</span>
                  <span className="font-semibold text-emerald-900">
                    {(data.basePrice * 7 * (1 - data.discounts.weekly / 100)).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              )}
              {data.discounts?.monthly && (
                <div className="flex justify-between">
                  <span className="text-gray-700">30 đêm (giảm {data.discounts.monthly}%):</span>
                  <span className="font-semibold text-emerald-900">
                    {(data.basePrice * 30 * (1 - data.discounts.monthly / 100)).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}