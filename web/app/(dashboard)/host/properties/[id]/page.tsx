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
                photos: [], // New photos to upload (File[])
                existingPhotos: propertyData.photos || [], // Keep track of existing photos
                policies: {
                    cancellationPolicy: propertyData.cancellationPolicy?.type || "moderate",
                    cancellationDetails: propertyData.cancellationPolicy?.description || "",
                    depositRequired: false,
                    depositAmount: 0,
                    depositType: "fixed" as const,
                    refundPolicy: "",
                    paymentMethods: [] as string[],
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
                            uploadedAt: new Date(),
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
            const validPhotos = allPhotos.filter(
                (photo: any) => photo.url && photo.url.trim() !== ""
            );

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
                    parkingInstructions:
                        formData.location.parkingInstructions?.trim() || undefined,
                },
                photos: finalPhotos,
                cancellationPolicy: {
                    type: formData.policies.cancellationPolicy,
                    description: formData.policies.cancellationDetails?.trim() || undefined,
                },
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
                    <div className="space-y-6">
                        {/* Existing Photos */}
                        {formData.existingPhotos && formData.existingPhotos.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Ảnh hiện tại
                                    </h3>
                                    <Badge variant="secondary">
                                        {formData.existingPhotos.length} ảnh
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                    {formData.existingPhotos.map((photo: any, index: number) => (
                                        <div
                                            key={`existing-${index}`}
                                            className="relative group rounded-lg overflow-hidden border-2 hover:border-emerald-500 transition-colors"
                                        >
                                            <div className="relative aspect-square bg-gray-100">
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

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {photo.caption && (
                                                <div className="p-2 bg-white border-t text-xs text-gray-600 truncate">
                                                    {photo.caption}
                                                </div>
                                            )}
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
                                    <span className="bg-white px-3 text-sm text-gray-500">
                                        Thêm ảnh mới
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Add New Photos */}
                        <div>
                            {(!formData.existingPhotos || formData.existingPhotos.length === 0) && (
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Thêm ảnh property
                                </h3>
                            )}
                            <PropertyPhotos
                                data={formData.photos}
                                onChange={(files: File[]) => updateFormData("photos", files)}
                            />
                        </div>

                        {/* Total Photos Count */}
                        {(formData.existingPhotos.length > 0 || formData.photos.length > 0) && (
                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                <p className="text-sm text-emerald-800">
                                    📸 Tổng số ảnh:{" "}
                                    <strong>
                                        {formData.existingPhotos.length + formData.photos.length}
                                    </strong>
                                    {formData.existingPhotos.length > 0 &&
                                        ` (${formData.existingPhotos.length} ảnh hiện tại)`}
                                    {formData.photos.length > 0 &&
                                        ` + ${formData.photos.length} ảnh mới`}
                                </p>
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <PropertyPolicies
                        data={formData.policies}
                        onChange={(data: any) =>
                            updateFormData("policies", { ...formData.policies, ...data })
                        }
                    />
                );
            case 4:
                return (
                    <PropertySettings
                        data={{
                            status: propertyData?.status || "pending_approval",
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
        <div className="min-h-screen ">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Step Indicator */}
                <div className="mb-8">
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
                            disabled={updateMutation.isPending || uploading}
                            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
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
