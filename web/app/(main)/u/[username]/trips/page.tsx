'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getUserBookings } from '@/lib/client-actions';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarDays, Loader2, MapPin, Tent } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BookingData {
  _id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  extras?: string[];
  campsite?: {
    _id: string;
    name: string;
    slug?: string;
    images?: string[];
    location?: {
      city: string;
      state: string;
    };
    host?: {
      name: string;
    };
  };
}

export default function TripsPage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();
  const isOwnProfile = currentUser?.username === username;

  const { data, isLoading } = useQuery({
    queryKey: ['user-bookings', username],
    queryFn: () => getUserBookings({ role: 'guest' }),
    enabled: isOwnProfile,
  });

  const bookings = (data?.data || []) as BookingData[];

  // Separate upcoming and past trips
  const now = new Date();
  const upcomingTrips = bookings.filter(
    b => new Date(b.checkOut) >= now && b.status !== 'cancelled',
  );
  const pastTrips = bookings.filter(
    b => new Date(b.checkOut) < now || b.status === 'completed',
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    const labels: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành',
    };
    return (
      <Badge className={`${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!isOwnProfile) {
    return (
      <div className="py-12 text-center">
        <Tent className="text-muted-foreground mx-auto h-12 w-12" />
        <h2 className="mt-4 text-lg font-semibold">Chuyến đi riêng tư</h2>
        <p className="text-muted-foreground mt-2">
          Bạn không thể xem chuyến đi của người dùng khác
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  const TripCard = ({ booking }: { booking: BookingData }) => (
    <Card className="overflow-hidden">
      {/* Trip Image */}
      <div className="relative h-48 w-full">
        <Image
          src={booking.campsite?.images?.[0] || '/placeholder-campsite.jpg'}
          alt={booking.campsite?.name || 'Campsite'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        {/* Status Badge */}
        <div className="mb-2">{getStatusBadge(booking.status)}</div>

        {/* Campsite Name */}
        <h3 className="text-lg font-semibold">
          {booking.campsite?.host?.name}: {booking.campsite?.name}
        </h3>

        {/* Location */}
        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          {booking.campsite?.location?.city},{' '}
          {booking.campsite?.location?.state}
        </p>

        {/* Dates */}
        <div className="text-muted-foreground mt-2 flex items-center gap-1 text-sm">
          <CalendarDays className="h-3 w-3" />
          {format(new Date(booking.checkIn), 'dd/MM', { locale: vi })} -{' '}
          {format(new Date(booking.checkOut), 'dd/MM/yyyy', { locale: vi })}
        </div>

        {/* Extras */}
        {booking.extras && booking.extras.length > 0 && (
          <p className="mt-2 text-sm">
            <span className="font-medium">Dịch vụ thêm:</span>{' '}
            {booking.extras.join(', ')}
          </p>
        )}

        {/* Trip Page Button */}
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href={`/bookings/${booking._id}/confirmation`}>
            Trang chuyến đi
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Upcoming Trips */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Chuyến đi sắp tới</h2>
        {upcomingTrips.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {upcomingTrips.map(booking => (
              <TripCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Tent className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="mt-4 font-semibold">Chưa có chuyến đi nào</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Khám phá các địa điểm cắm trại tuyệt vời và đặt chỗ ngay!
              </p>
              <Button
                asChild
                className="mt-4 bg-emerald-500 hover:bg-emerald-600"
              >
                <Link href="/search">Khám phá ngay</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Past Trips */}
      {pastTrips.length > 0 && (
        <section>
          <Separator className="mb-6" />
          <h2 className="mb-4 text-xl font-semibold">Chuyến đi đã qua</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pastTrips.map(booking => (
              <TripCard key={booking._id} booking={booking} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
