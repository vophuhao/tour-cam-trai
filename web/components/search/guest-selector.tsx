'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface GuestSelectorProps {
  guests: number;
  childrenCount: number;
  pets: number;
  onGuestsChange: (guests: number) => void;
  onChildrenChange: (children: number) => void;
  onPetsChange: (pets: number) => void;
}

export function GuestSelector({
  guests,
  childrenCount,
  pets,
  onGuestsChange,
  onChildrenChange,
  onPetsChange,
}: GuestSelectorProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Adults */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold">Người lớn</p>
          <p className="text-sm text-gray-600">Từ 13 tuổi trở lên</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2"
            onClick={() => onGuestsChange(Math.max(1, guests - 1))}
            disabled={guests === 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-lg font-medium">{guests}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2"
            onClick={() => onGuestsChange(guests + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-t" />

      {/* Children */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold">Trẻ em</p>
          <p className="text-sm text-gray-600">Dưới 12 tuổi</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2"
            onClick={() => onChildrenChange(Math.max(0, childrenCount - 1))}
            disabled={childrenCount === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-lg font-medium">
            {childrenCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2"
            onClick={() => onChildrenChange(childrenCount + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-t" />

      {/* Pets */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div>
            <p className="font-semibold">Thú cưng</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2"
            onClick={() => onPetsChange(Math.max(0, pets - 1))}
            disabled={pets === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-lg font-medium">{pets}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2"
            onClick={() => onPetsChange(pets + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
