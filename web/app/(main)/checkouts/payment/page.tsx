'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { createBooking } from '@/lib/client-actions';
import { useAuthStore } from '@/store/auth.store';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Dog,
  Loader2,
  MapPin,
  Smartphone,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface BookingSummaryData {
  // NEW: Property-Site architecture
  siteId?: string;
  propertyId?: string;
  siteName?: string;
  propertyName?: string;

  // UNDESIGNATED: Group booking
  groupId?: string;

  // LEGACY: Old campsite support (for backward compatibility)
  campsiteId?: string;
  campsiteName?: string;

  // Shared fields
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  basePrice: number;
  nights: number;
  cleaningFee: number;
  petFee: number;
  additionalGuestFee: number;
  total: number;
  currency: string;
  guests: number;
  pets: number;
  vehicles: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Parse booking data from URL params (supports both new Property-Site and legacy Campsite)
  const bookingData: BookingSummaryData = {
    // NEW: Property-Site params (from BookingSiteForm)
    siteId: searchParams.get('siteId') || undefined,
    propertyId: searchParams.get('propertyId') || undefined,
    siteName: searchParams.get('name') || undefined,

    // UNDESIGNATED: Group booking params
    groupId: searchParams.get('groupId') || undefined,

    // LEGACY: Campsite params (for backward compatibility)
    campsiteId: searchParams.get('campsiteId') || undefined,
    campsiteName: searchParams.get('name') || undefined,

    // Shared params
    location: searchParams.get('location') || '',
    image: searchParams.get('image') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    basePrice: Number(searchParams.get('basePrice')) || 0,
    nights: Number(searchParams.get('nights')) || 1,
    cleaningFee: Number(searchParams.get('cleaningFee')) || 0,
    petFee: Number(searchParams.get('petFee')) || 0,
    additionalGuestFee: Number(searchParams.get('additionalGuestFee')) || 0,
    total: Number(searchParams.get('total')) || 0,
    currency: searchParams.get('currency') || 'VND',
    guests: Number(searchParams.get('guests')) || 1,
    pets: Number(searchParams.get('pets')) || 0,
    vehicles: Number(searchParams.get('vehicles')) || 1,
  };

  // Determine which architecture we're using
  const isUndesignatedBooking = !!bookingData.groupId;
  const isPropertySiteBooking =
    (!!bookingData.siteId || isUndesignatedBooking) && !!bookingData.propertyId;
  const displayName = isPropertySiteBooking
    ? bookingData.siteName
    : bookingData.campsiteName || 'Site Name';

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'card' | 'bank_transfer' | 'momo' | 'zalopay'
  >('card');

  // Calculate pricing (use backend values from BookingSiteForm)
  const nights = bookingData.nights;
  const subtotal = bookingData.basePrice * nights;
  const serviceFee = Math.round(subtotal * 0.1); // 10% service fee
  const tax = Math.round((subtotal + serviceFee) * 0.08); // 8% tax
  const totalPetFee = bookingData.petFee;
  const additionalGuestFee = bookingData.additionalGuestFee;

  // Use backend-calculated total or calculate locally
  const total =
    bookingData.total ||
    subtotal +
      bookingData.cleaningFee +
      totalPetFee +
      additionalGuestFee +
      serviceFee +
      tax;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: bookingData.currency,
    }).format(price);

  // Form validation
  const isFormValid =
    fullName.trim() &&
    email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phone.trim() &&
    /^[0-9]{10,11}$/.test(phone);

  // Booking mutation (supports both Property-Site and legacy Campsite)
  const bookingMutation = useMutation({
    mutationFn: async () => {
      // NEW: Property-Site booking
      if (isPropertySiteBooking) {
        // Undesignated booking (groupId provided)
        if (isUndesignatedBooking) {
          return createBooking({
            groupId: bookingData.groupId!, // Pass groupId for undesignated
            property: bookingData.propertyId!,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            numberOfGuests: bookingData.guests,
            numberOfPets: bookingData.pets,
            numberOfVehicles: bookingData.vehicles,
            guestMessage: guestMessage || undefined,
            paymentMethod,
          });
        }

        // Designated booking (siteId provided)
        return createBooking({
          site: bookingData.siteId!,
          property: bookingData.propertyId!,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          numberOfGuests: bookingData.guests,
          numberOfPets: bookingData.pets,
          numberOfVehicles: bookingData.vehicles,
          guestMessage: guestMessage || undefined,
          paymentMethod,
        });
      }

      // LEGACY: Old campsite booking (backward compatibility)
      return createBooking({
        campsite: bookingData.campsiteId!,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        numberOfGuests: bookingData.guests,
        numberOfPets: bookingData.pets,
        guestMessage: guestMessage || undefined,
        paymentMethod,
      });
    },
    onSuccess: data => {
      const bookingId =
        (data?.data as { _id?: string; id?: string })?._id ||
        (data?.data as { _id?: string; id?: string })?.id;

      // If payment URL is provided, redirect to PayOS
      if (data.data.payOSCheckoutUrl) {
        router.replace(data.data.payOSCheckoutUrl);
      } else if (bookingId) {
        // Otherwise, redirect to booking confirmation page
        router.replace(`/bookings/${bookingId}`);
      } else {
        // Fallback to bookings list
        router.replace('/bookings');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    bookingMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Form Section */}
          <form onSubmit={handleSubmit} className="lg:col-span-2">
            <div className="space-y-6">
              {/* Guest Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0912345678"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Lời nhắn cho chủ nhà</Label>
                    <Textarea
                      id="message"
                      placeholder="Cho chủ nhà biết thêm về chuyến đi của bạn..."
                      value={guestMessage}
                      onChange={e => setGuestMessage(e.target.value)}
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-muted-foreground text-xs">
                      {guestMessage.length}/1000 ký tự
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value: string) =>
                      setPaymentMethod(
                        value as 'card' | 'bank_transfer' | 'momo' | 'zalopay',
                      )
                    }
                  >
                    <div className="space-y-3">
                      {/* Credit Card */}
                      <label
                        htmlFor="card"
                        className="hover:bg-accent flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition"
                      >
                        <RadioGroupItem value="card" id="card" />
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium">Thẻ tín dụng / Ghi nợ</p>
                          <p className="text-muted-foreground text-sm">
                            Visa, Mastercard, JCB
                          </p>
                        </div>
                      </label>

                      {/* Bank Transfer */}
                      <label
                        htmlFor="bank"
                        className="hover:bg-accent flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition"
                      >
                        <RadioGroupItem value="bank_transfer" id="bank" />
                        <Building2 className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium">Chuyển khoản ngân hàng</p>
                          <p className="text-muted-foreground text-sm">
                            Chuyển khoản trực tiếp
                          </p>
                        </div>
                      </label>

                      {/* Momo */}
                      <label
                        htmlFor="momo"
                        className="hover:bg-accent flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition"
                      >
                        <RadioGroupItem value="momo" id="momo" />
                        <Smartphone className="h-5 w-5 text-pink-600" />
                        <div className="flex-1">
                          <p className="font-medium">Ví MoMo</p>
                          <p className="text-muted-foreground text-sm">
                            Thanh toán qua ví điện tử
                          </p>
                        </div>
                      </label>

                      {/* ZaloPay */}
                      <label
                        htmlFor="zalopay"
                        className="hover:bg-accent flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition"
                      >
                        <RadioGroupItem value="zalopay" id="zalopay" />
                        <Smartphone className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium">ZaloPay</p>
                          <p className="text-muted-foreground text-sm">
                            Thanh toán qua ví điện tử
                          </p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  {/* Payment Instructions */}
                  {paymentMethod === 'bank_transfer' && (
                    <Alert className="mt-4">
                      <AlertDescription>
                        Thông tin chuyển khoản sẽ được gửi qua email sau khi xác
                        nhận đặt chỗ.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Error Message */}
              {bookingMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {bookingMutation.error instanceof Error
                      ? bookingMutation.error.message
                      : 'Có lỗi xảy ra. Vui lòng thử lại.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!isFormValid || bookingMutation.isPending}
              >
                {bookingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  `Xác nhận và thanh toán ${formatPrice(total)}`
                )}
              </Button>
            </div>
          </form>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-0">
              <CardHeader>
                <CardTitle>Chi tiết đặt chỗ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Campsite/Site Info */}
                <div className="flex gap-4">
                  {bookingData.image && (
                    <Image
                      src={bookingData.image}
                      alt={displayName || 'Campsite'}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{displayName}</h3>
                    <p className="text-muted-foreground flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {bookingData.location}
                    </p>
                    {isPropertySiteBooking && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {bookingData.nights} nights • {bookingData.guests}{' '}
                        guests
                        {bookingData.pets > 0 && ` • ${bookingData.pets} pets`}
                        {bookingData.vehicles > 0 &&
                          ` • ${bookingData.vehicles} vehicles`}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Date Range */}
                {/* <div className="flex items-start gap-3">
                  <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">
                      {format(new Date(bookingData.checkIn), 'dd/MM/yyyy', {
                        locale: vi,
                      })}{' '}
                      -{' '}
                      {format(new Date(bookingData.checkOut), 'dd/MM/yyyy', {
                        locale: vi,
                      })}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {nights} đêm
                    </p>
                  </div>
                </div> */}

                {/* Guests */}
                <div className="flex items-start gap-3">
                  <Users className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Khách</p>
                    <p className="text-muted-foreground text-sm">
                      {bookingData.guests} người
                    </p>
                  </div>
                </div>

                {/* Pets */}
                {bookingData.pets > 0 && (
                  <div className="flex items-start gap-3">
                    <Dog className="text-muted-foreground mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Thú cưng</p>
                      <p className="text-muted-foreground text-sm">
                        {bookingData.pets} con
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {formatPrice(bookingData.basePrice)} × {nights} đêm
                    </span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {bookingData.cleaningFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Phí vệ sinh</span>
                      <span>{formatPrice(bookingData.cleaningFee)}</span>
                    </div>
                  )}

                  {totalPetFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Phí thú cưng</span>
                      <span>{formatPrice(totalPetFee)}</span>
                    </div>
                  )}

                  {additionalGuestFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Phí khách thêm</span>
                      <span>{formatPrice(additionalGuestFee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>Phí dịch vụ</span>
                    <span>{formatPrice(serviceFee)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Thuế VAT</span>
                    <span>{formatPrice(tax)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
