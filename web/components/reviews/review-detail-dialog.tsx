/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    Star,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Calendar,
    MapPin,
    Check,
    Send,
    Eye,
    Home,
    Tent,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const PROPERTY_RATING_LABELS: Record<string, string> = {
    location: "Vị trí",
    communication: "Giao tiếp",
    value: "Giá trị",
};

const SITE_RATING_LABELS: Record<string, string> = {
    cleanliness: "Vệ sinh",
    accuracy: "Đúng mô tả",
    amenities: "Tiện nghi",
};

interface ReviewDetailDialogProps {
    open: boolean;
    review: any | null;
    onOpenChange: (open: boolean) => void;
    onResponse: (review: any) => void;
}

export function ReviewDetailDialog({
    open,
    review,
    onOpenChange,
    onResponse,
}: ReviewDetailDialogProps) {
    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function getStarColor(rating: number) {
        if (rating >= 4.5) return "text-green-500";
        if (rating >= 3.5) return "text-yellow-500";
        return "text-red-500";
    }

    if (!review) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="space-y-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={review.guest?.avatarUrl} />
                                <AvatarFallback>
                                    {review.guest?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span>{review.guest?.username}</span>
                                    {review.isVerified && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Check className="mr-1 h-3 w-3" />
                                            Đã xác minh
                                        </Badge>
                                    )}
                                    {review.isFeatured && (
                                        <Badge className="bg-purple-600 text-xs">
                                            Nổi bật
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-normal">
                                    <MapPin className="h-4 w-4" />
                                    {review.property?.name} - {review.site?.name}
                                    <span>•</span>
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(review.createdAt)}
                                </div>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Overall Rating */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                        <div className="text-center px-4 border-r border-emerald-300">
                            <div className="flex items-center gap-1">
                                <Star
                                    className={`h-8 w-8 fill-current ${getStarColor(
                                        review.overallRating || 0
                                    )}`}
                                />
                                <span className="text-3xl font-bold text-gray-900">
                                    {review.overallRating?.toFixed(1) || "0.0"}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 font-medium">Tổng quan</p>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                            {/* Property Ratings */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Home className="h-4 w-4 text-blue-600" />
                                    <p className="text-sm font-semibold text-blue-900">Đánh giá Property</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(review.propertyRatings || {}).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-gray-600">{PROPERTY_RATING_LABELS[key]}</span>
                                                <span className="font-medium text-gray-900">{value as number}/5</span>
                                            </div>
                                            <Progress value={((value as number) / 5) * 100} className="h-1.5" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Site Ratings */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Tent className="h-4 w-4 text-emerald-600" />
                                    <p className="text-sm font-semibold text-emerald-900">Đánh giá Site</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(review.siteRatings || {}).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-gray-600">{SITE_RATING_LABELS[key]}</span>
                                                <span className="font-medium text-gray-900">{value as number}/5</span>
                                            </div>
                                            <Progress value={((value as number) / 5) * 100} className="h-1.5" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    {review.title && (
                        <h4 className="text-xl font-semibold text-gray-900">{review.title}</h4>
                    )}

                    {/* Comment */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Hình ảnh</p>
                            <div className="grid grid-cols-3 gap-3">
                                {review.images.map((image: string, i: number) => (
                                    <img
                                        key={i}
                                        src={image}
                                        alt={`Review image ${i + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pros & Cons */}
                    {(review.pros?.length > 0 || review.cons?.length > 0) && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {review.pros?.length > 0 && (
                                <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                                    <p className="mb-3 flex items-center gap-2 font-medium text-green-800">
                                        <ThumbsUp className="h-4 w-4" />
                                        Điểm tốt
                                    </p>
                                    <ul className="space-y-2">
                                        {review.pros.map((pro: string, i: number) => (
                                            <li key={i} className="text-sm text-green-700">
                                                • {pro}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {review.cons?.length > 0 && (
                                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                                    <p className="mb-3 flex items-center gap-2 font-medium text-red-800">
                                        <ThumbsDown className="h-4 w-4" />
                                        Điểm chưa tốt
                                    </p>
                                    <ul className="space-y-2">
                                        {review.cons.map((con: string, i: number) => (
                                            <li key={i} className="text-sm text-red-700">
                                                • {con}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Host Response */}
                    {review.hostResponse ? (
                        <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-emerald-900">Phản hồi từ bạn</p>
                                        <span className="text-xs text-emerald-600">
                                            {formatDate(review.hostResponse.respondedAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-emerald-800">
                                        {review.hostResponse.comment}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                            <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">Bạn chưa phản hồi đánh giá này</p>
                            <Button
                                size="sm"
                                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => onResponse(review)}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Phản hồi ngay
                            </Button>
                        </div>
                    )}

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {review.helpfulCount || 0} hữu ích
                            </span>
                            <span className="flex items-center gap-1">
                                <ThumbsDown className="h-4 w-4" />
                                {review.notHelpfulCount || 0}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/properties/${review.property?.slug}`, "_blank")}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem địa điểm
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}