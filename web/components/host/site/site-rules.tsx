/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Plus, Package, FileText } from "lucide-react";

interface SiteRulesProps {
  data: {
    guestsShouldBring?: string[];
    siteSpecificRules?: string[];
  };
  onChange: (data: { guestsShouldBring: string[]; siteSpecificRules: string[] }) => void;
}

export function SiteRules({ data, onChange }: SiteRulesProps) {
  const [newBring, setNewBring] = useState("");
  const [newRule, setNewRule] = useState("");

  const guestsShouldBring = data.guestsShouldBring ?? [];
  const siteSpecificRules = data.siteSpecificRules ?? [];

  const addBring = () => {
    if (newBring.trim()) {
      onChange({
        guestsShouldBring: [...guestsShouldBring, newBring.trim()],
        siteSpecificRules,
      });
      setNewBring("");
    }
  };

  const removeBring = (index: number) => {
    onChange({
      guestsShouldBring: guestsShouldBring.filter((_, i) => i !== index),
      siteSpecificRules,
    });
  };

  const addRule = () => {
    if (newRule.trim()) {
      onChange({
        guestsShouldBring,
        siteSpecificRules: [...siteSpecificRules, newRule.trim()],
      });
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    onChange({
      guestsShouldBring,
      siteSpecificRules: siteSpecificRules.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-semibold text-gray-900 mb-2">Quy định & Vật dụng</p>
        <p className="text-sm text-gray-500">Hướng dẫn khách mang gì và quy tắc của site</p>
      </div>

      <div className="space-y-6">
        {/* Guests Should Bring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Khách nên mang theo
            </CardTitle>
            <CardDescription>
              Danh sách vật dụng khách cần chuẩn bị (VD: sleeping_bag, tent, flashlight)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="VD: sleeping_bag"
                value={newBring}
                onChange={(e) => setNewBring(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBring()}
              />
              <Button onClick={addBring}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 space-y-2">
              {guestsShouldBring.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 p-3 border rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-700 break-all flex-1">{item}</div>
                  <Button variant="ghost" size="sm" onClick={() => removeBring(idx)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {guestsShouldBring.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-4">Chưa có item nào</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Site Specific Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quy định riêng của site
            </CardTitle>
            <CardDescription>
              Các quy tắc đặc biệt áp dụng cho site này (tối đa 500 ký tự/quy định)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="VD: Không đốt lửa trên bãi cỏ, giữ yên lặng từ 22:00..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{newRule.length}/500</span>
              <Button onClick={addRule} disabled={!newRule.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Thêm quy định
              </Button>
            </div>

            <div className="mt-3 space-y-2">
              {siteSpecificRules.map((r, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 p-3 border rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-700 flex-1">{r}</div>
                  <Button variant="ghost" size="sm" onClick={() => removeRule(idx)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}

              {siteSpecificRules.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-4">Chưa có quy định nào</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}