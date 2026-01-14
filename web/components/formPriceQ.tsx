import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TourBooking() {
  type FormState = {
    fullName: string;
    email: string;
    confirmEmail: string;
    phone: string;
    adults: number;
    children: number;
    babies: number;
    hotel: string;
    note: string;
  };

  type NumericKey = "adults" | "children" | "babies";

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    confirmEmail: "",
    phone: "",
    adults: 0,
    children: 0,
    babies: 0,
    hotel: "",
    note: "",
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const inc = (key: NumericKey) => update(key, (form[key] as number) + 1);
  const dec = (key: NumericKey) => update(key, (form[key] as number) > 0 ? (form[key] as number) - 1 : 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      {/* Thông tin người phụ trách */}
      <div className="space-y-4">
        <h2 className="font-semibold text-xl">Thông tin người phụ trách</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label>Họ & Tên *</label>
            <Input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label>Email</label>
            <Input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label>Điện Thoại *</label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label>Xác Nhận Email</label>
            <Input
              value={form.confirmEmail}
              onChange={(e) => update("confirmEmail", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Thông tin yêu cầu hành trình */}
      <div className="space-y-4">
        <h2 className="font-semibold text-xl">Thông tin yêu cầu hành trình</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Người lớn */}
          <div className="space-y-2">
            <label>Số lượng người lớn *</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => dec("adults")}>-</Button>
              <div className="w-12 text-center">{form.adults}</div>
              <Button variant="outline" onClick={() => inc("adults")}>+</Button>
            </div>
          </div>

          {/* Em bé */}
          <div className="space-y-2">
            <label>Số lượng em bé</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => dec("babies")}>-</Button>
              <div className="w-12 text-center">{form.babies}</div>
              <Button variant="outline" onClick={() => inc("babies")}>+</Button>
            </div>
          </div>

          {/* Trẻ em */}
          <div className="space-y-2">
            <label>Số lượng trẻ em</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => dec("children")}>-</Button>
              <div className="w-12 text-center">{form.children}</div>
              <Button variant="outline" onClick={() => inc("children")}>+</Button>
            </div>
          </div>

          {/* Chuẩn khách sạn */}
          <div className="space-y-2">
            <label>Chuẩn Khách Sạn</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.hotel}
              onChange={(e) => update("hotel", e.target.value)}
            >
              <option value="">Chọn</option>
              <option value="3-star">3 Sao</option>
              <option value="4-star">4 Sao</option>
              <option value="5-star">5 Sao</option>
            </select>
          </div>
        </div>

        {/* Yêu cầu khác */}
        <div className="space-y-2">
          <label>Yêu Cầu Khác</label>
          <Textarea
            rows={4}
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 text-right">
        <Button>Gửi yêu cầu</Button>
      </div>
    </div>
  );
}
