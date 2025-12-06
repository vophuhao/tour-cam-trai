/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getBookingByCode } from '@/lib/client-actions';
import type { Property, Site } from '@/types/property-site';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import jsPDF from 'jspdf';
import {
  AlertCircle,
  BanknoteIcon,
  Calendar,
  Car,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  Clock,
  CreditCard,
  FileText,
  Home,
  Loader2,
  MapPin,
  PawPrint,
  Tent,
  Users,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Backend Booking type
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

  // Property-Site architecture
  property: Partial<Property>;
  site: Partial<Site>;

  guest: {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    fullName?: string;
    phone?: string;
  };

  host: {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };

  pricing: {
    basePrice: number;
    totalNights: number;
    subtotal: number;
    cleaningFee: number;
    petFee: number;
    extraGuestFee: number;
    serviceFee: number;
    tax: number;
    total: number;
  };

  // Cancellation
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundAmount?: number;

  // Review
  reviewed: boolean;
  review?: string;

  // Payment
  payOSOrderCode?: number;
  payOSCheckoutUrl?: string;
  transactionId?: string;
  paidAt?: string;

  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [code]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await getBookingByCode(code);
      setBooking(res.data ?? null);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Không thể tải thông tin booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    try {
      setCancelling(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/${booking?._id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ cancellationReason: cancelReason }),
        },
      );

      if (!res.ok) throw new Error('Không thể hủy booking');

      toast.success('Đã hủy booking thành công');
      setCancelDialogOpen(false);
      fetchBooking();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi hủy booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleExportPDF = async () => {
    if (!booking) return;

    try {
      setExporting(true);
      const doc = new jsPDF();

      // Load DejaVu font
      const loadFont = async () => {
        const response = await fetch('/fonts/DejaVuSans.ttf');
        const fontBlob = await response.blob();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            try {
              const base64 = reader.result as string;
              const base64Data = base64.split(',')[1];

              doc.addFileToVFS('DejaVu.ttf', base64Data);
              doc.addFont('DejaVu.ttf', 'DejaVu', 'normal');
              doc.setFont('DejaVu', 'normal');
              resolve(true);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(fontBlob);
        });
      };

      await loadFont();

      // Header
      doc.setFontSize(20);
      doc.text('HÓA ĐƠN ĐẶT CHỖ', 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.text('TOUR CẮM TRẠI VIỆT NAM', 105, 28, { align: 'center' });
      doc.text(
        'Website: tour-cam-trai.vn | Email: support@tour-cam-trai.vn',
        105,
        34,
        { align: 'center' },
      );

      // Line
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);

      // Booking Info
      let y = 50;
      doc.setFontSize(12);
      doc.text('THÔNG TIN ĐẶT CHỖ', 20, y);

      y += 8;
      doc.setFontSize(10);

      const bookingInfo = [
        `Mã booking: ${booking.code}`,
        `Ngày tạo: ${format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}`,
        `Trạng thái: ${getStatusLabel(booking.status)}`,
        `Thanh toán: ${getPaymentStatusLabel(booking.paymentStatus)}`,
      ];

      bookingInfo.forEach(info => {
        doc.text(info, 20, y);
        y += 6;
      });

      // Property & Site Info
      y += 6;
      doc.text('ĐỊA ĐIỂM', 20, y);
      y += 8;
      doc.text(`Property: ${booking.property.name}`, 20, y);
      y += 6;
      doc.text(`Site: ${booking.site.name}`, 20, y);
      y += 6;

      const address = `Địa chỉ: ${booking.property.location?.address}, ${booking.property.location?.city}, ${booking.property.location?.state}`;
      const splitAddress = doc.splitTextToSize(address, 170);
      doc.text(splitAddress, 20, y);
      y += splitAddress.length * 6;

      // Booking Details
      y += 6;
      doc.text('CHI TIẾT ĐẶT CHỖ', 20, y);
      y += 8;

      const bookingDetails = [
        `Check-in: ${format(new Date(booking.checkIn), 'dd/MM/yyyy HH:mm')}`,
        `Check-out: ${format(new Date(booking.checkOut), 'dd/MM/yyyy HH:mm')}`,
        `Số đêm: ${booking.nights} đêm`,
        `Số khách: ${booking.numberOfGuests} người`,
      ];

      if (booking.numberOfPets && booking.numberOfPets > 0) {
        bookingDetails.push(`Thú cưng: ${booking.numberOfPets} con`);
      }
      if (booking.numberOfVehicles && booking.numberOfVehicles > 0) {
        bookingDetails.push(`Phương tiện: ${booking.numberOfVehicles} xe`);
      }

      bookingDetails.forEach(detail => {
        doc.text(detail, 20, y);
        y += 6;
      });

      // Pricing
      y += 6;
      doc.text('CHI TIẾT GIÁ', 20, y);
      y += 8;

      const pricing = [
        {
          label: `Giá cơ bản (${formatPrice(booking.pricing.basePrice)} x ${booking.pricing.totalNights} đêm)`,
          value: booking.pricing.subtotal,
        },
        { label: 'Phí vệ sinh', value: booking.pricing.cleaningFee },
        { label: 'Phí thú cưng', value: booking.pricing.petFee },
        { label: 'Phí khách thêm', value: booking.pricing.extraGuestFee },
        { label: 'Phí dịch vụ', value: booking.pricing.serviceFee },
        { label: 'Thuế', value: booking.pricing.tax },
      ];

      pricing.forEach(item => {
        if (item.value > 0) {
          doc.text(item.label, 20, y);
          doc.text(formatPrice(item.value), 190, y, { align: 'right' });
          y += 6;
        }
      });

      // Total
      y += 4;
      doc.setLineWidth(0.3);
      doc.line(20, y, 190, y);
      y += 8;
      doc.setFontSize(12);
      doc.text('TỔNG CỘNG', 20, y);
      doc.text(formatPrice(booking.pricing.total), 190, y, { align: 'right' });

      // Guest Info
      y += 12;
      doc.setFontSize(10);
      doc.text('THÔNG TIN KHÁCH HÀNG', 20, y);
      y += 8;

      const guestInfo = [
        `Tên: ${booking.guest.fullName || booking.guest.username}`,
        `Email: ${booking.guest.email}`,
      ];

      if (booking.guest.phone) {
        guestInfo.push(`Số điện thoại: ${booking.guest.phone}`);
      }

      guestInfo.forEach(info => {
        doc.text(info, 20, y);
        y += 6;
      });

      // Footer
      y += 10;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!', 105, y, {
        align: 'center',
      });

      // Save
      doc.save(`hoa-don-${booking.code}.pdf`);
      toast.success('Đã xuất hóa đơn PDF thành công');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Không thể xuất hóa đơn');
    } finally {
      setExporting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành',
      refunded: 'Đã hoàn tiền',
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
      refunded: 'Đã hoàn tiền',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Không tìm thấy booking
          </h3>
          <Button className="mt-4" asChild>
            <Link href="/host/bookings">Quay lại danh sách</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      label: 'Chờ xác nhận',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
    },
    confirmed: {
      label: 'Đã xác nhận',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Đã hủy',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
    },
    completed: {
      label: 'Hoàn thành',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle2,
    },
    refunded: {
      label: 'Đã hoàn tiền',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: AlertCircle,
    },
  };

  const paymentStatusConfig = {
    pending: {
      label: 'Chờ thanh toán',
      color: 'bg-gradient-to-r from-yellow-400 to-orange-400',
      textColor: 'text-white',
      icon: CircleDollarSign,
      glow: 'shadow-lg shadow-yellow-200',
    },
    paid: {
      label: 'Đã thanh toán',
      color: 'bg-gradient-to-r from-emerald-400 to-green-500',
      textColor: 'text-white',
      icon: CheckCircle2,
      glow: 'shadow-lg shadow-emerald-200',
    },
    failed: {
      label: 'Thanh toán thất bại',
      color: 'bg-gradient-to-r from-red-400 to-rose-500',
      textColor: 'text-white',
      icon: XCircle,
      glow: 'shadow-lg shadow-red-200',
    },
    refunded: {
      label: 'Đã hoàn tiền',
      color: 'bg-gradient-to-r from-purple-400 to-pink-500',
      textColor: 'text-white',
      icon: BanknoteIcon,
      glow: 'shadow-lg shadow-purple-200',
    },
  };

  const status = statusConfig[booking.status];
  const paymentStatus = paymentStatusConfig[booking.paymentStatus];
  const StatusIcon = status.icon;
  const PaymentIcon = paymentStatus.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/host/bookings">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách booking
            </Link>
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chi tiết booking
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Mã booking: {booking.code}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`${status.color} flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold`}
              >
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </div>

              <div
                className={`${paymentStatus.color} ${paymentStatus.textColor} ${paymentStatus.glow} flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold`}
              >
                <PaymentIcon className="h-5 w-5" />
                {paymentStatus.label}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Payment Status Alert */}
            {booking.paymentStatus === 'pending' && booking.payOSCheckoutUrl && (
              <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500">
                      <CircleDollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Booking chưa thanh toán
                      </h3>
                      <p className="text-sm text-gray-600">
                        Vui lòng thanh toán để xác nhận booking
                      </p>
                    </div>
                    <Button
                      size="lg"
                      asChild
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <a
                        href={booking.payOSCheckoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Thanh toán ngay
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {booking.paymentStatus === 'paid' && (
              <Card className="border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Thanh toán thành công
                      </h3>
                      {booking.paidAt && (
                        <p className="text-sm text-gray-600">
                          Thanh toán lúc{' '}
                          {format(new Date(booking.paidAt), 'dd/MM/yyyy HH:mm', {
                            locale: vi,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property & Site Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin địa điểm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property */}
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={booking.property.photos?.[0]?.url || '/placeholder.jpg'}
                      alt={booking.property.name || 'Property'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">
                        PROPERTY
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">
                      {booking.property.name}
                    </h3>
                    <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>
                        {booking.property.location?.address},{' '}
                        {booking.property.location?.city},{' '}
                        {booking.property.location?.state}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Site */}
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={booking.site.photos?.[0]?.url || '/placeholder.jpg'}
                      alt={booking.site.name || 'Site'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Tent className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">
                        SITE
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">
                      {booking.site.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {booking.site.description}
                    </p>
                  </div>
                </div>

                <Separator />

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/properties/${booking.property.slug}`}>
                    Xem chi tiết property
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết đặt chỗ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Nhận chỗ
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(booking.checkIn), 'dd/MM/yyyy - HH:mm', {
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Trả chỗ</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(booking.checkOut), 'dd/MM/yyyy - HH:mm', {
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Số khách</p>
                      <p className="text-sm text-gray-600">
                        {booking.numberOfGuests} người
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Số đêm</p>
                      <p className="text-sm text-gray-600">{booking.nights} đêm</p>
                    </div>
                  </div>

                  {/* {booking.numberOfPets && booking.numberOfPets > 0 && (
                    <div className="flex items-start gap-3">
                      <PawPrint className="mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Thú cưng
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.numberOfPets} con
                        </p>
                      </div>
                    </div>
                  )} */}

                  {booking.numberOfVehicles && booking.numberOfVehicles > 0 && (
                    <div className="flex items-start gap-3">
                      <Car className="mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Phương tiện
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.numberOfVehicles} xe
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {booking.guestMessage && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">
                        Lời nhắn từ khách
                      </p>
                      <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                        {booking.guestMessage}
                      </p>
                    </div>
                  </>
                )}

                {booking.hostMessage && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">
                        Phản hồi từ chủ nhà
                      </p>
                      <p className="rounded-lg bg-emerald-50 p-3 text-sm text-gray-600">
                        {booking.hostMessage}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Guest Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khách</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    {booking.guest.avatarUrl ? (
                      <Image
                        src={booking.guest.avatarUrl}
                        alt={booking.guest.username}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-2xl font-semibold text-gray-600">
                        {booking.guest.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {booking.guest.fullName || booking.guest.username}
                    </h4>
                    <p className="text-sm text-gray-600">{booking.guest.email}</p>
                    {booking.guest.phone && (
                      <p className="text-sm text-gray-600">{booking.guest.phone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Info */}
            {booking.status === 'cancelled' && booking.cancelledAt && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900">
                    Thông tin hủy booking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-700">Thời gian hủy:</span>
                    <span className="font-medium text-red-900">
                      {format(new Date(booking.cancelledAt), 'dd/MM/yyyy HH:mm', {
                        locale: vi,
                      })}
                    </span>
                  </div>
                  {booking.cancellationReason && (
                    <div>
                      <p className="mb-1 text-sm text-red-700">Lý do hủy:</p>
                      <p className="rounded-lg bg-white p-3 text-sm text-red-900">
                        {booking.cancellationReason}
                      </p>
                    </div>
                  )}
                  {booking.refundAmount && booking.refundAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-700">Số tiền hoàn:</span>
                      <span className="font-medium text-red-900">
                        {formatPrice(booking.refundAmount)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {formatPrice(booking.pricing.basePrice)} x{' '}
                    {booking.pricing.totalNights} đêm
                  </span>
                  <span className="font-medium">
                    {formatPrice(booking.pricing.subtotal)}
                  </span>
                </div>

                {booking.pricing.cleaningFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vệ sinh</span>
                    <span className="font-medium">
                      {formatPrice(booking.pricing.cleaningFee)}
                    </span>
                  </div>
                )}

                {booking.pricing.petFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí thú cưng</span>
                    <span className="font-medium">
                      {formatPrice(booking.pricing.petFee)}
                    </span>
                  </div>
                )}

                {booking.pricing.extraGuestFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí khách thêm</span>
                    <span className="font-medium">
                      {formatPrice(booking.pricing.extraGuestFee)}
                    </span>
                  </div>
                )}

                {booking.pricing.serviceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí dịch vụ</span>
                    <span className="font-medium">
                      {formatPrice(booking.pricing.serviceFee)}
                    </span>
                  </div>
                )}

                {booking.pricing.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thuế</span>
                    <span className="font-medium">
                      {formatPrice(booking.pricing.tax)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-base font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-emerald-600">
                    {formatPrice(booking.pricing.total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportPDF}
                  disabled={exporting}
                >
                  {exporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {exporting ? 'Đang xuất...' : 'Xuất hóa đơn PDF'}
                </Button>

                {(booking.status === 'pending' ||
                  booking.status === 'confirmed') && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Hủy booking
                  </Button>
                )}

                {booking.status === 'completed' && !booking.reviewed && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <Link href={`/bookings/${booking.code}/review`}>
                      Viết đánh giá
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Đã tạo booking</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm', {
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>

                  {booking.paidAt && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <CreditCard className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Đã thanh toán</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(booking.paidAt), 'dd/MM/yyyy HH:mm', {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.cancelledAt && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Đã hủy</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(booking.cancelledAt), 'dd/MM/yyyy HH:mm', {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy booking</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy booking này? Vui lòng cho biết lý do hủy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Nhập lý do hủy booking..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={cancelling || !cancelReason.trim()}
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang hủy...
                </>
              ) : (
                'Xác nhận hủy'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}