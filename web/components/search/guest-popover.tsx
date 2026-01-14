'use client';

import { Minus, Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface GuestPopoverProps {
  /** Number of adults (minimum 1) */
  adults: number;
  /** Number of children */
  childrenCount: number;
  /** Number of pets */
  pets: number;
  /** Callback when adults count changes */
  onAdultsChange: (value: number) => void;
  /** Callback when children count changes */
  onChildrenChange: (value: number) => void;
  /** Callback when pets count changes */
  onPetsChange: (value: number) => void;
  /** Open state of the popover (controlled) */
  open?: boolean;
  /** Callback when open state changes (controlled) */
  onOpenChange?: (open: boolean) => void;
  /** Maximum allowed guests (adults + children) */
  maxGuests?: number;
  /** Maximum allowed pets */
  maxPets?: number;
  /** Whether to show pets option */
  showPets?: boolean;
  /** Custom button className */
  buttonClassName?: string;
  /** Custom popover alignment */
  align?: 'start' | 'center' | 'end';
  /** Custom icon component */
  icon?: React.ReactNode;
  /** Labels for customization */
  labels?: {
    adults?: string;
    adultsSubtext?: string;
    children?: string;
    childrenSubtext?: string;
    pets?: string;
    petsSubtext?: string;
    guestsText?: (guests: number) => string;
    childrenText?: (children: number) => string;
    petsText?: (pets: number) => string;
  };
}

/**
 * Reusable GuestPopover component for selecting guest counts
 * Used across search-bar, property-booking-card, and sites-list-section
 *
 * Features:
 * - Configurable capacity limits
 * - Optional pets section
 * - Minimum 1 adult enforced
 * - Increment/decrement controls with validation
 * - Fully accessible with proper ARIA labels
 * - Customizable labels for i18n
 */
export function GuestPopover({
  adults,
  childrenCount,
  pets,
  onAdultsChange,
  onChildrenChange,
  onPetsChange,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  maxGuests = 20,
  maxPets = 5,
  showPets = true,
  buttonClassName,
  align = 'start',
  icon,
  labels = {},
}: GuestPopoverProps) {
  const defaultLabels = {
    adults: labels.adults || 'Người lớn',
    adultsSubtext: labels.adultsSubtext || 'Từ 13 tuổi trở lên',
    children: labels.children || 'Trẻ em',
    childrenSubtext: labels.childrenSubtext || 'Từ 0-12 tuổi',
    pets: labels.pets || 'Thú cưng',
    petsSubtext: labels.petsSubtext || `Tối đa ${maxPets}`,
    guestsText:
      labels.guestsText ||
      ((guests: number) => `${guests} khách${guests > 1 ? '' : ''}`),
    childrenText:
      labels.childrenText || ((children: number) => `${children} trẻ em`),
    petsText: labels.petsText || ((pets: number) => `${pets} thú cưng`),
  };

  const totalGuests = adults + childrenCount;

  const formatGuestsDisplay = () => {
    const parts: string[] = [defaultLabels.guestsText(totalGuests)];

    if (childrenCount > 0) {
      parts[0] = parts[0] + ` (${defaultLabels.childrenText(childrenCount)})`;
    }

    if (showPets && pets > 0) {
      parts.push(defaultLabels.petsText(pets));
    }

    return parts.join(', ');
  };

  const handleAdultsChange = (delta: number) => {
    const newValue = Math.max(1, adults + delta);
    // Check if total guests would exceed capacity
    if (newValue + childrenCount <= maxGuests) {
      onAdultsChange(newValue);
    }
  };

  const handleChildrenChange = (delta: number) => {
    const newValue = Math.max(0, childrenCount + delta);
    // Check if total guests would exceed capacity
    if (adults + newValue <= maxGuests) {
      onChildrenChange(newValue);
    }
  };

  const handlePetsChange = (delta: number) => {
    const newValue = Math.max(0, pets + delta);
    if (newValue <= maxPets) {
      onPetsChange(newValue);
    }
  };

  return (
    <Popover open={controlledOpen} onOpenChange={controlledOnOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-start text-left font-normal', buttonClassName)}
        >
          {icon !== undefined ? icon : <Users className="mr-2 h-4 w-4" />}
          <span>{formatGuestsDisplay()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align={align}>
        <div className="space-y-4">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{defaultLabels.adults}</p>
              <p className="text-muted-foreground text-xs">
                {defaultLabels.adultsSubtext}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleAdultsChange(-1)}
                disabled={adults <= 1}
                aria-label="Giảm số người lớn"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center" aria-live="polite">
                {adults}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleAdultsChange(1)}
                disabled={totalGuests >= maxGuests}
                aria-label="Tăng số người lớn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{defaultLabels.children}</p>
              <p className="text-muted-foreground text-xs">
                {defaultLabels.childrenSubtext}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChildrenChange(-1)}
                disabled={childrenCount <= 0}
                aria-label="Giảm số trẻ em"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center" aria-live="polite">
                {childrenCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChildrenChange(1)}
                disabled={totalGuests >= maxGuests}
                aria-label="Tăng số trẻ em"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Pets */}
          {showPets && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{defaultLabels.pets}</p>
                <p className="text-muted-foreground text-xs">
                  {defaultLabels.petsSubtext}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handlePetsChange(-1)}
                  disabled={pets <= 0}
                  aria-label="Giảm số thú cưng"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center" aria-live="polite">
                  {pets}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handlePetsChange(1)}
                  disabled={pets >= maxPets}
                  aria-label="Tăng số thú cưng"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
