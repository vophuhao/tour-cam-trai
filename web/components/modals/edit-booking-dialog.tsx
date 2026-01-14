'use client';

import { DateRangePopover } from '@/components/search/date-range-popover';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getBlockedDates, updateBooking } from '@/lib/client-actions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface EditBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  siteId: string; // Need siteId to fetch blocked dates
  currentData: {
    checkIn: string;
    checkOut: string;
    numberOfGuests: number;
    numberOfPets?: number;
    numberOfVehicles?: number;
    guestMessage?: string;
  };
  siteCapacity?: {
    maxGuests: number;
    maxPets?: number;
    maxVehicles?: number;
  };
  sitePricing?: {
    basePrice: number;
    weekendPrice?: number;
    cleaningFee?: number;
    petFee?: number;
    additionalGuestFee?: number;
    vehicleFee?: number;
  };
}

export function EditBookingDialog({
  isOpen,
  onClose,
  bookingId,
  siteId,
  currentData,
  siteCapacity,
  sitePricing,
}: EditBookingDialogProps) {
  const queryClient = useQueryClient();

  // Initialize form state from props (only on mount or when currentData changes)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(
    () => ({
      from: new Date(currentData.checkIn),
      to: new Date(currentData.checkOut),
    }),
  );
  const [numberOfGuests, setNumberOfGuests] = useState(
    currentData.numberOfGuests,
  );
  const [numberOfPets, setNumberOfPets] = useState(
    currentData.numberOfPets || 0,
  );
  const [numberOfVehicles, setNumberOfVehicles] = useState(
    currentData.numberOfVehicles || 1,
  );
  const [guestMessage, setGuestMessage] = useState(
    currentData.guestMessage || '',
  );
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Reset form when dialog closes and reopens with new data
  useEffect(() => {
    if (!isOpen) return; // Only run when dialog is opened

    setDateRange({
      from: new Date(currentData.checkIn),
      to: new Date(currentData.checkOut),
    });
    setNumberOfGuests(currentData.numberOfGuests);
    setNumberOfPets(currentData.numberOfPets || 0);
    setNumberOfVehicles(currentData.numberOfVehicles || 1);
    setGuestMessage(currentData.guestMessage || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]); // Only reset when booking changes, not every open

  // Fetch blocked dates for the site (6 months window)
  const availabilityWindow = useMemo(() => {
    const today = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(today.getMonth() + 6);
    return {
      checkIn: today.toISOString(),
      checkOut: sixMonthsLater.toISOString(),
    };
  }, []);

  const { data: blockedDatesData } = useQuery({
    queryKey: ['site-blocked-dates', siteId, availabilityWindow],
    queryFn: () =>
      getBlockedDates(
        siteId,
        availabilityWindow.checkIn,
        availabilityWindow.checkOut,
      ),
    enabled: !!siteId && isOpen,
  });

  // Convert blocked dates strings to Date objects, excluding current booking dates
  const disabledDates = useMemo(() => {
    if (!blockedDatesData?.data?.blockedDates) return [];

    const currentCheckIn = new Date(currentData.checkIn)
      .toISOString()
      .split('T')[0];
    const currentCheckOut = new Date(currentData.checkOut)
      .toISOString()
      .split('T')[0];

    return blockedDatesData.data.blockedDates
      .filter(dateStr => {
        // Don't disable dates from current booking
        return dateStr !== currentCheckIn && dateStr !== currentCheckOut;
      })
      .map(dateStr => new Date(dateStr));
  }, [blockedDatesData, currentData.checkIn, currentData.checkOut]);

  // Calculate pricing preview
  const pricingPreview = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !sitePricing) return null;

    const nights = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (nights <= 0) return null;

    const basePrice = sitePricing.basePrice || 0;
    const weekendPrice = sitePricing.weekendPrice || basePrice;
    const cleaningFee = sitePricing.cleaningFee || 0;
    const petFee = sitePricing.petFee || 0;
    const additionalGuestFee = sitePricing.additionalGuestFee || 0;
    const maxGuests = siteCapacity?.maxGuests || 1;

    // Count weekend nights (Friday & Saturday)
    let weekendNights = 0;
    const currentDate = new Date(dateRange.from);
    while (currentDate < dateRange.to) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        weekendNights++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const weekdayNights = nights - weekendNights;
    const subtotal =
      weekdayNights * basePrice + weekendNights * weekendPrice;
    const petsFee = numberOfPets > 0 ? petFee * numberOfPets : 0;
    const extraGuestFee =
      numberOfGuests > maxGuests
        ? additionalGuestFee * (numberOfGuests - maxGuests)
        : 0;

    const total = subtotal + cleaningFee + petsFee + extraGuestFee;

    return {
      nights,
      weekdayNights,
      weekendNights,
      basePrice,
      weekendPrice,
      subtotal,
      cleaningFee,
      petFee: petsFee,
      extraGuestFee,
      total,
    };
  }, [dateRange, numberOfGuests, numberOfPets, sitePricing, siteCapacity]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error('Vui lòng chọn ngày check-in và check-out');
      }

      return updateBooking(bookingId, {
        checkIn: dateRange.from.toISOString(),
        checkOut: dateRange.to.toISOString(),
        numberOfGuests,
        numberOfPets,
        numberOfVehicles,
        guestMessage: guestMessage || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Cập nhật đặt chỗ thành công', {
        description: 'Thông tin booking đã được cập nhật.',
      });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error('Không thể cập nhật đặt chỗ', {
        description: error?.message || 'Vui lòng thử lại sau.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Vui lòng chọn ngày check-in và check-out');
      return;
    }

    if (siteCapacity) {
      if (numberOfGuests > siteCapacity.maxGuests) {
        toast.error(
          `Số lượng khách không được vượt quá ${siteCapacity.maxGuests}`,
        );
        return;
      }

      if (numberOfPets > (siteCapacity.maxPets || 0)) {
        toast.error(
          `Số lượng thú cưng không được vượt quá ${siteCapacity.maxPets || 0}`,
        );
        return;
      }

      if (numberOfVehicles > (siteCapacity.maxVehicles || 1)) {
        toast.error(
          `Số lượng xe không được vượt quá ${siteCapacity.maxVehicles || 1}`,
        );
        return;
      }
    }

    updateMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Chỉnh sửa đặt chỗ</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin ngày đặt và số lượng khách cho chuyến đi của bạn.
          </DialogDescription>  
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Range Picker */}
          <div className="space-y-2">
            <Label>Ngày đặt chỗ</Label>
            <DateRangePopover
              dateRange={dateRange}
              onDateChange={(date) => date && setDateRange(date)}
              disabledDates={disabledDates}
              open={datePopoverOpen}
              onOpenChange={setDatePopoverOpen}
              placeholder="Chọn ngày check-in và check-out"
              buttonClassName="w-full"
              autoClose={true}
            />
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests">
              Số lượng khách{' '}
              {siteCapacity && `(Tối đa: ${siteCapacity.maxGuests})`}
            </Label>
            <Input
              id="guests"
              type="number"
              min={1}
              max={siteCapacity?.maxGuests || 50}
              value={numberOfGuests}
              onChange={e => setNumberOfGuests(Number(e.target.value))}
            />
          </div>

          {/* Number of Pets */}
          {(siteCapacity?.maxPets ?? 0) > 0 && (
            <div className="space-y-2">
              <Label htmlFor="pets">
                Số lượng thú cưng (Tối đa: {siteCapacity?.maxPets})
              </Label>
              <Input
                id="pets"
                type="number"
                min={0}
                max={siteCapacity?.maxPets || 10}
                value={numberOfPets}
                onChange={e => setNumberOfPets(Number(e.target.value))}
              />
            </div>
          )}

          {/* Number of Vehicles */}
          <div className="space-y-2">
            <Label htmlFor="vehicles">
              Số lượng xe{' '}
              {siteCapacity && `(Tối đa: ${siteCapacity.maxVehicles || 1})`}
            </Label>
            <Input
              id="vehicles"
              type="number"
              min={0}
              max={siteCapacity?.maxVehicles || 20}
              value={numberOfVehicles}
              onChange={e => setNumberOfVehicles(Number(e.target.value))}
            />
          </div>

          {/* Pricing Preview */}
          {pricingPreview && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium text-sm">Giá dự kiến</h4>
              <div className="space-y-1 text-sm">
                {pricingPreview.weekendNights > 0 ? (
                  <>
                    {pricingPreview.weekdayNights > 0 && (
                      <div className="flex justify-between">
                        <span>
                          {pricingPreview.basePrice.toLocaleString('vi-VN')} ×{' '}
                          {pricingPreview.weekdayNights} đêm thường
                        </span>
                        <span>
                          {
                            (
                              pricingPreview.basePrice *
                              pricingPreview.weekdayNights
                            ).toLocaleString('vi-VN')
                          }
                          ₫
                        </span>
                      </div>
                    )}
                    {pricingPreview.weekendNights > 0 && (
                      <div className="flex justify-between">
                        <span>
                          {pricingPreview.weekendPrice.toLocaleString('vi-VN')}{' '}
                          × {pricingPreview.weekendNights} đêm cuối tuần
                        </span>
                        <span>
                          {
                            (
                              pricingPreview.weekendPrice *
                              pricingPreview.weekendNights
                            ).toLocaleString('vi-VN')
                          }
                          ₫
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>
                      {pricingPreview.basePrice.toLocaleString('vi-VN')} ×{' '}
                      {pricingPreview.nights} đêm
                    </span>
                    <span>
                      {pricingPreview.subtotal.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}

                {pricingPreview.cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span>Phí vệ sinh</span>
                    <span>
                      {pricingPreview.cleaningFee.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}

                {pricingPreview.petFee > 0 && (
                  <div className="flex justify-between">
                    <span>Phí thú cưng</span>
                    <span>
                      {pricingPreview.petFee.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}

                {pricingPreview.extraGuestFee > 0 && (
                  <div className="flex justify-between">
                    <span>Phí khách thêm</span>
                    <span>
                      {pricingPreview.extraGuestFee.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span>
                    {pricingPreview.total.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Guest Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Lời nhắn cho host (Tùy chọn)</Label>
            <Textarea
              id="message"
              placeholder="Thêm lời nhắn cho host..."
              value={guestMessage}
              onChange={e => setGuestMessage(e.target.value)}
              maxLength={1000}
              rows={3}
            />
            <p className="text-muted-foreground text-xs">
              {guestMessage.length}/1000 ký tự
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang cập nhật...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
