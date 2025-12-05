// ...existing code...
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/host/property/step-indicator";
import { PropertyBasicInfo } from "@/components/host/property/property-basic-info";
import { PropertyLocation } from "@/components/host/property/property-location";
import { PropertyPhotos } from "@/components/host/property/property-photo";
import { PropertyPolicies } from "@/components/host/property/property-policies";
import { PropertySettings } from "@/components/host/property/property-settings";

import { createProperty, uploadMedia } from "@/lib/client-actions";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const STEPS = [
  { label: "Cơ bản", description: "Thông tin property" },
  { label: "Vị trí", description: "Địa chỉ và bản đồ" },
  { label: "Hình ảnh", description: "Ảnh property" },
  { label: "Chính sách", description: "Hủy & hoàn tiền" },
  { label: "Hoàn tất", description: "Cài đặt cuối" },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);

  // typed shapes for the form data to ensure cancellationPolicy.type is the expected union
  type RefundRule = { daysBeforeCheckIn: number; refundPercentage: number };
  type PropertyRule = { text: string; category: "pets" | "noise" | "fire" | "general"; order: number };
  type CancellationType = "moderate" | "super_strict" | "strict" | "flexible";

  interface Policies {
    cancellationPolicy: { type: CancellationType; description: string; refundRules: RefundRule[] };
    depositRequired: boolean;
    depositAmount: number;
    depositType: "fixed" | "percentage";
    refundPolicy: string;
    paymentMethods: string[];
    rules: PropertyRule[];
  }

  interface FormDataType {
    basicInfo: any;
    location: any;
    photos: File[];
    policies: Policies;
    settings: any;
  }

  const [formData, setFormData] = useState<FormDataType>({
    basicInfo: {
      name: "",
      tagline: "",
      description: "",
      propertyType: "campground" as "private_land" | "farm" | "ranch" | "campground",
      landSize: { value: 0, unit: "square_meters" as "square_meters" | "hectares" | "acres" },
      nearbyAttractions: [] as { name: string; distance?: number; type?: string }[],
      status: "pending_approval" as "active" | "inactive" | "pending_approval" | "suspended",
      isActive: false,
      isFeatured: false,
    },
    location: {
      address: "",
      city: "",
      state: "",
      country: "Vietnam",
      zipCode: "",
      coordinates: { type: "Point" as const, coordinates: [0, 0] as [number, number] },
      directions: "",
      parkingInstructions: "",
    },
    photos: [] as File[],
    policies: {
      cancellationPolicy: { type: "moderate", description: "", refundRules: [] as RefundRule[] },
      depositRequired: false,
      depositAmount: 0,
      depositType: "fixed" as "fixed" | "percentage",
      refundPolicy: "",
      paymentMethods: [] as string[],
      rules: [] as PropertyRule[],
    },
    settings: {
      instantBookEnabled: false,
      requireApproval: true,
      minimumAdvanceNotice: 24,
      bookingWindow: 365,
      allowWholePropertyBooking: false,
      // UI helpers
      status: "draft" as "draft" | "published" | "suspended",
      visibility: "public" as "public" | "private" | "unlisted",
      timezone: "Asia/Ho_Chi_Minh",
    },
  });

  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      toast.success("Tạo property thành công!");
      router.push("/host/properties");
    },
    onError: (err: any) => {
      console.error("Create property error:", err);
      toast.error(err?.message || "Có lỗi xảy ra khi tạo property");
    },
  });

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleStepClick = (idx: number) => {
    setCurrentStep(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const uploadAllPhotos = async (files: File[]) => {
    const uploaded: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append("files", file);
      fd.append("folder", "properties");
      const res = await uploadMedia(fd);
      // read metadata from global uploader if provided by component
      const getMetadata = (window as any).__propertyPhotosMetadata;
      const metadata = getMetadata ? getMetadata() : [];
      const meta = metadata[i] ?? { caption: "", isCover: i === 0, order: i };
      const imageUrl = Array.isArray(res.data) ? res.data[0] : res.data;
      uploaded.push({
        url: imageUrl,
        caption: meta.caption || "",
        isCover: !!meta.isCover,
        order: meta.order ?? i,
        uploadedAt: new Date().toISOString(),
      });
      toast.loading(`Upload ảnh ${i + 1}/${files.length}...`, { id: "upload-progress" });
    }
    toast.dismiss("upload-progress");
    return uploaded;
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);

      // basic validation
      const b = formData.basicInfo;
      const l = formData.location;
      if (!b.name?.trim() || !b.description?.trim()) {
        toast.error("Vui lòng điền đầy đủ thông tin cơ bản!");
        return;
      }
      if (!l.address?.trim() || !l.city?.trim() || !l.state?.trim()) {
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ!");
        return;
      }
      if (formData.photos.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 ảnh!");
        return;
      }

      toast.info(`Đang upload ${formData.photos.length} ảnh...`);
      const uploadedPhotos = await uploadAllPhotos(formData.photos);

      if (uploadedPhotos.length === 0) {
        toast.error("Không có ảnh nào được upload thành công!");
        return;
      }

      // prepare cancellation policy
      const rawCp = formData.policies.cancellationPolicy || { type: "moderate", description: "", refundRules: [] };
      const cpType = (rawCp as any).type === "super_strict" ? "strict" : (rawCp as any).type;

      const payload: any = {
        name: b.name.trim(),
        slug: undefined, // server should create slug if needed
        tagline: b.tagline?.trim() || undefined,
        description: b.description.trim(),
        propertyType: b.propertyType,
        landSize: b.landSize && b.landSize.value > 0 ? { value: b.landSize.value, unit: b.landSize.unit } : undefined,
        location: {
          address: l.address.trim(),
          city: l.city.trim(),
          state: l.state.trim(),
          country: l.country,
          zipCode: l.zipCode?.trim() || undefined,
          coordinates: l.coordinates,
          directions: l.directions?.trim() || undefined,
          parkingInstructions: l.parkingInstructions?.trim() || undefined,
        },
        photos: uploadedPhotos,
        nearbyAttractions: b.nearbyAttractions ?? [],
        cancellationPolicy: {
          type: cpType,
          description: (rawCp as any).description?.trim() || undefined,
          refundRules: (rawCp as any).refundRules ?? [],
        },
        rules: formData.policies.rules ?? [],
        depositRequired: formData.policies.depositRequired ?? false,
        depositAmount: formData.policies.depositAmount ?? 0,
        depositType: formData.policies.depositType ?? "fixed",
        paymentMethods: formData.policies.paymentMethods ?? [],
        refundPolicy: formData.policies.refundPolicy || undefined,
        settings: {
          instantBookEnabled: formData.settings.instantBookEnabled ?? false,
          requireApproval: formData.settings.requireApproval ?? true,
          minimumAdvanceNotice: formData.settings.minimumAdvanceNotice ?? 24,
          bookingWindow: formData.settings.bookingWindow ?? 365,
          allowWholePropertyBooking: formData.settings.allowWholePropertyBooking ?? false,
        },
        status: formData.basicInfo.status ?? "pending_approval",
        isActive: !!formData.basicInfo.isActive,
        isFeatured: !!formData.basicInfo.isFeatured,
        isVerified: false,
      };
      console.log("Submitting property payload:", payload);
      await createMutation.mutateAsync(payload);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Có lỗi xảy ra khi tạo property");
    } finally {
      setUploading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PropertyBasicInfo data={formData.basicInfo} onChange={(d: any) => updateFormData("basicInfo", { ...formData.basicInfo, ...d })} />;
      case 1:
        return <PropertyLocation data={formData.location} onChange={(d: any) => updateFormData("location", { ...formData.location, ...d })} />;
      case 2:
        return <PropertyPhotos data={formData.photos} onChange={(files: File[]) => updateFormData("photos", files)} />;
      case 3:
        return <PropertyPolicies data={formData.policies} onChange={(d: any) => updateFormData("policies", { ...formData.policies, ...d })} />;
      case 4:
        return (
          <PropertySettings
            data={{
              status: formData.settings.status,
              visibility: formData.settings.visibility,
              instantBooking: formData.settings.instantBookEnabled,
              requireApproval: formData.settings.requireApproval,
              minimumNotice: formData.settings.minimumAdvanceNotice,
              advanceBooking: formData.settings.bookingWindow,
              timezone: formData.settings.timezone,
            }}
            onChange={(d: any) => {
              updateFormData("settings", {
                ...formData.settings,
                instantBookEnabled: d.instantBooking ?? formData.settings.instantBookEnabled,
                requireApproval: d.requireApproval ?? formData.settings.requireApproval,
                minimumAdvanceNotice: d.minimumNotice ?? formData.settings.minimumAdvanceNotice,
                bookingWindow: d.advanceBooking ?? formData.settings.bookingWindow,
                status: d.status ?? formData.settings.status,
                visibility: d.visibility ?? formData.settings.visibility,
                timezone: d.timezone ?? formData.settings.timezone,
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <ArrowLeft className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => router.push("/host/properties")} />
          <div className="flex-1 flex justify-center">
            <StepIndicator currentStep={currentStep} steps={STEPS} onStepClick={handleStepClick} />
          </div>
          <div className="w-5" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8 lg:p-12 mb-6">{renderStep()}</div>

        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
          <Button variant="outline" onClick={prev} disabled={currentStep === 0} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={createMutation.isPending || uploading} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              {uploading || createMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {uploading ? "Đang upload..." : "Đang lưu..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Hoàn thành
                </>
              )}
            </Button>
          ) : (
            <Button onClick={next} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              Tiếp theo
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
// ...existing code...