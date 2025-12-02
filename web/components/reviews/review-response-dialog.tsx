/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";
import { addHostResponse } from "@/lib/client-actions";

interface ReviewResponseDialogProps {
    open: boolean;
    review: any | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ReviewResponseDialog({
    open,
    review,
    onOpenChange,
    onSuccess,
}: ReviewResponseDialogProps) {
    const [responseText, setResponseText] = useState(review?.hostResponse?.comment || "");
    const [submitting, setSubmitting] = useState(false);
    const defaultTemplate = "Cảm ơn bạn đã đánh giá! Chúng tôi rất trân trọng phản hồi của bạn và sẽ cố gắng cải thiện dịch vụ.";
    async function handleSubmit() {
        if (!review || !responseText.trim()) return;

        try {
            setSubmitting(true);
            console.log("Submitting response:", responseText.trim());
            const res = await addHostResponse(review._id, responseText.trim());
            
            if (!res.success) {
                toast.error(res.message || "Có lỗi khi gửi phản hồi");
                return;
            }

            toast.success("Đã gửi phản hồi thành công!");
            onOpenChange(false);
            setResponseText("");
            onSuccess();
        } catch (error) {
            console.error("Error submitting response:", error);
            toast.error("Có lỗi khi gửi phản hồi");
        } finally {
            setSubmitting(false);
        }
    }
    useEffect(() => {
        if (open && review) {
            setResponseText(review.hostResponse?.comment || defaultTemplate);
        }
    }, [open, review]);
    if (!review) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Phản hồi đánh giá</DialogTitle>
                    <DialogDescription>
                        Phản hồi của bạn sẽ được hiển thị công khai cho khách hàng và người dùng khác
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Review Preview */}
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={review.guest?.avatarUrl} />
                                <AvatarFallback>
                                    {review.guest?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{review.guest?.username}</p>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">
                                            {review.ratings?.overall}
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                            </div>
                        </div>
                    </div>

                    {/* Response Input */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Phản hồi của bạn
                        </label>
                        <Textarea
                            placeholder="Cảm ơn bạn đã đánh giá! Chúng tôi rất..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={5}
                            maxLength={1000}
                            className="resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-500 text-right">
                            {responseText.length}/1000 ký tự
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!responseText.trim() || submitting}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {submitting ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Gửi phản hồi
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}