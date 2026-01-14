/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface PropertyRulesProps {
  data: {
    checkInTime: string;
    checkOutTime: string;
    quietHours?: {
      start: string;
      end: string;
      enforced: boolean;
    };
    minimumAge?: number;
    maxGuests?: number;
    petsAllowed: boolean;
    petRules?: string[];
    smokingAllowed: boolean;
    alcoholPolicy?: "allowed" | "restricted" | "prohibited";
    musicPolicy?: "allowed" | "quiet_hours_only" | "prohibited";
    customRules?: string[];
  };
  onChange: (data: any) => void;
}

export function PropertyRules({ data, onChange }: PropertyRulesProps) {
  const [newPetRule, setNewPetRule] = useState("");
  const [newCustomRule, setNewCustomRule] = useState("");

  const addPetRule = () => {
    if (newPetRule.trim()) {
      onChange({
        petRules: [...(data.petRules || []), newPetRule.trim()],
      });
      setNewPetRule("");
    }
  };

  const removePetRule = (index: number) => {
    onChange({
      petRules: data.petRules?.filter((_, i) => i !== index),
    });
  };

  const addCustomRule = () => {
    if (newCustomRule.trim()) {
      onChange({
        customRules: [...(data.customRules || []), newCustomRule.trim()],
      });
      setNewCustomRule("");
    }
  };

  const removeCustomRule = (index: number) => {
    onChange({
      customRules: data.customRules?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quy định Property
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Thiết lập các quy tắc và chính sách cho property của bạn
        </p>
      </div>

      <div className="space-y-6">
        {/* Check-in/Check-out Times */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Giờ nhận/trả phòng</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkInTime">Giờ check-in</Label>
              <Input
                id="checkInTime"
                type="time"
                value={data.checkInTime}
                onChange={(e) => onChange({ checkInTime: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="checkOutTime">Giờ check-out</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={data.checkOutTime}
                onChange={(e) => onChange({ checkOutTime: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Giờ yên tĩnh</h4>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="quietHoursEnforced"
              checked={data.quietHours?.enforced}
              onCheckedChange={(checked) =>
                onChange({
                  quietHours: { ...data.quietHours, enforced: !!checked },
                })
              }
            />
            <Label htmlFor="quietHoursEnforced" className="font-normal">
              Áp dụng giờ yên tĩnh
            </Label>
          </div>
          {data.quietHours?.enforced && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quietStart">Bắt đầu</Label>
                <Input
                  id="quietStart"
                  type="time"
                  value={data.quietHours?.start}
                  onChange={(e) =>
                    onChange({
                      quietHours: { ...data.quietHours, start: e.target.value },
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="quietEnd">Kết thúc</Label>
                <Input
                  id="quietEnd"
                  type="time"
                  value={data.quietHours?.end}
                  onChange={(e) =>
                    onChange({
                      quietHours: { ...data.quietHours, end: e.target.value },
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Guest Restrictions */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Giới hạn khách</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimumAge">Độ tuổi tối thiểu</Label>
              <Input
                id="minimumAge"
                type="number"
                value={data.minimumAge || ""}
                onChange={(e) =>
                  onChange({ minimumAge: parseInt(e.target.value) })
                }
                min="0"
                placeholder="18"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxGuests">Số khách tối đa</Label>
              <Input
                id="maxGuests"
                type="number"
                value={data.maxGuests || ""}
                onChange={(e) =>
                  onChange({ maxGuests: parseInt(e.target.value) })
                }
                min="1"
                placeholder="50"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Pet Policy */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Chính sách thú cưng</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="petsAllowed"
              checked={data.petsAllowed}
              onCheckedChange={(checked) =>
                onChange({ petsAllowed: !!checked })
              }
            />
            <Label htmlFor="petsAllowed" className="font-normal">
              Cho phép thú cưng
            </Label>
          </div>
          {data.petsAllowed && (
            <div className="space-y-3">
              <Label>Quy định về thú cưng</Label>
              <div className="space-y-2">
                {data.petRules?.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm">{rule}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removePetRule(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newPetRule}
                  onChange={(e) => setNewPetRule(e.target.value)}
                  placeholder="VD: Thú cưng phải được xích..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPetRule();
                    }
                  }}
                />
                <Button type="button" onClick={addPetRule} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Smoking Policy */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Chính sách hút thuốc</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="smokingAllowed"
              checked={data.smokingAllowed}
              onCheckedChange={(checked) =>
                onChange({ smokingAllowed: !!checked })
              }
            />
            <Label htmlFor="smokingAllowed" className="font-normal">
              Cho phép hút thuốc
            </Label>
          </div>
        </div>

        {/* Alcohol & Music Policy */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Chính sách khác</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alcoholPolicy">Rượu bia</Label>
              <Select
                value={data.alcoholPolicy}
                onValueChange={(value: any) =>
                  onChange({ alcoholPolicy: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn chính sách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowed">Cho phép</SelectItem>
                  <SelectItem value="restricted">Hạn chế</SelectItem>
                  <SelectItem value="prohibited">Cấm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="musicPolicy">Nhạc/Tiếng ồn</Label>
              <Select
                value={data.musicPolicy}
                onValueChange={(value: any) =>
                  onChange({ musicPolicy: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn chính sách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowed">Cho phép</SelectItem>
                  <SelectItem value="quiet_hours_only">Chỉ giờ yên tĩnh</SelectItem>
                  <SelectItem value="prohibited">Cấm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Custom Rules */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Quy định tùy chỉnh</h4>
          <div className="space-y-2">
            {data.customRules?.map((rule, index) => (
              <div
                key={index}
                className="flex items-start justify-between bg-gray-50 p-3 rounded"
              >
                <span className="text-sm flex-1">{rule}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCustomRule(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={newCustomRule}
              onChange={(e) => setNewCustomRule(e.target.value)}
              placeholder="Thêm quy định khác..."
              rows={2}
            />
            <Button type="button" onClick={addCustomRule} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}