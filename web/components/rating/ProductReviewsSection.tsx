'use client';

import { useQuery } from '@tanstack/react-query';
import RatingList from './rating-list';
import { Skeleton } from '@/components/ui/skeleton';
import { getRatingsByProductId } from '@/lib/client-actions';

interface ProductReviewsSectionProps {
  productId: string;
}

export default function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ratings', productId],
    queryFn: async () => {
      const response = await getRatingsByProductId(productId);
      if (!response.success) throw new Error('Failed to fetch ratings');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Có lỗi xảy ra khi tải đánh giá</p>
      </div>
    );
  }

  return <RatingList ratings={(data as Rating[]) || []} stats={{
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
      }
  }}  />;
}