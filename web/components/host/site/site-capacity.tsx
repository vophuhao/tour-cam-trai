/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Capacity {
  maxGuests?: number;
  maxAdults?: number;
  maxChildren?: number;
  maxInfants?: number;
  maxPets?: number;
  maxVehicles?: number;
  maxTents?: number;
  maxRVs?: number;
  rvMaxLength?: number;
  maxConcurrentBookings?: number;
}

interface SiteCapacityProps {
  data: Capacity | undefined;
  accommodationType?: string;
  onChange: (newCapacity: Capacity) => void;
}

export function SiteCapacity({ data, accommodationType, onChange }: SiteCapacityProps) {
  const capacity: Capacity = data ?? {};

  const updateField = (field: keyof Capacity, value: any) => {
    onChange({ ...capacity, [field]: value });
  };

  const safe = (v: any, d: any = "") => (v === undefined || v === null ? d : v);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-semibold text-gray-900 mb-2">Sức chứa</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="maxGuests">Số khách tối đa <span className="text-red-500">*</span></Label>
          <Input
            id="maxGuests"
            type="number"
            value={String(safe(capacity.maxGuests, ""))}
            onChange={(e) => updateField("maxGuests", e.target.value === "" ? undefined : Number(e.target.value))}
            min={1}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="maxAdults">Số người lớn tối đa</Label>
          <Input
            id="maxAdults"
            type="number"
            value={String(safe(capacity.maxAdults, ""))}
            onChange={(e) => updateField("maxAdults", e.target.value === "" ? undefined : Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="maxChildren">Số trẻ em tối đa</Label>
          <Input
            id="maxChildren"
            type="number"
            value={String(safe(capacity.maxChildren, ""))}
            onChange={(e) => updateField("maxChildren", e.target.value === "" ? undefined : Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="maxInfants">Số trẻ sơ sinh tối đa</Label>
          <Input
            id="maxInfants"
            type="number"
            value={String(safe(capacity.maxInfants, ""))}
            onChange={(e) => updateField("maxInfants", e.target.value === "" ? undefined : Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="maxPets">Số thú cưng tối đa</Label>
          <Input
            id="maxPets"
            type="number"
            value={String(safe(capacity.maxPets, ""))}
            onChange={(e) => updateField("maxPets", e.target.value === "" ? undefined : Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="maxVehicles">Số phương tiện tối đa</Label>
          <Input
            id="maxVehicles"
            type="number"
            value={String(safe(capacity.maxVehicles, ""))}
            onChange={(e) => updateField("maxVehicles", e.target.value === "" ? undefined : Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="maxTents">Số lều tối đa</Label>
          <Input
            id="maxTents"
            type="number"
            value={String(safe(capacity.maxTents, ""))}
            onChange={(e) => updateField("maxTents", e.target.value === "" ? undefined : Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="maxConcurrentBookings">
            Booking đồng thời tối đa <span className="text-red-500">*</span>
          </Label>
          <Input
            id="maxConcurrentBookings"
            type="number"
            value={String(safe(capacity.maxConcurrentBookings, 1))}
            onChange={(e) => updateField("maxConcurrentBookings", e.target.value === "" ? 1 : Number(e.target.value))}
            min={1}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">1 = designated site, &gt;1 = undesignated</p>
        </div>

        {/* RV specific */}
        {accommodationType === "rv" && (
          <>
            <div>
              <Label htmlFor="maxRVs">Số RV tối đa</Label>
              <Input
                id="maxRVs"
                type="number"
                value={String(safe(capacity.maxRVs, ""))}
                onChange={(e) => updateField("maxRVs", e.target.value === "" ? undefined : Number(e.target.value))}
                min={0}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="rvMaxLength">Chiều dài RV tối đa (feet)</Label>
              <Input
                id="rvMaxLength"
                type="number"
                value={String(safe(capacity.rvMaxLength, ""))}
                onChange={(e) => updateField("rvMaxLength", e.target.value === "" ? undefined : Number(e.target.value))}
                min={0}
                className="mt-1"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}