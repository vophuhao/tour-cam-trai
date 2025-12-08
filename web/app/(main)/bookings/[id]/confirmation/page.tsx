'use client';

import { ReviewDialog } from '@/components/reviews/review-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  cancelBooking,
  completeBooking,
  getBooking,
} from '@/lib/client-actions';
import { useAuthStore } from '@/store/auth.store';
import type { Property, Site } from '@/types/property-site';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Backend Booking type matching the populated response
interface BookingData {
  _id: string;
  code?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  numberOfPets?: number;
  numberOfVehicles?: number;
  nights: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: string;
  guestMessage?: string;
  hostMessage?: string;
  payOSOrderCode?: string;
  payOSCheckoutUrl?: string;

  // New Property-Site architecture
  property?: Partial<Property>;
  site?: Partial<Site> & {
    property?: Partial<Property> & {
      host?: {
        _id: string;
        fullName: string;
        username: string;
        avatarUrl?: string;
      };
    };
  };

  // Legacy campsite support (for backward compatibility)
  campsite?: {
    _id: string;
    name: string;
    slug?: string;
    images?: string[];
    checkInTime?: string;
    checkOutTime?: string;
    location?: {
      city: string;
      state: string;
      address?: string;
    };
    host?: {
      _id: string;
      name: string;
      avatar?: string;
    };
  };

  guest?: {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };

  host?: {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };

  pricing?: {
    basePrice: number;
    totalNights: number;
    subtotal: number;
    cleaningFee?: number;
    petFee?: number;
    extraGuestFee?: number;
    serviceFee: number;
    tax: number;
    total: number;
  };

  reviewed?: boolean;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Cancel dialog state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // Review dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
  });
  console.log('Booking data:', data);
  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: (cancellationReason: string) =>
      cancelBooking(bookingId, { cancellationReason }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['booking', bookingId] });
      const previousBooking = queryClient.getQueryData(['booking', bookingId]);
      return { previousBooking };
    },
    onSuccess: () => {
      toast.success('Đã hủy đặt chỗ thành công', {
        description:
          'Chúng tôi sẽ xử lý hoàn tiền trong vòng 5-7 ngày làm việc.',
      });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      setIsCancelDialogOpen(false);
      setCancellationReason('');
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousBooking) {
        queryClient.setQueryData(
          ['booking', bookingId],
          context.previousBooking,
        );
      }
      toast.error('Không thể hủy đặt chỗ', {
        description: error?.message || 'Vui lòng thử lại sau.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });

  // Complete booking mutation
  const completeMutation = useMutation({
    mutationFn: () => completeBooking(bookingId),
    onSuccess: () => {
      toast.success('Đã hoàn thành chuyến đi', {
        description: 'Bạn có thể đánh giá trải nghiệm của mình ngay bây giờ.',
      });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
    },
    onError: (error: Error) => {
      toast.error('Không thể hoàn thành chuyến đi', {
        description: error?.message || 'Vui lòng thử lại sau.',
      });
    },
  });

  const handleCancelBooking = () => {
    if (!cancellationReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    if (cancellationReason.trim().length < 10) {
      toast.error('Lý do hủy phải có ít nhất 10 ký tự');
      return;
    }

    if (cancellationReason.trim().length > 500) {
      toast.error('Lý do hủy không được vượt quá 500 ký tự');
      return;
    }

    cancelMutation.mutate(cancellationReason);
  };

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

  const getStatusBadge = (status: BookingData['status']) => {
    const styles: Record<BookingData['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const labels: Record<BookingData['status'], string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành',
      refunded: 'Đã hoàn tiền',
    };
    return (
      <Badge className={`${styles[status]} px-3 py-1`}>{labels[status]}</Badge>
    );
  };

  // Get images: prefer site photos, fallback to property photos, then campsite images
  const siteImages =
    booking.site?.photos?.map(p => p.url) ||
    booking.property?.photos?.map(p => p.url) ||
    booking.campsite?.images ||
    [];
  const images =
    siteImages.length > 0 ? siteImages : ['/placeholder-campsite.jpg'];

  // Get property and site info (support both new and legacy structure)
  const property = booking.site?.property || booking.property;
  const site = booking.site;
  const siteName = site?.name || booking.campsite?.name || 'Site';
  const propertyName = property?.name || booking.campsite?.host?.name || '';
  const location = property?.location || booking.campsite?.location;

  // Booking times - prefer site booking settings, fallback to campsite or defaults
  const checkInTime =
    site?.bookingSettings?.checkInTime ||
    booking.campsite?.checkInTime ||
    '14:00';
  const checkOutTime =
    site?.bookingSettings?.checkOutTime ||
    booking.campsite?.checkOutTime ||
    '12:00';

  // Check if cancellable (only pending/confirmed bookings can be cancelled)
  const isCancellable =
    ['pending', 'confirmed'].includes(booking.status) &&
    new Date(booking.checkIn) > new Date() &&
    booking.paymentStatus !== 'pending';

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10 mt-20 flex gap-2 sm:left-6">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
          onClick={() => router.push('/')}
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>

      {/* Image Carousel */}
      <div className="relative h-[300px] w-full md:h-[450px]">
        <Carousel
          opts={{
            loop: true,
          }}
          className="h-full w-full"
        >
          <CarouselContent className="ml-0 h-full">
            {images.map((image, index) => (
              <CarouselItem key={index} className="h-full pl-1 md:basis-1/2">
                <div className="relative h-[300px] w-full md:h-[450px]">
                  <Image
                    src={image}
                    alt={`${siteName} - Ảnh ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 h-10 w-10 bg-white/90 hover:bg-white" />
          <CarouselNext className="right-4 h-10 w-10 bg-white/90 hover:bg-white" />
        </Carousel>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Booking Info */}
          <div className="lg:col-span-2">
            {/* Status Badge & Booking ID */}
            <div className="mb-4 flex items-center gap-4">
              {getStatusBadge(booking.status)}
              <span className="text-muted-foreground text-sm">
                Mã xác nhận:{' '}
                {booking.code || `#${booking._id.slice(-7).toUpperCase()}`}
              </span>
            </div>

            {/* Payment Status Alert - Pending */}
            {booking.paymentStatus === 'pending' && (
              <Card className="mb-6 border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="mr-3 font-semibold text-gray-900">
                          Chưa hoàn tất thanh toán
                        </h3>
                        <span className="text-2xl font-bold">
                          {booking.pricing?.total} VND
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Vui lòng hoàn tất thanh toán để xác nhận booking của bạn
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="bg-orange-600 hover:bg-orange-700"
                      asChild
                    >
                      <a
                        href={booking.payOSCheckoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Tiếp tục thanh toán
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Status Alert - Paid */}
            {booking.paymentStatus === 'paid' && (
              <Card className="mb-6 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Thanh toán thành công
                      </h3>
                      <p className="text-sm text-gray-600">
                        Booking của bạn đã được xác nhận và thanh toán thành
                        công
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trip Title */}
            <h1 className="mb-6 text-2xl font-bold md:text-3xl">
              Chuyến đi sắp tới của bạn đến {siteName}
              {propertyName && (
                <span className="text-muted-foreground mt-2 block text-lg font-normal">
                  tại {propertyName}
                </span>
              )}
            </h1>

            {/* Action Buttons */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              {/* Show Complete Trip button for confirmed bookings after checkout */}
              {booking.status === 'confirmed' &&
                new Date(booking.checkOut) < new Date() &&
                !booking.reviewed && (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => completeMutation.mutate()}
                    disabled={completeMutation.isPending}
                  >
                    {completeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Hoàn thành chuyến đi
                      </>
                    )}
                  </Button>
                )}

              {/* Show Review button for completed bookings without review */}
              {booking.status === 'completed' && !booking.reviewed && (
                <Button
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => setIsReviewDialogOpen(true)}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Đánh giá chuyến đi
                </Button>
              )}

              {isCancellable && (
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setIsCancelDialogOpen(true)}
                  disabled={cancelMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Hủy đặt chỗ
                </Button>
              )}
            </div>

            {/* Trip Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Chi tiết chuyến đi</h2>

              {/* Trip Dates */}
              <div className="flex items-start gap-3">
                <Calendar className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Ngày đi</p>
                  <p className="text-muted-foreground">
                    {format(new Date(booking.checkIn), 'EEEE, dd/MM', {
                      locale: vi,
                    })}{' '}
                    đến{' '}
                    {format(new Date(booking.checkOut), 'EEEE, dd/MM', {
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Check-in Time */}
              <div className="flex items-start gap-3">
                <Clock className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Check-in</p>
                  <p className="text-muted-foreground">Sau {checkInTime}</p>
                </div>
              </div>

              <Separator />

              {/* Check-out Time */}
              <div className="flex items-start gap-3">
                <Clock className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Check-out</p>
                  <p className="text-muted-foreground">Trước {checkOutTime}</p>
                </div>
              </div>

              <Separator />

              {/* Site/Location */}
              <div className="flex items-start gap-3">
                <MapPin className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Địa điểm</p>
                  <p className="text-muted-foreground">
                    {location?.address ||
                      `${location?.city || ''}, ${location?.state || ''}`}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Guests Info */}
              <div className="flex items-start gap-3">
                <Users className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Khách</p>
                  <p className="text-muted-foreground">
                    {booking.numberOfGuests} người lớn
                    {booking.numberOfPets &&
                      booking.numberOfPets > 0 &&
                      `, ${booking.numberOfPets} thú cưng`}
                    {booking.numberOfVehicles &&
                      booking.numberOfVehicles > 0 &&
                      `, ${booking.numberOfVehicles} xe`}
                  </p>
                </div>
              </div>

              {/* Guest Message */}
              {booking.guestMessage && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 font-medium">Lời nhắn của bạn</p>
                    <p className="text-muted-foreground">
                      {booking.guestMessage}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Who's Going */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Ai sẽ đi</h3>
                  <span className="text-muted-foreground text-sm">
                    {booking.numberOfGuests}/{booking.numberOfGuests}
                  </span>
                </div>

                {/* Guest Avatar */}
                <div className="mb-4 flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={booking.guest?.avatarUrl || user?.avatarUrl}
                      alt={booking.guest?.username || user?.username || 'Bạn'}
                    />
                    <AvatarFallback>
                      {(booking.guest?.username || user?.username || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {booking.guest?.username || user?.username || 'Bạn'}
                  </span>
                </div>

                <Button
                  variant="default"
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => router.push(`/u/${user?.username}`)}
                >
                  Xem hồ sơ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Booking Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Xác nhận hủy đặt chỗ
            </DialogTitle>
            <DialogDescription className="text-left">
              Bạn có chắc chắn muốn hủy đặt chỗ này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Booking Summary */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">
                  {siteName}
                  {propertyName && (
                    <span className="text-muted-foreground ml-1 text-sm">
                      - {propertyName}
                    </span>
                  )}
                </span>
              </div>
              <div className="text-muted-foreground text-sm">
                <p>
                  {format(new Date(booking.checkIn), 'dd/MM/yyyy', {
                    locale: vi,
                  })}{' '}
                  -{' '}
                  {format(new Date(booking.checkOut), 'dd/MM/yyyy', {
                    locale: vi,
                  })}
                </p>
                <p className="mt-1">
                  {booking.nights} đêm • {booking.numberOfGuests} khách
                </p>
                <p className="text-foreground mt-2 font-semibold">
                  Tổng: {booking.pricing?.total.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>

            {/* Cancellation Reason */}
            <div className="space-y-2">
              <label
                htmlFor="cancellation-reason"
                className="text-sm font-medium"
              >
                Lý do hủy <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="cancellation-reason"
                placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy đặt chỗ này... (tối thiểu 10 ký tự)"
                value={cancellationReason}
                onChange={e => setCancellationReason(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={cancelMutation.isPending}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  Thông tin này giúp chúng tôi cải thiện dịch vụ
                </p>
                <p
                  className={`text-xs ${
                    cancellationReason.length < 10
                      ? 'text-red-600'
                      : cancellationReason.length > 450
                        ? 'text-orange-600'
                        : 'text-muted-foreground'
                  }`}
                >
                  {cancellationReason.length}/500
                </p>
              </div>
            </div>

            {/* Cancellation Policy */}
            {booking?.property?.cancellationPolicy && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-900">
                  <strong>Chính sách hủy:</strong>{' '}
                  {booking.property.cancellationPolicy.type === 'flexible' &&
                    'Linh hoạt'}
                  {booking.property.cancellationPolicy.type === 'moderate' &&
                    'Trung bình'}
                  {booking.property.cancellationPolicy.type === 'strict' &&
                    'Nghiêm ngặt'}
                </p>

                {booking.property.cancellationPolicy.description && (
                  <p className="mt-1 text-xs text-red-800">
                    {booking.property.cancellationPolicy.description}
                  </p>
                )}

                {booking.property.cancellationPolicy.refundRules &&
                  booking.property.cancellationPolicy.refundRules.length >
                    0 && (
                    <div className="mt-3 space-y-1 text-sm text-red-800">
                      {booking.property.cancellationPolicy.refundRules
                        .sort(
                          (a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn,
                        )
                        .map((rule, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {rule.daysBeforeCheckIn === 0
                                ? 'Trong ngày nhận phòng'
                                : rule.daysBeforeCheckIn === 1
                                  ? 'Trước 1 ngày'
                                  : `Trước ${rule.daysBeforeCheckIn} ngày`}
                            </span>
                            <span className="font-medium">
                              Hoàn {rule.refundPercentage}%
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
              </div>
            )}

            {/* Refund Info */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                <strong>Chính sách hoàn tiền:</strong> Tiền sẽ được hoàn lại vào
                tài khoản của bạn trong vòng 5-7 ngày làm việc.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancellationReason('');
              }}
              disabled={cancelMutation.isPending}
            >
              Giữ đặt chỗ
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={
                cancelMutation.isPending ||
                !cancellationReason.trim() ||
                cancellationReason.trim().length < 10
              }
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Xác nhận hủy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      {booking.status === 'completed' &&
        !booking.reviewed &&
        property?._id &&
        site?._id && (
          <ReviewDialog
            open={isReviewDialogOpen}
            onOpenChange={setIsReviewDialogOpen}
            bookingId={bookingId}
            propertyId={property._id}
            siteId={site._id}
            propertyName={propertyName}
            siteName={siteName}
          />
        )}
    </div>
  );
}
