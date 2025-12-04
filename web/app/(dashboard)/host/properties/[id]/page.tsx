/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/host/property/step-indicator";
import { PropertyBasicInfo } from "@/components/host/property/property-basic-info";
import { PropertyLocation } from "@/components/host/property/property-location";
import { PropertyAmenities } from "@/components/host/property/property-amenities";
import { PropertyPhotos } from "@/components/host/property/property-photo";
import { PropertyRules } from "@/components/host/property/property-rules";
import { PropertyPolicies } from "@/components/host/property/property-policies";
import { PropertySettings } from "@/components/host/property/property-settings";
import { Badge } from "@/components/ui/badge";

import { getPropertyById, updateProperty, uploadMedia } from "@/lib/client-actions";
import { ArrowLeft, ArrowRight, Check, X, Star } from "lucide-react";
import Image from "next/image";

const STEPS = [
  { label: "Cơ bản", description: "Thông tin property" },
  { label: "Vị trí", description: "Địa chỉ và bản đồ" },
  { label: "Tiện nghi", description: "Dịch vụ & hoạt động" },
  { label: "Hình ảnh", description: "Ảnh property" },
  { label: "Quy định", description: "Rules & policies" },
  { label: "Chính sách", description: "Thanh toán & hủy" },
  { label: "Hoàn tất", description: "Cài đặt cuối" },
];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // Fetch existing property data
  const { data: propertyData, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      const response = await getPropertyById(propertyId);
      return response.data;
    },
  });

  // Initialize form data when property data is loaded
  useEffect(() => {
    if (propertyData) {
      setFormData({
        basicInfo: {
          name: propertyData.name || "",
          tagline: propertyData.tagline || "",
          description: propertyData.description || "",
          propertyType: propertyData.propertyType || "campground",
          terrain: propertyData.terrain || "",
          landSize: propertyData.landSize || {
            value: 0,
            unit: "square_meters" as const,
          },
        },
        location: {
          address: propertyData.location?.address || "",
          city: propertyData.location?.city || "",
          state: propertyData.location?.state || "",
          country: propertyData.location?.country || "Vietnam",
          zipCode: propertyData.location?.zipCode || "",
          coordinates: propertyData.location?.coordinates || {
            type: "Point" as const,
            coordinates: [0, 0] as [number, number],
          },
          directions: propertyData.location?.directions || "",
          parkingInstructions: propertyData.location?.parkingInstructions || "",
        },
        sharedAmenities: propertyData.sharedAmenities || {
          toilets: { type: "none", count: 0, isShared: false },
          showers: { type: "none", count: 0, isShared: false },
          potableWater: false,
          waterSource: "none",
          parkingType: "drive_in",
          parkingSpaces: 0,
          commonAreas: [],
          laundry: false,
          wifi: false,
          cellService: "good",
          electricityAvailable: false,
        },
        activities: propertyData.activities || [],
        photos: [], // New photos to upload (File[])
        existingPhotos: propertyData.photos || [], // Keep track of existing photos
        rules: propertyData.rules || [],
        checkInInstructions: propertyData.checkInInstructions || "",
        checkOutInstructions: propertyData.checkOutInstructions || "",
        emergencyContact: propertyData.emergencyContact || {
          name: "",
          phone: "",
          instructions: "",
        },
        cancellationPolicy: propertyData.cancellationPolicy || {
          type: "flexible",
          description: "",
          refundRules: [],
        },
        petPolicy: propertyData.petPolicy || {
          allowed: false,
          maxPets: 0,
          fee: 0,
          rules: "",
        },
        childrenPolicy: propertyData.childrenPolicy || {
          allowed: true,
          ageRestrictions: "",
        },
        settings: propertyData.settings || {
          instantBookEnabled: false,
          requireApproval: true,
          minimumAdvanceNotice: 24,
          bookingWindow: 365,
          allowWholePropertyBooking: false,
        },
      });
    }
  }, [propertyData]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProperty(id, data),
    onSuccess: () => {
      toast.success("Cập nhật property thành công!");
      router.push("/host/properties");
    },
    onError: (error: any) => {
      console.error("Update property error:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi cập nhật property");
    },
  });

  const updateFormData = (step: string, data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [step]: data,
    }));
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

  const removeExistingPhoto = (index: number) => {
    const newPhotos = formData.existingPhotos.filter(
      (_: any, i: number) => i !== index
    );
    updateFormData("existingPhotos", newPhotos);
    toast.success("Đã xóa ảnh");
  };

  const setExistingPhotoCover = (index: number) => {
    const updatedPhotos = formData.existingPhotos.map(
      (photo: any, i: number) => ({
        ...photo,
        isCover: i === index,
      })
    );
    updateFormData("existingPhotos", updatedPhotos);
    toast.success("Đã đặt ảnh làm ảnh bìa");
  };

  const handleSubmit = async () => {
    if (!formData) return;

    try {
      setUploading(true);

      // 1. Upload new photos if any
      const uploadedPhotos = [];

      if (formData.photos && formData.photos.length > 0) {
        toast.info(`Đang upload ${formData.photos.length} ảnh mới...`);

      for (let i = 0; i < formData.photos.length; i++) {
                    const file = formData.photos[i];
                    const photoFormData = new FormData();
                    photoFormData.append("files", file);
                    photoFormData.append("folder", "properties");

                    try {
                        const response = await uploadMedia(photoFormData);

                        console.log("Uploaded photo response:", response);

                        // Lấy metadata từ component upload
                        const getMetadata = (window as any).__propertyPhotosMetadata;
                        const metadata = getMetadata ? getMetadata() : [];
                        const currentMetadata = metadata[i] || {
                            caption: "",
                            isCover: i === 0,
                            order: i,
                        };

                        // Backend trả data: [url]  => lấy phần tử đầu tiên
                        const imageUrl = Array.isArray(response.data)
                            ? response.data[0]
                            : response.data;

                        uploadedPhotos.push({
                            url: imageUrl,                    // ✔ STRING (quan trọng)
                            caption: currentMetadata.caption,
                            isCover: currentMetadata.isCover,
                            order: currentMetadata.order,
                            uploadedAt: new Date(),          // optional nhưng hợp lý
                        });

                        console.log("uploadedPhotos:", uploadedPhotos);

                        toast.loading(`Upload ảnh ${i + 1}/${formData.photos.length}...`, {
                            id: "upload-progress",
                        });
                    } catch (error) {
                        console.error(`Failed to upload image ${i + 1}:`, error);
                        toast.error(`Lỗi upload ảnh ${file.name}`);
                    }
                }

        toast.dismiss("upload-progress");
        if (uploadedPhotos.length > 0) {
          toast.success(`Đã upload ${uploadedPhotos.length} ảnh mới!`);
        }
      }

      // 2. Combine existing photos with new photos
      const allPhotos = [...formData.existingPhotos, ...uploadedPhotos];

      // 3. Ensure at least one photo
      if (allPhotos.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 ảnh!");
        setUploading(false);
        return;
      }

      // 4. Ensure we have valid photo URLs
      const validPhotos = allPhotos.filter((photo: any) => photo.url && photo.url.trim() !== "");
      
      if (validPhotos.length === 0) {
        toast.error("Không có ảnh hợp lệ để cập nhật!");
        setUploading(false);
        return;
      }

      // 5. Re-order photos and ensure at least one cover
      const hasCover = validPhotos.some((photo: any) => photo.isCover);
      const finalPhotos = validPhotos.map((photo: any, index: number) => ({
        url: photo.url,
        caption: photo.caption || "",
        isCover: hasCover ? photo.isCover : index === 0,
        order: index,
      }));

      console.log("Final photos to submit:", finalPhotos);

      // 6. Transform data to match backend schema
      const submitData = {
        name: formData.basicInfo.name,
        tagline: formData.basicInfo.tagline,
        description: formData.basicInfo.description,
        propertyType: formData.basicInfo.propertyType,
        terrain: formData.basicInfo.terrain,
        landSize:
          formData.basicInfo.landSize &&
          formData.basicInfo.landSize.value > 0
            ? formData.basicInfo.landSize
            : undefined,
        location: formData.location,
        sharedAmenities: formData.sharedAmenities,
        activities: formData.activities,
        photos: finalPhotos,
        rules: formData.rules,
        checkInInstructions: formData.checkInInstructions,
        checkOutInstructions: formData.checkOutInstructions,
        emergencyContact: formData.emergencyContact.name
          ? formData.emergencyContact
          : undefined,
        cancellationPolicy: formData.cancellationPolicy,
        petPolicy: formData.petPolicy,
        childrenPolicy: formData.childrenPolicy,
        settings: formData.settings,
      };

      console.log("Submitting property update:", submitData);
      await updateMutation.mutateAsync({ id: propertyId, data: submitData });
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Có lỗi xảy ra khi cập nhật property");
    } finally {
      setUploading(false);
    }
  };

  const renderStep = () => {
    if (!formData) return null;

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
          <PropertyAmenities
            data={{
              ...formData.sharedAmenities,
              amenities: [],
              activities: formData.activities,
            }}
            onChange={(data: any) => {
              const { amenities, activities, ...sharedAmenities } = data;
              updateFormData("sharedAmenities", sharedAmenities);
              if (activities !== undefined) {
                updateFormData("activities", activities);
              }
            }}
          />
        );
      case 3:
        return (
          <div className="space-y-6">
            {/* Existing Photos */}
            {formData.existingPhotos && formData.existingPhotos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ảnh hiện tại ({formData.existingPhotos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {formData.existingPhotos.map((photo: any, index: number) => (
                    <div
                      key={`existing-${index}`}
                      className="relative group rounded-lg overflow-hidden border bg-gray-100"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={photo.url}
                          alt={photo.caption || `Photo ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        
                        {/* Cover Badge */}
                        {photo.isCover && (
                          <Badge className="absolute top-2 left-2 bg-emerald-600 gap-1 z-10">
                            <Star className="h-3 w-3 fill-white" />
                            Ảnh bìa
                          </Badge>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!photo.isCover && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setExistingPhotoCover(index)}
                              className="text-xs"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Đặt bìa
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeExistingPhoto(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {photo.caption && (
                        <div className="p-2 bg-white text-xs text-gray-600">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Photos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thêm ảnh mới
              </h3>
              <PropertyPhotos
                data={formData.photos}
                onChange={(files: File[]) => {
                  console.log("PropertyPhotos onChange called with:", files);
                  updateFormData("photos", files);
                }}
              />
            </div>

            {/* Total Photos Count */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800">
                📸 Tổng số ảnh: {formData.existingPhotos.length + formData.photos.length} 
                {formData.existingPhotos.length > 0 && ` (${formData.existingPhotos.length} ảnh cũ`}
                {formData.photos.length > 0 && `, ${formData.photos.length} ảnh mới)`}
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <PropertyRules
            data={{
              checkInTime: "14:00",
              checkOutTime: "11:00",
              quietHours: { start: "22:00", end: "07:00", enforced: false },
              minimumAge: 18,
              maxGuests: 50,
              petsAllowed: formData.petPolicy.allowed,
              petRules: formData.petPolicy.rules
                ? [formData.petPolicy.rules]
                : [],
              smokingAllowed: false,
              alcoholPolicy: "allowed",
              musicPolicy: "quiet_hours_only",
              customRules: formData.rules.map((r: any) => r.text),
            }}
            onChange={(data: any) => {
              const rules = (data.customRules || []).map(
                (text: string, index: number) => ({
                  text,
                  category: "general" as const,
                  order: index,
                })
              );
              updateFormData("rules", rules);

              if (data.petsAllowed !== undefined) {
                updateFormData("petPolicy", {
                  ...formData.petPolicy,
                  allowed: data.petsAllowed,
                  rules: data.petRules?.[0] || "",
                });
              }
            }}
          />
        );
      case 5:
        return (
          <PropertyPolicies
            data={{
              cancellationPolicy: formData.cancellationPolicy.type,
              cancellationDetails: formData.cancellationPolicy.description,
              depositRequired: false,
              depositAmount: 0,
              depositType: "fixed",
              refundPolicy: "",
              paymentMethods: [],
            }}
            onChange={(data: any) => {
              if (data.cancellationPolicy) {
                updateFormData("cancellationPolicy", {
                  ...formData.cancellationPolicy,
                  type: data.cancellationPolicy,
                  description: data.cancellationDetails || "",
                });
              }
            }}
          />
        );
      case 6:
        return (
          <PropertySettings
            data={{
              status: propertyData?.status || "draft",
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
                instantBookEnabled: data.instantBooking,
                requireApproval: data.requireApproval,
                minimumAdvanceNotice: data.minimumNotice,
                bookingWindow: data.advanceBooking,
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (isLoading || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa Property
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {propertyData?.name} • Bước {currentStep + 1} / {STEPS.length}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-12">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-12">
            <div className="max-w-3xl mx-auto">{renderStep()}</div>
          </div>

          <div className="bg-gray-50 px-6 py-5 sm:px-8 lg:px-12 border-t">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="gap-2 min-w-[120px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Button>

                <div className="flex items-center gap-4">
                  {currentStep < STEPS.length - 1 && (
                    <span className="text-sm text-gray-500 hidden sm:inline-block">
                      Tiếp theo: {STEPS[currentStep + 1]?.label}
                    </span>
                  )}

                  {currentStep === STEPS.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={updateMutation.isPending || uploading}
                      className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[140px]"
                    >
                      {uploading || updateMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {uploading ? "Đang upload..." : "Đang lưu..."}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Cập nhật
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[120px]"
                    >
                      Tiếp theo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-emerald-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          💡 Mẹo: Thay đổi sẽ được lưu khi bạn hoàn tất cập nhật
        </p>
      </div>
    </div>
  );
}