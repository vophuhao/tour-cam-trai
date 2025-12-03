'use client';

import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RatingFilterProps {
  selectedRating: number | null;
  onFilterChange: (rating: number | null) => void;
  counts: {
    all: number;
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function RatingFilter({ selectedRating, onFilterChange, counts }: RatingFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedRating === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange(null)}
        className="h-8"
      >
        Tất cả ({counts.all})
      </Button>

      {[5, 4, 3, 2, 1].map((rating) => (
        <Button
          key={rating}
          variant={selectedRating === rating ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(rating)}
          className="h-8"
        >
          <Star className="w-3.5 h-3.5 mr-1 fill-yellow-400 text-yellow-400" />
          {rating} ({counts[rating as keyof typeof counts]})
        </Button>
      ))}
    </div>
  );
}