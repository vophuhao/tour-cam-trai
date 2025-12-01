'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getBooking } from '@/lib/client-actions';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function ConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
  });

  // Type assertion for booking data
  interface BookingData {
    _id: string;
    status: string;
    checkIn: string;
    checkOut: string;
    numberOfGuests: number;
    numberOfPets: number;
    paymentMethod: string;
    guestMessage?: string;
    campsite?: {
      name: string;
      location?: {
        city: string;
        state: string;
      };
    };
    pricing?: {
      subtotal: number;
      cleaningFee: number;
      serviceFee: number;
      tax: number;
      total: number;
    };
  }

  const booking = data?.data as BookingData | undefined;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
          <p className="text-muted-foreground mt-4">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Không tìm thấy thông tin đặt chỗ
            </p>
            <Button
              onClick={() => router.push('/')}
              className="mt-4 w-full"
              variant="outline"
            >
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'default',
    };
    const labels: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-3xl font-bold">Đặt chỗ thành công!</h1>
          <p className="text-muted-foreground mt-2">
            Cảm ơn bạn đã đặt chỗ. Chúng tôi đã gửi email xác nhận đến bạn.
          </p>
        </div>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Chi tiết đặt chỗ</CardTitle>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-muted-foreground text-sm">
              Mã đặt chỗ: {booking._id}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campsite Info */}
            <div>
              <h3 className="mb-2 font-semibold">Địa điểm</h3>
              <div className="flex items-start gap-2">
                <MapPin className="text-muted-foreground mt-1 h-4 w-4" />
                <div>
                  <p className="font-medium">{booking.campsite?.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {booking.campsite?.location?.city},{' '}
                    {booking.campsite?.location?.state}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Check-in/out */}
            <div>
              <h3 className="mb-2 font-semibold">Thời gian</h3>
              <div className="flex items-start gap-2">
                <Calendar className="text-muted-foreground mt-1 h-4 w-4" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Nhận phòng:</span>{' '}
                    {format(new Date(booking.checkIn), 'dd/MM/yyyy', {
                      locale: vi,
                    })}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Trả phòng:</span>{' '}
                    {format(new Date(booking.checkOut), 'dd/MM/yyyy', {
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Guests */}
            <div>
              <h3 className="mb-2 font-semibold">Khách</h3>
              <div className="flex items-start gap-2">
                <Users className="text-muted-foreground mt-1 h-4 w-4" />
                <p className="text-sm">
                  {booking.numberOfGuests} khách
                  {booking.numberOfPets > 0 &&
                    `, ${booking.numberOfPets} thú cưng`}
                </p>
              </div>
            </div>

            <Separator />

            {/* Payment */}
            <div>
              <h3 className="mb-2 font-semibold">Thanh toán</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-muted-foreground h-4 w-4" />
                  <p className="text-sm capitalize">
                    {booking.paymentMethod?.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-muted-foreground space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(booking.pricing?.subtotal || 0)}</span>
                  </div>
                  {(booking.pricing?.cleaningFee ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Phí vệ sinh:</span>
                      <span>
                        {formatPrice(booking.pricing?.cleaningFee ?? 0)}
                      </span>
                    </div>
                  )}
                  {(booking.pricing?.serviceFee ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Phí dịch vụ:</span>
                      <span>
                        {formatPrice(booking.pricing?.serviceFee ?? 0)}
                      </span>
                    </div>
                  )}
                  {(booking.pricing?.tax ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Thuế:</span>
                      <span>{formatPrice(booking.pricing?.tax ?? 0)}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(booking.pricing?.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Guest Message */}
            {booking.guestMessage && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 font-semibold">Lời nhắn</h3>
                  <p className="text-muted-foreground text-sm">
                    {booking.guestMessage}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Button
            onClick={() => router.push('/bookings')}
            variant="outline"
            className="flex-1"
          >
            Xem đặt chỗ của tôi
          </Button>
          <Button onClick={() => router.push('/')} className="flex-1 gap-2">
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
