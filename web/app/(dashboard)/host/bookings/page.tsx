/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { BookingCalendar } from '@/components/host/booking-calendar';
import { BookingDetailSheet } from '@/components/host/booking-detail-sheet';
import { BookingGanttView } from '@/components/host/booking-gantt-view';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  LayoutGrid,
  List,
  MessageSquare,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  cancelBooking,
  completeBooking,
  getMyBookings,
} from '@/lib/client-actions';
import { getMyProperties } from '@/lib/property-site-api';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800' },
  refunded: { label: 'Đã hoàn tiền', color: 'bg-purple-100 text-purple-800' },
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> =
{
  pending: {
    label: 'Chờ thanh toán',
    color: 'bg-yellow-100 text-yellow-800',
  },
  paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  refunded: { label: 'Đã hoàn tiền', color: 'bg-purple-100 text-purple-800' },
  failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'gantt'>(
    'gantt',
  );
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const router = useRouter();

  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'confirm' | 'cancel' | 'complete' | null;
    booking: any;
  }>({ open: false, type: null, booking: null });

  // State mới cho cancel dialog
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    booking: any;
    reason: string;
  }>({ open: false, booking: null, reason: '' });

  async function fetchBookings() {
    try {
      const res = await getMyBookings();
      if (res.success) {
        setBookings(res.data ?? []);
      }
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Có lỗi khi tải danh sách booking');
      setLoading(false);
    }
  }

  async function fetchProperties() {
    try {
      const res = await getMyProperties();

      let propertyList: Array<{ _id: string; name: string }> = [];

      // apiClient interceptor already unwrapped response.data
      // Backend: ResponseUtil.success(res, {properties, pagination}, message)
      // Result: { success: true, data: { properties: [...], pagination: {...} }, message: "..." }
      if (res.data?.properties && Array.isArray(res.data.properties)) {
        // Nested structure from service response
        propertyList = res.data.properties.map((p: any) => ({
          _id: p._id,
          name: p.name,
        }));
      } else if (res.properties && Array.isArray(res.properties)) {
        // Direct properties array
        propertyList = res.properties.map((p: any) => ({
          _id: p._id,
          name: p.name,
        }));
      } else if (res.data && Array.isArray(res.data)) {
        // Direct array in data field
        propertyList = res.data.map((p: any) => ({
          _id: p._id,
          name: p.name,
        }));
      } else if (Array.isArray(res)) {
        // Direct array (fallback)
        propertyList = res.map((p: any) => ({
          _id: p._id,
          name: p.name,
        }));
      } else {
        console.error('Unexpected response structure:', res);
        toast.error('Định dạng dữ liệu property không hợp lệ');
        return;
      }

      if (propertyList.length === 0) {
        console.warn(
          'No properties found for this host. User may not have created any properties yet.',
        );
        toast.info(
          'Bạn chưa có property nào. Hãy tạo property để bắt đầu nhận booking.',
        );
      }

      setProperties(propertyList);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Không thể tải danh sách property');
    }
  }

  useEffect(() => {
    fetchBookings();
    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = [...bookings];

    if (activeTab !== 'all') {
      filtered = filtered.filter(b => b.status === activeTab);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.guest.name.toLowerCase().includes(term) ||
          b.guest.email.toLowerCase().includes(term) ||
          b.site.name.toLowerCase().includes(term),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'checkin-soon':
          return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
        case 'checkout-soon':
          return (
            new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime()
          );
        case 'price-high':
          return b.pricing.total - a.pricing.total;
        case 'price-low':
          return a.pricing.total - b.pricing.total;
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, activeTab, sortBy, searchTerm]);

  function handleAction(type: 'confirm' | 'cancel' | 'complete', booking: any) {
    if (type === 'cancel') {
      // Mở cancel dialog thay vì action dialog
      setCancelDialog({ open: true, booking, reason: '' });
    } else {
      setActionDialog({ open: true, type, booking });
    }
  }

  function handleBookingClick(booking: any) {
    setSelectedBooking(booking);
    setDetailSheetOpen(true);
  }
  // Hàm xử lý cancel với lý do
  async function executeCancelWithReason() {
    try {
      const { booking, reason } = cancelDialog;
      if (!booking || !reason.trim()) {
        toast.error('Vui lòng nhập lý do từ chối booking');
        return;
      }

      const result = await cancelBooking(booking.code, {
        cancellationReason: reason.trim(),
        cancellInformation: {
          fullnameGuest: '', // Add appropriate value
          bankCode: '', // Add appropriate value
          bankType: '', // Add appropriate value
        },
      });

      if (result?.success) {
        toast.success('Đã hủy booking!');
        setCancelDialog({ open: false, booking: null, reason: '' });
        await fetchBookings();
      } else {
        throw new Error(result?.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      console.error('Error canceling booking:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi từ chối booking');
    }
  }

  async function executeAction() {
    try {
      const { type, booking } = actionDialog;
      if (!type || !booking) return;

      let result;

      switch (type) {
        case 'confirm':
          toast.info('Chức năng xác nhận đang được phát triển');
          setActionDialog({ open: false, type: null, booking: null });
          return;

        case 'complete':
          result = await completeBooking(booking._id);
          break;

        default:
          throw new Error('Invalid action type');
      }

      if (result?.success) {
        toast.success(
          type === 'complete' ? 'Đã hoàn thành booking!' : 'Thành công!',
        );
        setActionDialog({ open: false, type: null, booking: null });
        await fetchBookings();
      } else {
        throw new Error(result?.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      console.error('Error executing action:', error);
      toast.error(error?.message || 'Có lỗi xảy ra');
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN').format(price);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings
      .filter(b => b.paymentStatus === 'paid' && b.status === 'completed')
      .reduce((sum, b) => sum + b.pricing.total, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý booking
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi và quản lý các đặt chỗ của khách hàng
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex items-center rounded-lg border bg-white p-1">
                <Button
                  variant={viewMode === 'gantt' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('gantt')}
                  className="gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Lịch
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Danh sách
                </Button>
              </div>
              <Button variant="outline" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats - Only show in list view */}
      {viewMode === 'list' && (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tổng số</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Chờ xác nhận
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pending}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Đã xác nhận
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.confirmed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Hoàn thành
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.completed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Doanh thu
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(stats.totalRevenue)} ₫
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters - Only show in list view */}
      {viewMode === 'list' && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-6 sm:w-auto">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
                <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
                <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
                <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
                <TabsTrigger value="refunded">Đã hoàn tiền</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm khách hàng, địa điểm..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="checkin-soon">
                    Check-in sớm nhất
                  </SelectItem>
                  <SelectItem value="checkout-soon">
                    Check-out sớm nhất
                  </SelectItem>
                  <SelectItem value="price-high">Giá cao → thấp</SelectItem>
                  <SelectItem value="price-low">Giá thấp → cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Gantt Timeline View */}
      {viewMode === 'gantt' && (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : (
            <BookingGanttView
              bookings={bookings}
              properties={properties}
              onBookingClick={handleBookingClick}
            />
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : (
            <BookingCalendar
              bookings={bookings}
              onBookingClick={handleBookingClick}
            />
          )}
        </div>
      )}

      {/* Bookings List */}
      {viewMode === 'list' && (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Chưa có booking nào
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? 'Không tìm thấy kết quả phù hợp'
                    : 'Các booking sẽ hiển thị ở đây'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <Card
                  key={booking._id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Campsite Image */}
                      <div className="relative h-48 w-full lg:h-auto lg:w-64">
                        <Image
                          src={booking.site.photos?.[0].url}
                          alt={booking.site.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge
                            className={STATUS_LABELS[booking.status].color}
                          >
                            {STATUS_LABELS[booking.status].label}
                          </Badge>
                          <Badge
                            className={
                              PAYMENT_STATUS_LABELS[booking.paymentStatus].color
                            }
                          >
                            {PAYMENT_STATUS_LABELS[booking.paymentStatus].label}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-6">
                        {/* Guest & Campsite Info */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {booking.guest.name}
                              </h3>
                              <span className="text-sm text-gray-500">
                                • {booking.guest.email}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">Tổng tiền</p>
                            <p className="text-2xl font-bold text-emerald-600">
                              {formatPrice(booking.pricing.total)} ₫
                            </p>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-b py-4 sm:grid-cols-4">
                          <div>
                            <p className="text-xs text-gray-500">Check-in</p>
                            <p className="mt-1 font-semibold">
                              {formatDate(booking.checkIn)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Check-out</p>
                            <p className="mt-1 font-semibold">
                              {formatDate(booking.checkOut)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Số đêm</p>
                            <p className="mt-1 font-semibold">
                              {booking.nights} đêm
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Khách</p>
                            <p className="mt-1 font-semibold">
                              <Users className="mr-1 inline h-4 w-4" />
                              {booking.numberOfGuests} người
                              {booking.numberOfPets > 0 &&
                                ` • ${booking.numberOfPets} pet`}
                            </p>
                          </div>
                        </div>

                        {/* Guest Message */}
                        {booking.guestMessage && (
                          <div className="mt-4 rounded-lg bg-gray-50 p-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="mt-0.5 h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs font-medium text-gray-500">
                                  Lời nhắn từ khách
                                </p>
                                <p className="mt-1 text-sm text-gray-700">
                                  {booking.guestMessage}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                          {( booking.status !== 'cancelled' && ( booking.paymentStatus === "pending" ||  
                            (new Date() >= new Date(booking.checkIn) && 
                              new Date() <= new Date(booking.checkOut))) ) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-red-600 hover:bg-red-50 cursor-pointer"
                                  onClick={() => handleAction("cancel", booking)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Hủy
                                </Button>
                              </>
                            )}


                          {/* {booking.status === 'confirmed' &&
                            new Date(booking.checkOut) < new Date() && (
                              <Button
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() =>
                                  handleAction('complete', booking)
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Đánh dấu hoàn thành
                              </Button>
                            )} */}

                          <Button
                            onClick={() =>
                              router.push(
                                `/host/bookings/detail/${booking.code}`,
                              )
                            }
                            size="sm"
                            variant="outline"
                            className="flex-1 cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </Button>

                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Detail Sheet */}
      <BookingDetailSheet
        booking={selectedBooking}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onConfirm={booking => handleAction('confirm', booking)}
        onCancel={booking => handleAction('cancel', booking)}
        onComplete={booking => handleAction('complete', booking)}
      />

      {/* Cancel Dialog with Reason */}
      <AlertDialog
        open={cancelDialog.open}
        onOpenChange={open =>
          !open && setCancelDialog({ open: false, booking: null, reason: '' })
        }
      >
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Từ chối booking
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối booking này. Khách hàng sẽ nhận được
              thông báo về lý do từ chối.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label
              htmlFor="cancelReason"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="cancelReason"
              value={cancelDialog.reason}
              onChange={e =>
                setCancelDialog({ ...cancelDialog, reason: e.target.value })
              }
              placeholder="Ví dụ: Địa điểm đã được đặt đầy, không thể phục vụ vào thời gian này..."
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              {cancelDialog.reason.length}/500 ký tự
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setCancelDialog({ open: false, booking: null, reason: '' })
              }
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeCancelWithReason}
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancelDialog.reason.trim()}
            >
              Xác nhận từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm/Complete Action Dialog */}
      <AlertDialog
        open={actionDialog.open}
        onOpenChange={open => setActionDialog({ ...actionDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {actionDialog.type === 'confirm' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Xác nhận booking
                </>
              )}
              {actionDialog.type === 'complete' && (
                <>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Hoàn thành booking
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === 'confirm' &&
                'Bạn có chắc chắn muốn xác nhận booking này? Khách hàng sẽ nhận được email xác nhận.'}
              {actionDialog.type === 'complete' &&
                'Đánh dấu booking này là đã hoàn thành? Khách hàng có thể để lại đánh giá sau khi hoàn thành.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className={
                actionDialog.type === 'confirm'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
