"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Province = { code: number; name: string };
type District = { code: number; name: string };

type AddressPayload = {
  fullName: string;
  phone: string;
  addressLine: string;
  province: string;
  provinceCode?: number;
  district?: string;
  districtCode?: number;
};

type Props = {
  initial?: Partial<AddressPayload>;
  onSave: (addr: AddressPayload) => void | Promise<void>;
  onClose: () => void;
};

export default function AddressModal({ initial = {}, onSave, onClose }: Props) {
  const [fullName, setFullName] = useState(initial.fullName || "");
  const [phone, setPhone] = useState(initial.phone || "");
  const [addressLine, setAddressLine] = useState(initial.addressLine || "");
  const [provinceCode, setProvinceCode] = useState<number | "">(
    initial.provinceCode ?? ""
  );
  const [provinceName, setProvinceName] = useState(initial.province || "");
  const [districtCode, setDistrictCode] = useState<number | "">(
    initial.districtCode ?? ""
  );
  const [districtName, setDistrictName] = useState(initial.district || "");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvs, setLoadingProvs] = useState(false);
  const [loadingDists, setLoadingDists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch provinces on mount
  useEffect(() => {
    let mounted = true;
    const fetchProvinces = async () => {
      setLoadingProvs(true);
      setError(null);
      try {
        // API: list provinces
        const res = await axios.get("https://provinces.open-api.vn/api/v2/");
        const data = res.data;
        // try to normalize: api may return array or object
        const list: Province[] = Array.isArray(data) ? data : data?.provinces ?? [];
        if (mounted) setProvinces(list);
      } catch (err) {
        setError("Không tải được danh sách tỉnh/thành.");
      } finally {
        if (mounted) setLoadingProvs(false);
      }
    };
    fetchProvinces();
    return () => {
      mounted = false;
    };
  }, []);

  // fetch districts when provinceCode changes
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      setDistrictName("");
      return;
    }
    let mounted = true;
    const fetchDistricts = async () => {
      setLoadingDists(true);
      setError(null);
      try {
        // API: districts for a province. using ?p=CODE as provided.
        const res = await axios.get(`https://provinces.open-api.vn/api/v2/w/?province=${provinceCode}`);
        const data = res.data;
        // possible shapes: array of districts, or object with districts property
        const list: District[] = Array.isArray(data)
          ? data
          : data?.districts
          ? data.districts
          : data?.items ?? [];
        if (mounted) setDistricts(list);
      } catch (err) {
        setError("Không tải được danh sách quận/huyện.");
        setDistricts([]);
      } finally {
        if (mounted) setLoadingDists(false);
      }
    };
    fetchDistricts();
    return () => {
      mounted = false;
    };
  }, [provinceCode]);

  // when user picks a province code, set provinceName from list
  useEffect(() => {
    if (!provinceCode) return;
    const p = provinces.find((x) => x.code === provinceCode);
    if (p) setProvinceName(p.name);
  }, [provinceCode, provinces]);

  // when user picks district code, set districtName from list
  useEffect(() => {
    if (!districtCode) return;
    const d = districts.find((x) => x.code === districtCode);
    if (d) setDistrictName(d.name);
  }, [districtCode, districts]);

  const canSave =
    fullName.trim().length > 1 &&
    phone.trim().length >= 7 &&
    addressLine.trim().length > 3 &&
    !!provinceName &&
    !!districtName;

  const handleSave = async () => {
    if (!canSave) return;
    setError(null);
    try {
      await onSave({
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        province: provinceName,
        provinceCode: typeof provinceCode === "number" ? provinceCode : undefined,
        district: districtName,
        districtCode: typeof districtCode === "number" ? districtCode : undefined,
      });
      onClose();
    } catch (err) {
      setError("Lưu địa chỉ thất bại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-5">
        <h3 className="text-lg font-semibold mb-3">Thêm địa chỉ mới</h3>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <div className="space-y-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Họ và tên"
            className="w-full p-3 border rounded-lg"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Số điện thoại"
            className="w-full p-3 border rounded-lg"
          />
          <input
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="Địa chỉ cụ thể (số nhà, ngõ,... )"
            className="w-full p-3 border rounded-lg"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Tỉnh / Thành</label>
              <select
                value={provinceCode ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setProvinceCode(v === "" ? "" : Number(v));
                }}
                className="w-full p-3 border rounded-lg mt-1"
              >
                <option value="">-- Chọn tỉnh/thành --</option>
                {loadingProvs ? (
                  <option value="">Đang tải...</option>
                ) : (
                  provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Quận / Huyện</label>
              <select
                value={districtCode ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDistrictCode(v === "" ? "" : Number(v));
                }}
                className="w-full p-3 border rounded-lg mt-1"
                disabled={!provinceCode || loadingDists}
              >
                <option value="">-- Chọn quận/huyện --</option>
                {loadingDists ? (
                  <option value="">Đang tải...</option>
                ) : (
                  districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`px-4 py-2 rounded-lg text-white ${
                canSave ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}