/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/host/site/step-indicator";
import { SiteAmenities } from "@/components/host/site/site-amenities"
import { SiteBasicInfo } from "@/components/host/site/site-basic-info"
import { SiteBookingSettings } from "@/components/host/site/site-booking-settings"
import { SiteCapacity } from "@/components/host/site/site-capacity";
import { SitePhotos } from "@/components/host/site/site-photos"
import { SitePricing } from "@/components/host/site/site-pricing";
import { SiteTypeSelection } from "@/components/host/site/site-type-selection";
import { createSite, getPropertyById } from "@/lib/client-actions";
import { ChevronLeft, ChevronRight, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { label: "Thông tin", description: "Tên & mô tả" },
  { label: "Loại site", description: "Chọn loại" },
  { label: "Sức chứa", description: "Khách & xe" },
  { label: "Giá", description: "Thiết lập giá" },
  { label: "Tiện nghi", description: "Amenities" },
  { label: "Hình ảnh", description: "Photos" },
  { label: "Cài đặt", description: "Settings" },
];

export default function NewSitePage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    siteType: "tent" as "tent" | "rv" | "cabin" | "glamping" | "group",
    capacity: {
      maxGuests: 2,
      maxVehicles: 1,
      maxTents: 1,
      maxRVs: 0,
    },
    size: {
      value: 0,
      unit: "square_meters" as "square_meters" | "square_feet",
    },
    pricing: {
      basePrice: 0,
      weekendPrice: 0,
      currency: "VND",
      minimumStay: 1,
      extraGuestFee: 0,
      extraVehicleFee: 0,
    },
    amenities: {
      firePit: false,
      picnicTable: false,
      grillGrate: false,
      waterAccess: false,
      electricalHookup: false,
      sewerHookup: false,
      shadeStructure: false,
      customAmenities: [] as string[],
    },
    photos: [] as Array<{
      url: string;
      caption?: string;
      isPrimary: boolean;
    }>,
    bookingSettings: {
      status: "available" as "available" | "unavailable" | "maintenance",
      instantBooking: false,
      requireApproval: true,
      advanceNotice: 24,
    },
    accessibility: {
      wheelchairAccessible: false,
      rvAccessible: false,
      pullThrough: false,
      backIn: false,
    },
    terrain: "flat" as "flat" | "sloped" | "mixed",
    shadeLevel: "partial" as "full_sun" | "partial" | "full_shade",
  });

  // Get property info
  const { data: property } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      const response = await getPropertyById(propertyId);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createSite(propertyId, data),
    onSuccess: (response) => {
      toast.success("Tạo site thành công!");
      router.push(`/host/properties/${propertyId}/sites`);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi tạo site");
    },
  });

  const updateFormData = (step: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [step]: { ...prev[step as keyof typeof prev], ...data },
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    await createMutation.mutateAsync(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SiteBasicInfo
            data={{ name: formData.name, description: formData.description }}
            onChange={(data) => updateFormData("", data)}
          />
        );
      case 1:
        return (
          <SiteTypeSelection
            data={{ siteType: formData.siteType }}
            onChange={(data) => updateFormData("", data)}
          />
        );
      case 2:
        return (
          <SiteCapacity
            data={{
              capacity: formData.capacity,
              size: formData.size,
              accessibility: formData.accessibility,
              terrain: formData.terrain,
              shadeLevel: formData.shadeLevel,
            }}
            onChange={(data) => updateFormData("", data)}
          />
        );
      case 3:
        return (
          <SitePricing
            data={formData.pricing}
            onChange={(data) => updateFormData("pricing", data)}
          />
        );
      case 4:
        return (
          <SiteAmenities
            data={formData.amenities}
            siteType={formData.siteType}
            onChange={(data) => updateFormData("amenities", data)}
          />
        );
      case 5:
        return (
          <SitePhotos
            data={formData.photos}
            onChange={(data) => updateFormData("photos", data)}
          />
        );
      case 6:
        return (
          <SiteBookingSettings
            data={formData.bookingSettings}
            onChange={(data) => updateFormData("bookingSettings", data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href={`/host/properties/${propertyId}/sites`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách sites
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tạo Site mới</h1>
          <p className="mt-1 text-sm text-gray-500">
            Property: {property?.basicInfo?.name || "..."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>

        <Card>
          <CardContent className="p-6">
            {renderStep()}

            <div className="mt-8 flex items-center justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>

              {currentStep === STEPS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? "Đang lưu..." : "Hoàn thành"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Tiếp theo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}