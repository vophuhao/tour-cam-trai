/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface SiteTypeSelectionProps {
  data: {
    siteType: "tent" | "rv" | "cabin" | "glamping" | "group";
  };
  onChange: (data: any) => void;
}

const SITE_TYPES = [
  {
    value: "tent",
    label: "Tent Site",
    description: "Vị trí dành cho lều cắm trại truyền thống",
    icon: "⛺",
    features: ["Phù hợp cho lều", "Mặt đất bằng phẳng", "Gần tiện ích chung"],
  },
  {
    value: "rv",
    label: "RV Site",
    description: "Vị trí cho xe RV/Campervan",
    icon: "🚐",
    features: ["Hookup điện", "Bãi đỗ rộng", "Cấp thoát nước"],
  },
  {
    value: "cabin",
    label: "Cabin",
    description: "Nhà gỗ hoặc bungalow",
    icon: "🏠",
    features: ["Có mái che", "Đồ nội thất", "Riêng tư cao"],
  },
  {
    value: "glamping",
    label: "Glamping",
    description: "Camping sang trọng với tiện nghi cao cấp",
    icon: "✨",
    features: ["Tiện nghi cao cấp", "Thiết kế độc đáo", "Trải nghiệm đặc biệt"],
  },
  {
    value: "group",
    label: "Group Site",
    description: "Khu vực lớn cho nhóm đông người",
    icon: "👥",
    features: ["Sức chứa lớn", "Khu vực rộng", "Phù hợp tổ chức sự kiện"],
  },
];

export function SiteTypeSelection({ data, onChange }: SiteTypeSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Loại Site
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Chọn loại vị trí cắm trại phù hợp nhất
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SITE_TYPES.map((type) => {
          const isSelected = data.siteType === type.value;
          return (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-emerald-600 border-2 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
              }`}
              onClick={() => onChange({ siteType: type.value })}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{type.icon}</div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {type.label}
                </h4>
                <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                <ul className="space-y-1">
                  {type.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-xs text-gray-600">
                      <span className="mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>

      {data.siteType && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-900">
            ✓ Đã chọn:{" "}
            <strong>
              {SITE_TYPES.find((t) => t.value === data.siteType)?.label}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}