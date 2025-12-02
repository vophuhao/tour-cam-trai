'use client';

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
import { Separator } from '@/components/ui/separator';
import { getBooking } from '@/lib/client-actions';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Clock,
  HelpCircle,
  Home,
  Loader2,
  MapPin,
  PencilLine,
  Plus,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// Type definition for booking data
interface BookingData {
  _id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  numberOfPets: number;
  numberOfVehicles: number;
  nights: number;
  paymentMethod: string;
  guestMessage?: string;
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
    name: string;
    avatar?: string;
  };
  pricing?: {
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    tax: number;
    total: number;
  };
}

export default function ConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const { user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
  });

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    const labels: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành',
    };
    return (
      <Badge className={`${styles[status] || styles.pending} px-3 py-1`}>
        {labels[status] || status}
      </Badge>
    );
  };

  const campsiteImages = booking.campsite?.images || [
    '/placeholder-campsite.jpg',
  ];

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
            {campsiteImages.map((image, index) => (
              <CarouselItem key={index} className="h-full pl-1 md:basis-1/2">
                <div className="relative h-[300px] w-full md:h-[450px]">
                  <Image
                    src={image || '/placeholder-campsite.jpg'}
                    alt={`${booking.campsite?.name} - Ảnh ${index + 1}`}
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
                Mã xác nhận #{booking._id.slice(-7).toUpperCase()}
              </span>
            </div>

            {/* Trip Title */}
            <h1 className="mb-6 text-2xl font-bold md:text-3xl">
              Chuyến đi sắp tới của bạn đến {booking.campsite?.name}
            </h1>

            {/* Action Buttons */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                <Plus className="mr-2 h-4 w-4" />
                Thêm dịch vụ
              </Button>
              <Button variant="outline" className="flex-1">
                <PencilLine className="mr-2 h-4 w-4" />
                Chỉnh sửa chuyến đi
              </Button>
              <Button variant="outline" className="flex-1">
                <HelpCircle className="mr-2 h-4 w-4" />
                Trợ giúp
              </Button>
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
                  <p className="text-muted-foreground">
                    Sau {booking.campsite?.checkInTime || '14:00'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Check-out Time */}
              <div className="flex items-start gap-3">
                <Clock className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Check-out</p>
                  <p className="text-muted-foreground">
                    Trước {booking.campsite?.checkOutTime || '12:00'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Site/Location */}
              <div className="flex items-start gap-3">
                <MapPin className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Địa điểm</p>
                  <p className="text-muted-foreground">
                    {booking.campsite?.location?.address ||
                      `${booking.campsite?.location?.city}, ${booking.campsite?.location?.state}`}
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
                    {booking.numberOfPets > 0 &&
                      `, ${booking.numberOfPets} thú cưng`}
                    {booking.numberOfVehicles > 0 &&
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
                      src={booking.guest?.avatar || user?.avatarUrl}
                      alt={booking.guest?.name || user?.username || 'Bạn'}
                    />
                    <AvatarFallback>
                      {(booking.guest?.name || user?.username || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {booking.guest?.name || user?.username || 'Bạn'}
                  </span>
                </div>

                <Button
                  variant="default"
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => router.push('/profile')}
                >
                  Xem hồ sơ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
