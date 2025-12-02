/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { getAllTours } from '@/lib/client-actions';
import { createBooking } from '@/lib/api';
import { toast } from 'sonner';

type TourOption = { _id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (created: any) => void;
};

type FormValues = {
  tourId: string;
  dateFrom: string;
  dateTo: string;
  totalSeats: number | string;
  note?: string;
};

export default function BookingTourModal({ open, onOpenChange, onCreated }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { tourId: '', dateFrom: '', dateTo: '', totalSeats: 10, note: '' },
  });

  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState<TourOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const watchTourId = watch('tourId');
  const watchDateFrom = watch('dateFrom');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAllTours();
        if (!mounted) return;
        setTours(Array.isArray(res.data) ? res.data : res?.data ?? []);
      } catch (err) {
        console.error(err);
        if (mounted) setTours([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);


  const onSubmit = async (values: FormValues) => {
    setError(null);

    if (!values.tourId) {
      setError('Vui lòng chọn tour.');
      return;
    }

    // Basic validation: dateTo must be same or after dateFrom
    if (values.dateFrom && values.dateTo && new Date(values.dateTo) < new Date(values.dateFrom)) {
      setError('Ngày về phải cùng hoặc sau ngày đi.');
      return;
    }

    // Ensure totalSeats is a finite positive integer (require at least 1)
    const raw = values.totalSeats;
    const seats =
      typeof raw === 'number'
        ? raw
        : raw && typeof raw === 'string'
          ? parseInt(raw.replace(/\D/g, ''), 10)
          : NaN;

    if (!Number.isFinite(seats) || seats < 1) {
      setError('Số chỗ không hợp lệ. Vui lòng nhập số nguyên >= 1.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tour: values.tourId,
        dateFrom: new Date(values.dateFrom).toISOString(),
        dateTo: new Date(values.dateTo).toISOString(),
        availableSeats: Math.floor(seats),
        totalSeats: Math.floor(seats),
        note: values.note || undefined,
      };

      const res = await createBooking(payload);
      if (res.success) {
        reset();
        toast.success('Tạo booking tour thành công!');
      }

      onOpenChange(false);
      onCreated?.(res?.data ?? res);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Lỗi khi tạo');
    } finally {
      setLoading(false);
    }
  };


  const selectedTour = tours.find((t) => t._id === watchTourId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Tạo lịch tour mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Label htmlFor="tour">Chọn tour</Label>
              <select
                id="tour"
                {...register('tourId', { required: 'Vui lòng chọn tour' })}
                className="w-full rounded-md border px-3 py-2 bg-white"
                aria-invalid={!!errors.tourId}
              >
                <option value="">-- Chọn tour --</option>
                {tours.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.tourId && <div className="text-sm text-red-600">{errors.tourId.message}</div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="dateFrom">Ngày đi</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  {...register('dateFrom', { required: 'Vui lòng chọn ngày đi' })}
                  aria-invalid={!!errors.dateFrom}
                />
                {errors.dateFrom && <div className="text-sm text-red-600">{errors.dateFrom.message}</div>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="dateTo">Ngày về</Label>
                <Input
                  id="dateTo"
                  type="date"
                  {...register('dateTo', { required: 'Vui lòng chọn ngày về' })}
                  min={watchDateFrom || undefined}
                  aria-invalid={!!errors.dateTo}
                />
                {errors.dateTo && <div className="text-sm text-red-600">{errors.dateTo.message}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="totalSeats">Số chỗ</Label>
                <Input
                  id="totalSeats"
                  type="number"
                  min={0}
                  step={1}
                  {...register('totalSeats', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Số chỗ phải >= 0' },
                  })}
                  aria-invalid={!!errors.totalSeats}
                />
                {errors.totalSeats && <div className="text-sm text-red-600">{errors.totalSeats.message}</div>}
              </div>

              <div className="space-y-1">
                <Label>Preview</Label>
                <div className="rounded-md border px-3 py-2 bg-muted/50 min-h-[44px]">
                  <div className="text-sm text-muted-foreground">{selectedTour ? selectedTour.name : 'Chưa chọn tour'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
              <Textarea id="note" rows={3} {...register('note')} />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Separator />

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setError(null);
                  onOpenChange(false);
                }}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang tạo...' : 'Tạo lịch'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}