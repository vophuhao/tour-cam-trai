'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  getCampsiteReviews,
  getCampsiteReviewStats,
} from '@/lib/client-actions';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, Star, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

interface ReviewsSectionProps {
  campsiteId: string;
  rating?: {
    average: number;
    count: number;
    breakdown?: {
      cleanliness: number;
      accuracy: number;
      location: number;
      value: number;
      communication: number;
    };
  };
}

export function ReviewsSection({ campsiteId, rating }: ReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch reviews with TanStack Query
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['campsite-reviews', campsiteId, page],
    queryFn: () => getCampsiteReviews(campsiteId, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch stats only once
  const { data: statsData } = useQuery({
    queryKey: ['campsite-review-stats', campsiteId],
    queryFn: () => getCampsiteReviewStats(campsiteId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const reviews = reviewsData?.data || [];
  const stats = statsData?.data;

  if (isLoadingReviews && page === 1) {
    return (
      <div className="space-y-6" id="reviews">
        <h2 className="text-2xl font-bold">Đánh giá</h2>
        <div className="text-muted-foreground py-8 text-center">
          Đang tải...
        </div>
      </div>
    );
  }

  if (!rating || rating.count === 0) {
    return (
      <div className="space-y-6" id="reviews">
        <h2 className="text-2xl font-bold">Đánh giá</h2>
        <div className="text-muted-foreground py-8 text-center">
          Chưa có đánh giá nào
        </div>
      </div>
    );
  }

  // Calculate rating distribution from stats
  const ratingBreakdown = stats?.distribution
    ? [
        { stars: 5, count: stats.distribution[5] || 0 },
        { stars: 4, count: stats.distribution[4] || 0 },
        { stars: 3, count: stats.distribution[3] || 0 },
        { stars: 2, count: stats.distribution[2] || 0 },
        { stars: 1, count: stats.distribution[1] || 0 },
      ].map(item => ({
        ...item,
        percentage:
          rating.count > 0 ? Math.round((item.count / rating.count) * 100) : 0,
      }))
    : [];

  const recommendPercentage =
    rating.average >= 4 ? 95 : rating.average >= 3 ? 75 : 60;

  return (
    <div className="space-y-6" id="reviews">
      <h2 className="text-2xl font-bold">Đánh giá</h2>

      {rating && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Overall Rating */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                <span className="text-3xl font-bold">{rating.average}</span>
              </div>
              <span className="text-muted-foreground">
                ({rating.count} đánh giá)
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <ThumbsUp className="h-4 w-4" />
                <span className="font-semibold">{recommendPercentage}%</span>
                <span className="text-muted-foreground">Khuyến nghị</span>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {ratingBreakdown.map(({ stars, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 text-sm font-medium">{stars} sao</span>
                <Progress value={percentage} className="flex-1" />
                <span className="text-muted-foreground w-12 text-right text-sm">
                  {percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Search Reviews */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input placeholder="Tìm kiếm đánh giá..." className="pl-9" />
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review._id} className="space-y-3">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={review.guest.avatarUrl} />
                <AvatarFallback>
                  {(review.guest.username || review.guest.email)
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {review.guest.username ||
                        review.guest.email.split('@')[0]}
                    </p>
                    {review.isVerified && (
                      <p className="text-muted-foreground text-xs">
                        ✓ Đã xác thực booking
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {review.ratings.overall}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {review.title && (
                    <Badge variant="secondary" className="font-medium">
                      {review.title}
                    </Badge>
                  )}
                  <span className="text-muted-foreground">
                    {format(new Date(review.createdAt), 'MMMM yyyy', {
                      locale: vi,
                    })}
                  </span>
                </div>

                <p className="text-sm">{review.comment}</p>

                {/* Pros/Cons */}
                {(review.pros && review.pros.length > 0) ||
                (review.cons && review.cons.length > 0) ? (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {review.pros?.map((pro: string, i: number) => (
                      <Badge
                        key={`pro-${i}`}
                        variant="outline"
                        className="border-green-300 text-green-600"
                      >
                        + {pro}
                      </Badge>
                    ))}
                    {review.cons?.map((con: string, i: number) => (
                      <Badge
                        key={`con-${i}`}
                        variant="outline"
                        className="border-orange-300 text-orange-600"
                      >
                        - {con}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {/* Host Response */}
                {review.hostResponse && (
                  <div className="border-primary/20 mt-3 ml-4 border-l-2 pl-4">
                    <p className="mb-1 text-xs font-semibold">
                      Phản hồi từ chủ nhà
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {review.hostResponse.comment}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {format(
                        new Date(review.hostResponse.respondedAt),
                        'dd/MM/yyyy',
                        { locale: vi },
                      )}
                    </p>
                  </div>
                )}

                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  <ThumbsUp className="mr-1 h-3 w-3" />
                  Hữu ích ({review.helpfulCount})
                </Button>
              </div>
            </div>
            <Separator />
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          Không tìm thấy đánh giá
        </div>
      )}

      {rating.count > limit && reviews.length >= limit && (
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={() => setPage(p => p + 1)}
          disabled={isLoadingReviews}
        >
          {isLoadingReviews
            ? 'Đang tải...'
            : `Xem thêm (${rating.count - reviews.length} còn lại)`}
        </Button>
      )}
    </div>
  );
}
