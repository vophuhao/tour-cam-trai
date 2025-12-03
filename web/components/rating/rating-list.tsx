'use client';

import { useState, useMemo } from 'react';
import RatingStats from './rating-stats';
import RatingFilter from './rating-filter';
import RatingItem from './rating-item';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Rating {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  rating: number;
  review?: string;
  files?: string[];
  adminReply?: {
    message: string;
    repliedAt: Date;
  };
  createdAt: Date;
}

interface RatingListProps {
  ratings: Rating[];
  stats: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
}

export default function RatingList({ ratings, stats }: RatingListProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(5);

  // Filter ratings
  const filteredRatings = useMemo(() => {
    if (selectedRating === null) return ratings;
    return ratings.filter((r) => r.rating === selectedRating);
  }, [ratings, selectedRating]);

  // Paginated ratings
  const displayedRatings = filteredRatings.slice(0, displayCount);
  const hasMore = displayCount < filteredRatings.length;

  // Count by rating
  const counts = useMemo(() => {
    return {
      all: ratings.length,
      5: ratings.filter((r) => r.rating === 5).length,
      4: ratings.filter((r) => r.rating === 4).length,
      3: ratings.filter((r) => r.rating === 3).length,
      2: ratings.filter((r) => r.rating === 2).length,
      1: ratings.filter((r) => r.rating === 1).length,
    };
  }, [ratings]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      {/* <RatingStats stats={stats} /> */}

      {/* Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Lọc đánh giá</h3>
        <RatingFilter
          selectedRating={selectedRating}
          onFilterChange={setSelectedRating}
          counts={counts}
        />
      </div>

      {/* Ratings List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Đánh giá từ khách hàng ({filteredRatings.length})
          </h3>
        </div>

        {filteredRatings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {displayedRatings.map((rating) => (
                <div key={rating._id} className="px-4">
                  <RatingItem rating={rating} />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="p-4 text-center border-t">
                <Button
                  variant="outline"
                  onClick={() => setDisplayCount((prev) => prev + 5)}
                  className="w-full sm:w-auto"
                >
                  <Loader2 className="w-4 h-4 mr-2" />
                  Xem thêm đánh giá
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}