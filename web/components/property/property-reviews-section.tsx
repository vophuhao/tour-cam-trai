'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star } from 'lucide-react';

interface PropertyReviewsSectionProps {
  propertyId: string;
  rating?: {
    average: number;
    count: number;
    breakdown: {
      location: number;
      communication: number;
      value: number;
    };
  };
}

export function PropertyReviewsSection({
  rating,
}: PropertyReviewsSectionProps) {
  if (!rating || rating.count === 0) {
    return (
      <div className="space-y-6" id="reviews">
        <h2 className="text-2xl font-bold">Đánh giá</h2>
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center">
            <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ratingCategories = [
    { name: 'Vị trí', value: rating.breakdown.location },
    { name: 'Giao tiếp', value: rating.breakdown.communication },
    { name: 'Giá trị', value: rating.breakdown.value },
  ];

  return (
    <div className="space-y-6" id="reviews">
      <div>
        <h2 className="text-2xl font-bold">Đánh giá</h2>
        <div className="mt-2 flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="text-lg font-semibold">
            {rating.average.toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            · {rating.count} đánh giá
          </span>
        </div>
      </div>

      {/* Rating Categories */}
      <div className="grid gap-4 sm:grid-cols-3">
        {ratingCategories.map(category => (
          <div key={category.name} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-sm font-semibold">
                {category.value.toFixed(1)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${(category.value / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <Card>
        <CardContent className="flex min-h-[100px] items-center justify-center p-6">
          <p className="text-muted-foreground text-sm">
            Xem chi tiết các đánh giá từng vị trí cắm trại bên dưới
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
