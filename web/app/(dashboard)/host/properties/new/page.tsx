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
import { PropertyAmenities } from "@/components/host/property/property-amenities";
import { PropertyPhotos } from "@/components/host/property/property-photo";
import { PropertyRules } from "@/components/host/property/property-rules";
import { PropertyPolicies } from "@/components/host/property/property-policies";
import { PropertySettings } from "@/components/host/property/property-settings";

import { createProperty, uploadMedia } from "@/lib/client-actions";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

const STEPS = [
    { label: "Cơ bản", description: "Thông tin property" },
    { label: "Vị trí", description: "Địa chỉ và bản đồ" },
    { label: "Tiện nghi", description: "Dịch vụ & hoạt động" },
    { label: "Hình ảnh", description: "Ảnh property" },
    { label: "Quy định", description: "Rules & policies" },
    { label: "Chính sách", description: "Thanh toán & hủy" },
    { label: "Hoàn tất", description: "Cài đặt cuối" },
];

export default function NewPropertyPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        basicInfo: {
            name: "",
            tagline: "",
            description: "",
            propertyType: "campground",
            terrain: "",
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
        sharedAmenities: {
            toilets: {
                type: "none" as "none" | "portable" | "flush" | "vault" | "composting",
                count: 0,
                isShared: false,
            },
            showers: {
                type: "none" as "none" | "outdoor" | "indoor" | "hot" | "cold",
                count: 0,
                isShared: false,
            },
            potableWater: false,
            waterSource: "none" as "tap" | "well" | "stream" | "none",
            parkingType: "drive_in" as "drive_in" | "walk_in" | "nearby",
            parkingSpaces: 0,
            commonAreas: [] as string[],
            laundry: false,
            wifi: false,
            cellService: "good" as "excellent" | "good" | "limited" | "none",
            electricityAvailable: false,
        },
        activities: [] as string[],
        photos: [] as File[], // THIS MUST BE File[]
        rules: [] as Array<{
            text: string;
            category: "pets" | "noise" | "fire" | "general";
            order: number;
        }>,
        checkInInstructions: "",
        checkOutInstructions: "",
        emergencyContact: {
            name: "",
            phone: "",
            instructions: "",
        },
        cancellationPolicy: {
            type: "flexible" as "flexible" | "moderate" | "strict",
            description: "",
            refundRules: [] as Array<{
                daysBeforeCheckIn: number;
                refundPercentage: number;
            }>,
        },
        petPolicy: {
            allowed: false,
            maxPets: 0,
            fee: 0,
            rules: "",
        },
        childrenPolicy: {
            allowed: true,
            ageRestrictions: "",
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
            router.push(`/host/properties/${response.data._id}`);
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

            // 1. Upload all photos first
            const uploadedPhotos = [];

            if (formData.photos.length > 0) {
                toast.info(`Đang upload ${formData.photos.length} ảnh...`);

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


                toast.dismiss('upload-progress');
                toast.success(`Đã upload ${uploadedPhotos.length} ảnh!`);
            }

            // 2. Transform data to match backend schema
            const submitData = {
                name: formData.basicInfo.name,
                tagline: formData.basicInfo.tagline,
                description: formData.basicInfo.description,
                propertyType: formData.basicInfo.propertyType,
                terrain: formData.basicInfo.terrain,
                // FIX: Safe check for landSize
                landSize: formData.basicInfo.landSize && formData.basicInfo.landSize.value > 0
                    ? formData.basicInfo.landSize
                    : undefined,
                location: {
                    address: formData.location.address,
                    city: formData.location.city,
                    state: formData.location.state,
                    country: formData.location.country,
                    zipCode: formData.location.zipCode,
                    coordinates: formData.location.coordinates,
                    directions: formData.location.directions,
                    parkingInstructions: formData.location.parkingInstructions,
                },
                sharedAmenities: formData.sharedAmenities,
                activities: formData.activities,
                photos: uploadedPhotos,
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
                isActive: false,
                isFeatured: false,
                isVerified: false,
            };

            console.log("Submitting property data:", submitData);
            await createMutation.mutateAsync(submitData);
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
                console.log("Rendering PropertyPhotos with data:", formData.photos); // DEBUG
                return (
                    <PropertyPhotos
                        data={formData.photos}
                        onChange={(files: File[]) => {
                            console.log("PropertyPhotos onChange called with:", files); // DEBUG
                            updateFormData("photos", files);
                        }}
                    />
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
                            petRules: formData.petPolicy.rules ? [formData.petPolicy.rules] : [],
                            smokingAllowed: false,
                            alcoholPolicy: "allowed",
                            musicPolicy: "quiet_hours_only",
                            customRules: formData.rules.map((r) => r.text),
                        }}
                        onChange={(data: any) => {
                            const rules = (data.customRules || []).map((text: string, index: number) => ({
                                text,
                                category: "general" as const,
                                order: index,
                            }));
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

    console.log("Page render - formData.photos:", formData.photos);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
            {/* ... rest of JSX ... */}
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <StepIndicator currentStep={currentStep} steps={STEPS} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8 lg:p-12">
                        <div className="max-w-3xl mx-auto">
                            {renderStep()}
                        </div>
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
                                            disabled={createMutation.isPending || uploading}
                                            className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[140px]"
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
            </div>
        </div>
    );
}