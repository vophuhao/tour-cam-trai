/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: SubmitRatingData) => Promise<void>;
  order: Order;
}

interface SubmitRatingData {
  order: string;
  ratings: ProductRatingSubmit[];
}

interface ProductRatingSubmit {
  product: string;
  rating: number;
  review: string;
}

interface ProductRating {
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  review: string;
}

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  order,
}: RatingModalProps) {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [productRatings, setProductRatings] = useState<ProductRating[]>(
    order?.items?.map(item => ({
      productId: item.product || '',
      productName: item.name,
      productImage: item.image || '',
      rating: 0,
      review: '',
    })) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentProduct = productRatings[currentProductIndex];
  const totalProducts = productRatings.length;

  const updateRating = (rating: number) => {
    setProductRatings(prev => {
      const updated = [...prev];
      updated[currentProductIndex].rating = rating;
      return updated;
    });
  };

  const updateReview = (review: string) => {
    setProductRatings(prev => {
      const updated = [...prev];
      updated[currentProductIndex].review = review;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentProduct.rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (currentProductIndex < totalProducts - 1) {
      setCurrentProductIndex(prev => prev + 1);
    } else {
      handleSubmitAll();
    }
  };

  const handlePrevious = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(prev => prev - 1);
    }
  };

  const handleSubmitAll = async () => {
    // Validate all products - only rating is required
    const invalidProduct = productRatings.find(p => p.rating === 0);
    if (invalidProduct) {
      toast.error("Vui lòng hoàn thành đánh giá cho tất cả sản phẩm");
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingsData: ProductRatingSubmit[] = productRatings.map((productRating) => ({
        product: productRating.productId,
        rating: productRating.rating,
        review: productRating.review,
      }));

      if (onSubmit) {
        await onSubmit({
          order: order._id,
          ratings: ratingsData,
        });
      }

      // Reset form
      setCurrentProductIndex(0);
      setProductRatings(
        order?.items?.map(item => ({
          productId: item.product || '',
          productName: item.name,
          productImage: item.image || '',
          rating: 0,
          review: '',
        })) || []
      );
      
      onClose();
      toast.success("Đã gửi đánh giá !");
    } catch (error) {
      console.error("Error submitting ratings:", error);
      toast.error("Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order || !currentProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Đánh giá sản phẩm
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Sản phẩm {currentProductIndex + 1}/{totalProducts}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
              {currentProduct.productImage ? (
                <img
                  src={currentProduct.productImage}
                  alt={currentProduct.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-xs text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{currentProduct.productName}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Vui lòng đánh giá trải nghiệm của bạn
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tiến độ đánh giá</span>
              <span>{currentProductIndex + 1}/{totalProducts}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentProductIndex + 1) / totalProducts) * 100}%` }}
              />
            </div>
          </div>

          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= currentProduct.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {currentProduct.rating > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {currentProduct.rating === 1 && "Rất tệ"}
                  {currentProduct.rating === 2 && "Tệ"}
                  {currentProduct.rating === 3 && "Bình thường"}
                  {currentProduct.rating === 4 && "Tốt"}
                  {currentProduct.rating === 5 && "Tuyệt vời"}
                </span>
              )}
            </div>
          </div>

          {/* Comment - Optional */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nhận xét của bạn <span className="text-gray-400">(Không bắt buộc)</span>
            </label>
            <Textarea
              value={currentProduct.review}
              onChange={(e) => updateReview(e.target.value)}
              placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {currentProduct.review.length > 0 && `${currentProduct.review.length} ký tự`}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentProductIndex === 0 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting || currentProduct.rating === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : currentProductIndex === totalProducts - 1 ? (
                "Hoàn thành"
              ) : (
                <>
                  Tiếp theo
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}