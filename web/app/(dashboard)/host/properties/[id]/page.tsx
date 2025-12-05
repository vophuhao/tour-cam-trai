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
import { PropertyPhotos } from "@/components/host/property/property-photo";
import { PropertyPolicies } from "@/components/host/property/property-policies";
import { PropertySettings } from "@/components/host/property/property-settings";
import { Badge } from "@/components/ui/badge";

import { getPropertyById, updateProperty, uploadMedia } from "@/lib/client-actions";
import { ArrowLeft, ArrowRight, Check, Star, Trash2 } from "lucide-react";
import Image from "next/image";

const STEPS = [
  { label: "Cơ bản", description: "Thông tin property" },
  { label: "Vị trí", description: "Địa chỉ và bản đồ" },
  { label: "Hình ảnh", description: "Ảnh property" },
  { label: "Chính sách", description: "Hủy & hoàn tiền" },
  { label: "Cài đặt", description: "Hoàn tất" },
];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // Fetch existing property data
  const { data: propertyData, isLoading } = useQuery<any>({
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
          landSize: propertyData.landSize || { value: 0, unit: "square_meters" as const },
          nearbyAttractions: propertyData.nearbyAttractions || [],
          status: propertyData.status || "pending_approval",
          isActive: propertyData.isActive ?? false,
          isFeatured: propertyData.isFeatured ?? false,
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
        photos: [], // New photos to upload (File[])
        existingPhotos: propertyData.photos || [], // Keep track of existing photos
        policies: {
          cancellationPolicy: propertyData.cancellationPolicy || {
            type: "moderate",
            description: "",
            refundRules: [],
          },
          depositRequired: propertyData.depositRequired ?? false,
          depositAmount: propertyData.depositAmount ?? 0,
          depositType: propertyData.depositType || "fixed",
          refundPolicy: propertyData.refundPolicy || "",
          paymentMethods: propertyData.paymentMethods || [],
          rules: propertyData.rules || [],
        },
        settings: {
          instantBookEnabled: propertyData.settings?.instantBookEnabled ?? false,
          requireApproval: propertyData.settings?.requireApproval ?? true,
          minimumAdvanceNotice: propertyData.settings?.minimumAdvanceNotice ?? 24,
          bookingWindow: propertyData.settings?.bookingWindow ?? 365,
          allowWholePropertyBooking: propertyData.settings?.allowWholePropertyBooking ?? false,
          // UI helpers
          status: "draft" as "draft" | "published" | "suspended",
          visibility: "public" as "public" | "private" | "unlisted",
          timezone: "Asia/Ho_Chi_Minh",
          checkInInstructions: propertyData.checkInInstructions || "",
          checkOutInstructions: propertyData.checkOutInstructions || "",
        },
      });
    }
  }, [propertyData]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProperty(id, data),
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
      [step]: { ...(prev?.[step] || {}), ...data },
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

  const removeExistingPhoto = (index: number) => {
    const newPhotos = formData.existingPhotos.filter((_: any, i: number) => i !== index);
    updateFormData("existingPhotos", newPhotos);
    toast.success("Đã xóa ảnh");
  };

  const setExistingPhotoCover = (index: number) => {
    const updatedPhotos = formData.existingPhotos.map((photo: any, i: number) => ({
      ...photo,
      isCover: i === index,
    }));
    updateFormData("existingPhotos", updatedPhotos);
    toast.success("Đã đặt ảnh làm ảnh bìa");
  };

  const uploadAllPhotos = async (files: File[]) => {
    const uploaded: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append("files", file);
      fd.append("folder", "properties");
      const res = await uploadMedia(fd);
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
    if (!formData) return;

    try {
      setUploading(true);

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

      // 1. Upload new photos
      let uploadedPhotos: any[] = [];
      if (formData.photos && formData.photos.length > 0) {
        toast.info(`Đang upload ${formData.photos.length} ảnh mới...`);
        uploadedPhotos = await uploadAllPhotos(formData.photos);
        if (uploadedPhotos.length > 0) {
          toast.success(`Đã upload ${uploadedPhotos.length} ảnh mới!`);
        }
      }

      // 2. Combine existing + new
      const allPhotos = [...formData.existingPhotos, ...uploadedPhotos];
      if (allPhotos.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 ảnh!");
        return;
      }

      const validPhotos = allPhotos.filter((p: any) => p.url && p.url.trim() !== "");
      if (validPhotos.length === 0) {
        toast.error("Không có ảnh hợp lệ!");
        return;
      }

      const hasCover = validPhotos.some((p: any) => p.isCover);
      const finalPhotos = validPhotos.map((p: any, idx: number) => ({
        url: p.url,
        caption: p.caption || "",
        isCover: hasCover ? p.isCover : idx === 0,
        order: idx,
      }));

      // 3. Prepare payload
      const rawCp = formData.policies.cancellationPolicy || { type: "moderate", description: "", refundRules: [] };
      const cpType = (rawCp as any).type === "super_strict" ? "strict" : (rawCp as any).type;

      const payload: any = {
        name: b.name.trim(),
        slug: undefined,
        tagline: b.tagline?.trim() || undefined,
        description: b.description.trim(),
        propertyType: b.propertyType,
        terrain: b.terrain || undefined,
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
        photos: finalPhotos,
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
        checkInInstructions: formData.settings.checkInInstructions || undefined,
        checkOutInstructions: formData.settings.checkOutInstructions || undefined,
        status: b.status ?? "pending_approval",
        isActive: !!b.isActive,
        isFeatured: !!b.isFeatured,
      };

      console.log("Submitting property update:", payload);
      await updateMutation.mutateAsync({ id: propertyId, data: payload });
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
            onChange={(d: any) => updateFormData("basicInfo", d)}
          />
        );
      case 1:
        return (
          <PropertyLocation
            data={formData.location}
            onChange={(d: any) => updateFormData("location", d)}
          />
        );
      case 2:
        return (
          <div className="space-y-6">
            {/* Existing Photos */}
            {formData.existingPhotos && formData.existingPhotos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ảnh hiện tại</h3>
                  <Badge variant="secondary">{formData.existingPhotos.length} ảnh</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {formData.existingPhotos.map((photo: any, index: number) => (
                    <div key={`existing-${index}`} className="relative group rounded-lg overflow-hidden border-2 hover:border-emerald-500 transition-colors">
                      <div className="relative aspect-square bg-gray-100">
                        <Image src={photo.url} alt={photo.caption || `Photo ${index + 1}`} fill className="object-cover" unoptimized />

                        {photo.isCover && (
                          <Badge className="absolute top-2 left-2 bg-emerald-600 gap-1 z-10">
                            <Star className="h-3 w-3 fill-white" />
                            Ảnh bìa
                          </Badge>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!photo.isCover && (
                            <Button type="button" size="sm" variant="secondary" onClick={() => setExistingPhotoCover(index)} className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Đặt bìa
                            </Button>
                          )}
                          <Button type="button" size="sm" variant="destructive" onClick={() => removeExistingPhoto(index)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {photo.caption && <div className="p-2 bg-white border-t text-xs text-gray-600 truncate">{photo.caption}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {formData.existingPhotos && formData.existingPhotos.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-sm text-gray-500">Thêm ảnh mới</span>
                </div>
              </div>
            )}

            {/* Add New Photos */}
            <div>
              {(!formData.existingPhotos || formData.existingPhotos.length === 0) && <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm ảnh property</h3>}
              <PropertyPhotos data={formData.photos} onChange={(files: File[]) => setFormData((prev: any) => ({ ...prev, photos: files }))} />
            </div>

            {/* Total Photos Count */}
            {(formData.existingPhotos.length > 0 || formData.photos.length > 0) && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  📸 Tổng số ảnh: <strong>{formData.existingPhotos.length + formData.photos.length}</strong>
                  {formData.existingPhotos.length > 0 && ` (${formData.existingPhotos.length} ảnh hiện tại)`}
                  {formData.photos.length > 0 && ` + ${formData.photos.length} ảnh mới`}
                </p>
              </div>
            )}
          </div>
        );
      case 3:
        return <PropertyPolicies data={formData.policies} onChange={(d: any) => updateFormData("policies", d)} />;
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
              allowWholePropertyBooking: formData.settings.allowWholePropertyBooking,
              timezone: formData.settings.timezone,
              checkInInstructions: formData.settings.checkInInstructions,
              checkOutInstructions: formData.settings.checkOutInstructions,
            }}
            onChange={(d: any) => {
              updateFormData("settings", {
                instantBookEnabled: d.instantBooking ?? formData.settings.instantBookEnabled,
                requireApproval: d.requireApproval ?? formData.settings.requireApproval,
                minimumAdvanceNotice: d.minimumNotice ?? formData.settings.minimumAdvanceNotice,
                bookingWindow: d.advanceBooking ?? formData.settings.bookingWindow,
                allowWholePropertyBooking: d.allowWholePropertyBooking ?? formData.settings.allowWholePropertyBooking,
                status: d.status ?? formData.settings.status,
                visibility: d.visibility ?? formData.settings.visibility,
                timezone: d.timezone ?? formData.settings.timezone,
                checkInInstructions: d.checkInInstructions ?? formData.settings.checkInInstructions,
                checkOutInstructions: d.checkOutInstructions ?? formData.settings.checkOutInstructions,
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between w-full">
            <ArrowLeft className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => router.push("/host/properties")} />
            <div className="flex-1 flex justify-center">
              <StepIndicator currentStep={currentStep} steps={STEPS} onStepClick={handleStepClick} />
            </div>
            <div className="w-5" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8 lg:p-12 mb-6">{renderStep()}</div>

        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={updateMutation.isPending || uploading} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
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
            <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              Tiếp theo
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}