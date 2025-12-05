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
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    basicInfo: {
      name: "",
      tagline: "",
      description: "",
      propertyType: "campground" as "private_land" | "farm" | "ranch" | "campground",
      landSize: {
        value: 0,
        unit: "square_meters" as "square_meters" | "hectares" | "acres",
      },
    },
    location: {
      address: "",
      city: "",
      state: "",
      country: "Vietnam",
      zipCode: "",
      coordinates: {
        type: "Point" as const,
        coordinates: [0, 0] as [number, number],
      },
      directions: "",
      parkingInstructions: "",
    },
    photos: [] as File[],
    policies: {
      cancellationPolicy: "moderate" as "flexible" | "moderate" | "strict" | "super_strict",
      cancellationDetails: "",
      depositRequired: false,
      depositAmount: 0,
      depositType: "fixed" as "fixed" | "percentage",
      refundPolicy: "",
      paymentMethods: [] as string[],
    },
    settings: {
      instantBookEnabled: false,
      requireApproval: true,
      minimumAdvanceNotice: 24,
      bookingWindow: 365,
      allowWholePropertyBooking: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: (response) => {
      toast.success("Tạo property thành công!");
      router.push(`/host/properties`);
    },
    onError: (error: any) => {
      console.error("Create property error:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi tạo property");
    },
  });

  const updateFormData = (step: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [step]: data,
    }));
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);

      // Validate required fields
      if (!formData.basicInfo.name || !formData.basicInfo.description) {
        toast.error("Vui lòng điền đầy đủ thông tin cơ bản!");
        setUploading(false);
        return;
      }

      if (!formData.location.address || !formData.location.city || !formData.location.state) {
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ!");
        setUploading(false);
        return;
      }

      if (formData.photos.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 ảnh!");
        setUploading(false);
        return;
      }

      // 1. Upload all photos first
      const uploadedPhotos = [];
      toast.info(`Đang upload ${formData.photos.length} ảnh...`);

      for (let i = 0; i < formData.photos.length; i++) {
        const file = formData.photos[i];
        const photoFormData = new FormData();
        photoFormData.append("files", file);
        photoFormData.append("folder", "properties");

        try {
          const response = await uploadMedia(photoFormData);

          // Lấy metadata từ component upload
          const getMetadata = (window as any).__propertyPhotosMetadata;
          const metadata = getMetadata ? getMetadata() : [];
          const currentMetadata = metadata[i] || {
            caption: "",
            isCover: i === 0,
            order: i,
          };

          // Backend trả data: [url] => lấy phần tử đầu tiên
          const imageUrl = Array.isArray(response.data)
            ? response.data[0]
            : response.data;

          uploadedPhotos.push({
            url: imageUrl,
            caption: currentMetadata.caption || "",
            isCover: currentMetadata.isCover,
            order: currentMetadata.order,
            uploadedAt: new Date().toISOString(),
          });

          toast.loading(`Upload ảnh ${i + 1}/${formData.photos.length}...`, {
            id: "upload-progress",
          });
        } catch (error) {
          console.error(`Failed to upload image ${i + 1}:`, error);
          toast.error(`Lỗi upload ảnh ${file.name}`);
          setUploading(false);
          return;
        }
      }

      toast.dismiss("upload-progress");
      toast.success(`Đã upload ${uploadedPhotos.length} ảnh!`);

      // 2. Validate uploaded photos
      if (uploadedPhotos.length === 0) {
        toast.error("Không có ảnh nào được upload thành công!");
        setUploading(false);
        return;
      }

      // 3. Transform data to match backend schema
      // Map any UI-only values to backend-accepted values (e.g. "super_strict" -> "strict")
      const cancellationType =
        formData.policies.cancellationPolicy === "super_strict"
          ? "strict"
          : formData.policies.cancellationPolicy;

      const submitData = {
        name: formData.basicInfo.name.trim(),
        tagline: formData.basicInfo.tagline?.trim() || undefined,
        description: formData.basicInfo.description.trim(),
        propertyType: formData.basicInfo.propertyType,
        landSize:
          formData.basicInfo.landSize && formData.basicInfo.landSize.value > 0
            ? {
              value: formData.basicInfo.landSize.value,
              unit: formData.basicInfo.landSize.unit,
            }
            : undefined,
        location: {
          address: formData.location.address.trim(),
          city: formData.location.city.trim(),
          state: formData.location.state.trim(),
          country: formData.location.country,
          zipCode: formData.location.zipCode?.trim() || undefined,
          coordinates: formData.location.coordinates,
          directions: formData.location.directions?.trim() || undefined,
          parkingInstructions: formData.location.parkingInstructions?.trim() || undefined,
        },
        photos: uploadedPhotos,
        cancellationPolicy: {
          type: cancellationType,
          description: formData.policies.cancellationDetails?.trim() || undefined,
        },
        settings: formData.settings,
        status: "pending_approval" as const,
        isActive: false,
        isFeatured: false,
        isVerified: false,
      };
      // Cast to any to satisfy createMutation's expected parameter type
      await createMutation.mutateAsync(submitData as any);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Có lỗi xảy ra khi tạo property");
    } finally {
      setUploading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PropertyBasicInfo
            data={formData.basicInfo}
            onChange={(data: any) => updateFormData("basicInfo", data)}
          />
        );
      case 1:
        return (
          <PropertyLocation
            data={formData.location}
            onChange={(data: any) => updateFormData("location", data)}
          />
        );
      case 2:
        return (
          <PropertyPhotos
            data={formData.photos}
            onChange={(files: File[]) => updateFormData("photos", files)}
          />
        );
      case 3:
        return (
          <PropertyPolicies
            data={formData.policies}
            onChange={(data: any) => updateFormData("policies", { ...formData.policies, ...data })}
          />
        );
      case 4:
        return (
          <PropertySettings
            data={{
              status: "draft",
              visibility: "public",
              instantBooking: formData.settings.instantBookEnabled,
              requireApproval: formData.settings.requireApproval,
              minimumNotice: formData.settings.minimumAdvanceNotice,
              advanceBooking: formData.settings.bookingWindow,
              timezone: "Asia/Ho_Chi_Minh",
            }}
            onChange={(data: any) => {
              updateFormData("settings", {
                ...formData.settings,
                instantBookEnabled: data.instantBooking ?? false,
                requireApproval: data.requireApproval ?? true,
                minimumAdvanceNotice: data.minimumNotice ?? 24,
                bookingWindow: data.advanceBooking ?? 365,
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" >
        {/* Nút quay lại */}
        <div className="">
          <div className="flex items-center justify-between w-full">

            {/* Nút quay lại */}
            <ArrowLeft
              className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => router.push('/host/properties')}
            />

            {/* Step Indicator ở giữa */}
            <div className="flex-1 flex justify-center">
              <StepIndicator
                currentStep={currentStep}
                steps={STEPS}
                onStepClick={handleStepClick}
              />
            </div>

            {/* Spacer để căn đối xứng */}
            <div className="w-5" />
          </div>
        </div>
        {/* Spacer để căn giữa đối xứng */}
        <div className="w-20" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8 lg:p-12 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || uploading}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
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
            <Button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              Tiếp theo
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}