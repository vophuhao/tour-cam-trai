/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RefundRule {
  daysBeforeCheckIn: number;
  refundPercentage: number;
}

interface PropertyRule {
  text: string;
  category: "pets" | "noise" | "fire" | "general";
  order: number;
}

interface PropertyPoliciesProps {
  data: {
    cancellationPolicy?: {
      type?: "flexible" | "moderate" | "strict" | "super_strict";
      description?: string;
      refundRules?: RefundRule[];
    };
    depositRequired?: boolean;
    depositAmount?: number;
    depositType?: "fixed" | "percentage";
    refundPolicy?: string;
    paymentMethods?: string[];
    rules?: PropertyRule[];
  };
  onChange: (data: any) => void;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank_transfer", label: "Chuyển khoản" },
  { value: "credit_card", label: "Thẻ tín dụng" },
  { value: "momo", label: "MoMo" },
  { value: "zalopay", label: "ZaloPay" },
];

export function PropertyPolicies({ data, onChange }: PropertyPoliciesProps) {
  // Helpers for cancellationPolicy
  const cp = data.cancellationPolicy ?? { type: "moderate", description: "", refundRules: [] as RefundRule[] };

  const updateCancellation = (patch: Partial<typeof cp>) => {
    onChange({ cancellationPolicy: { ...cp, ...patch } });
  };

  const addRefundRule = () => {
    const list = [...(cp.refundRules ?? [])];
    list.push({ daysBeforeCheckIn: 0, refundPercentage: 0 });
    updateCancellation({ refundRules: list });
  };

  const updateRefundRule = (idx: number, patch: Partial<RefundRule>) => {
    const list = (cp.refundRules ?? []).map((r, i) => (i === idx ? { ...r, ...patch } : r));
    updateCancellation({ refundRules: list });
  };

  const removeRefundRule = (idx: number) => {
    const list = (cp.refundRules ?? []).filter((_, i) => i !== idx);
    updateCancellation({ refundRules: list });
  };

  // Helpers for payment methods
  const togglePaymentMethod = (method: string) => {
    const current = data.paymentMethods ?? [];
    const updated = current.includes(method) ? current.filter((m) => m !== method) : [...current, method];
    onChange({ paymentMethods: updated });
  };

  // Helpers for rules
  const rulesList = data.rules ?? [];

  const addRule = () => {
    const list = [...rulesList, { text: "", category: "general", order: rulesList.length }];
    onChange({ rules: list });
  };

  const updateRule = (idx: number, patch: Partial<PropertyRule>) => {
    const list = rulesList.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange({ rules: list });
  };

  const removeRule = (idx: number) => {
    const list = rulesList.filter((_, i) => i !== idx).map((r, i) => ({ ...r, order: i }));
    onChange({ rules: list });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chính sách & Quy định</h3>
        <p className="text-sm text-gray-500">Thiết lập chính sách hủy, hoàn tiền, đặt cọc và các quy định của property.</p>
      </div>

      <div className="space-y-6">
        {/* Cancellation Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Chính sách hủy</CardTitle>
            <CardDescription>Chọn mức độ linh hoạt và quy tắc hoàn tiền theo ngày.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Loại chính sách</Label>
              <Select
                value={cp.type || "moderate"}
                onValueChange={(value: any) => updateCancellation({ type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Linh hoạt (refund sớm)</SelectItem>
                  <SelectItem value="moderate">Vừa phải</SelectItem>
                  <SelectItem value="strict">Nghiêm ngặt</SelectItem>
                  <SelectItem value="super_strict">Rất nghiêm ngặt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Chi tiết chính sách (mô tả)</Label>
              <Textarea
                value={cp.description || ""}
                onChange={(e) => updateCancellation({ description: e.target.value })}
                placeholder="Mô tả chi tiết về chính sách hủy..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Quy tắc hoàn tiền (refund rules)</Label>
                <Button size="sm" onClick={addRefundRule}>Thêm quy tắc</Button>
              </div>

              <div className="space-y-2">
                {(cp.refundRules ?? []).length === 0 && (
                  <p className="text-xs text-gray-500">Chưa có quy tắc hoàn tiền. Thêm quy tắc nếu muốn.</p>
                )}

                {(cp.refundRules ?? []).map((r, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-white border rounded-md p-3">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <Label>Ngày trước check-in</Label>
                        <Input
                          type="number"
                          value={r.daysBeforeCheckIn}
                          onChange={(e) => updateRefundRule(idx, { daysBeforeCheckIn: Math.max(0, parseInt(e.target.value || "0")) })}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-400 mt-1">Số ngày</p>
                      </div>

                      <div>
                        <Label>Phần trăm hoàn tiền (%)</Label>
                        <Input
                          type="number"
                          value={r.refundPercentage}
                          onChange={(e) => {
                            const v = Math.min(100, Math.max(0, parseInt(e.target.value || "0")));
                            updateRefundRule(idx, { refundPercentage: v });
                          }}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-400 mt-1">0 - 100%</p>
                      </div>
                    </div>

                    <div>
                      <Button size="sm" variant="ghost" onClick={() => removeRefundRule(idx)}>Xóa</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Đặt cọc & Thanh toán</CardTitle>
            <CardDescription>Thiết lập yêu cầu đặt cọc và phương thức thanh toán.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="depositRequired"
                checked={!!data.depositRequired}
                onCheckedChange={(checked) => onChange({ depositRequired: !!checked })}
              />
              <Label htmlFor="depositRequired" className="font-normal">Yêu cầu đặt cọc</Label>
            </div>

            {data.depositRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Loại đặt cọc</Label>
                  <Select
                    value={data.depositType || "fixed"}
                    onValueChange={(value: any) => onChange({ depositType: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Số tiền cố định</SelectItem>
                      <SelectItem value="percentage">Phần trăm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Số tiền / Phần trăm</Label>
                  <Input
                    type="number"
                    value={data.depositAmount ?? ""}
                    onChange={(e) => onChange({ depositAmount: parseFloat(e.target.value || "0") })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            

            <div>
              <Label>Ghi chú hoàn tiền / thanh toán</Label>
              <Textarea
                value={data.refundPolicy || ""}
                onChange={(e) => onChange({ refundPolicy: e.target.value })}
                placeholder="Mô tả quy trình hoàn tiền hoặc ghi chú liên quan đến thanh toán"
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Quy định của property</CardTitle>
            <CardDescription>Danh sách các quy định (ví dụ: không đưa thú cưng, giữ trật tự, lửa trại...)</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Quy định</Label>
              <Button size="sm" onClick={addRule}>Thêm quy định</Button>
            </div>

            <div className="space-y-2">
              {rulesList.length === 0 && <p className="text-xs text-gray-500">Chưa có quy định nào</p>}

              {rulesList.map((r, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-white border rounded-md p-3">
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label className="text-xs">Nội dung</Label>
                      <Input
                        value={r.text}
                        onChange={(e) => updateRule(idx, { text: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2 items-center">
                      <div className="w-36">
                        <Label className="text-xs">Loại</Label>
                        <Select
                          value={r.category}
                          onValueChange={(v: any) => updateRule(idx, { category: v })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="pets">Pets</SelectItem>
                            <SelectItem value="noise">Noise</SelectItem>
                            <SelectItem value="fire">Fire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-28">
                        <Label className="text-xs">Thứ tự</Label>
                        <Input
                          type="number"
                          value={r.order}
                          onChange={(e) => updateRule(idx, { order: parseInt(e.target.value || "0") })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Button size="sm" variant="ghost" onClick={() => removeRule(idx)}>Xóa</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}