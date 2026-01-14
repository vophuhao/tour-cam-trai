'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { createReview } from '@/lib/client-actions';
import type { Property, Site } from '@/types/property-site';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Home,
  MessageSquare,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PropertySiteReviewFormProps {
  property: Property;
  site: Site;
  bookingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PropertySiteReviewForm({
  property,
  site,
  bookingId,
  onSuccess,
  onCancel,
}: PropertySiteReviewFormProps) {
  const queryClient = useQueryClient();

  // Property Ratings (1-5 stars)
  const [locationRating, setLocationRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);

  // Site Ratings (1-5 stars)
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [accuracyRating, setAccuracyRating] = useState(0);

  // Review Text
  const [reviewText, setReviewText] = useState('');

  // Calculate overall rating (average of all 5 categories)
  const overallRating =
    (locationRating +
      communicationRating +
      valueRating +
      cleanlinessRating +
      accuracyRating) /
    5;

  const isFormValid =
    locationRating > 0 &&
    communicationRating > 0 &&
    valueRating > 0 &&
    cleanlinessRating > 0 &&
    accuracyRating > 0 &&
    reviewText.trim().length >= 10;

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: async () => {
      return createReview({
        booking: bookingId,
        property: property._id,
        site: site._id,
        propertyRatings: {
          location: locationRating,
          communication: communicationRating,
          value: valueRating,
        },
        siteRatings: {
          cleanliness: cleanlinessRating,
          accuracy: accuracyRating,
        },
        comment: reviewText,
      });
    },
    onSuccess: () => {
      toast.success('Cảm ơn bạn đã đánh giá!');
      queryClient.invalidateQueries({ queryKey: ['property', property._id] });
      queryClient.invalidateQueries({ queryKey: ['site', site._id] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    reviewMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall Rating Preview */}
      <Card className="border-primary/20 bg-primary/5 border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Đánh giá tổng thể</p>
              <p className="text-3xl font-bold">
                {overallRating > 0 ? overallRating.toFixed(1) : '—'}
              </p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= Math.round(overallRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Trung bình từ 5 tiêu chí đánh giá
          </p>
        </CardContent>
      </Card>

      {/* Property Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="text-primary h-5 w-5" />
            Đánh giá Property - {property.name}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Đánh giá về khu đất, vị trí và giao tiếp với chủ nhà
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Vị trí & Môi trường
              </Label>
              <span className="text-sm font-semibold">
                {locationRating > 0 ? locationRating : '—'} / 5
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Địa điểm, cảnh quan, hướng dẫn đến property
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setLocationRating(star)}
                  className="focus:ring-primary rounded transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= locationRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Communication Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Giao tiếp với Chủ nhà
              </Label>
              <span className="text-sm font-semibold">
                {communicationRating > 0 ? communicationRating : '—'} / 5
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Phản hồi nhanh, thân thiện, hỗ trợ nhiệt tình
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCommunicationRating(star)}
                  className="focus:ring-primary rounded transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= communicationRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Value Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Đáng Giá Tiền</Label>
              <span className="text-sm font-semibold">
                {valueRating > 0 ? valueRating : '—'} / 5
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Giá cả hợp lý so với chất lượng và dịch vụ
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValueRating(star)}
                  className="focus:ring-primary rounded transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= valueRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="text-primary h-5 w-5" />
            Đánh giá Site - {site.name}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Đánh giá về vị trí cắm trại cụ thể và tiện nghi
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cleanliness Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Sạch sẽ & Vệ sinh</Label>
              <span className="text-sm font-semibold">
                {cleanlinessRating > 0 ? cleanlinessRating : '—'} / 5
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Độ sạch sẽ của khu vực cắm trại, toilet, tiện nghi
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCleanlinessRating(star)}
                  className="focus:ring-primary rounded transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= cleanlinessRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Accuracy Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Chính xác & Mô tả</Label>
              <span className="text-sm font-semibold">
                {accuracyRating > 0 ? accuracyRating : '—'} / 5
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Thực tế có đúng như mô tả không? Ảnh, tiện nghi, kích thước?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setAccuracyRating(star)}
                  className="focus:ring-primary rounded transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= accuracyRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Text */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="text-primary h-5 w-5" />
            Chi tiết trải nghiệm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Chia sẻ chi tiết về trải nghiệm của bạn... (tối thiểu 10 ký tự)&#10;&#10;- Điều gì bạn thích nhất?&#10;- Có gì cần cải thiện không?&#10;- Bạn có gợi ý gì cho khách tương lai?"
            rows={6}
            className="resize-none"
            maxLength={2000}
          />
          <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
            <span>Tối thiểu 10 ký tự</span>
            <span>{reviewText.length} / 2000</span>
          </div>
        </CardContent>
      </Card>

      {/* Rating Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-medium">Mẹo viết đánh giá chất lượng:</p>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start gap-2">
                  <TrendingUp className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  <span>
                    Đánh giá trung thực giúp chủ nhà cải thiện và khách tương
                    lai có quyết định tốt hơn
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  <span>
                    Chia sẻ cả điểm mạnh và điểm cần cải thiện một cách xây dựng
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  <span>
                    Đề cập cụ thể về tiện nghi, vị trí, dịch vụ của chủ nhà
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={reviewMutation.isPending}
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          disabled={!isFormValid || reviewMutation.isPending}
        >
          {reviewMutation.isPending ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang gửi...
            </>
          ) : (
            'Gửi đánh giá'
          )}
        </Button>
      </div>

      {/* Validation Message */}
      {!isFormValid && (
        <p className="text-muted-foreground text-center text-sm">
          Vui lòng đánh giá đầy đủ 5 tiêu chí và viết nhận xét (tối thiểu 10 ký
          tự)
        </p>
      )}
    </form>
  );
}
