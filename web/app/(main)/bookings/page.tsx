/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Users,
    MapPin,
    Clock,
    DollarSign,
    Eye,
    MessageSquare,
    Search,
    Filter,
    Package,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getMyBookings } from "@/lib/client-actions";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
    confirmed: { label: "Đã xác nhận", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
    completed: { label: "Hoàn thành", color: "bg-blue-100 text-blue-800" },
    refunded: { label: "Đã hoàn tiền", color: "bg-purple-100 text-purple-800" },
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800" },
    paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-800" },
    refunded: { label: "Đã hoàn tiền", color: "bg-purple-100 text-purple-800" },
    failed: { label: "Thất bại", color: "bg-red-100 text-red-800" },
};

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
];

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
            console.error("Error fetching bookings:", error);
            toast.error("Có lỗi khi tải danh sách booking");
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [bookings, activeTab, sortBy, searchTerm]);

    function filterBookings() {
        let filtered = [...bookings];

        // Filter by tab
        if (activeTab !== "all") {
            filtered = filtered.filter((b) => b.status === activeTab);
        }

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (b) =>
                    b.campsite.name.toLowerCase().includes(term) ||
                    b.campsite.location.city.toLowerCase().includes(term)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "checkin-soon":
                    return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
                case "price-high":
                    return b.pricing.total - a.pricing.total;
                case "price-low":
                    return a.pricing.total - b.pricing.total;
                default:
                    return 0;
            }
        });

        setFilteredBookings(filtered);
    }

    function formatPrice(price: number) {
        return new Intl.NumberFormat("vi-VN").format(price);
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        completed: bookings.filter((b) => b.status === "completed").length,
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">            
                <Card>
                    <CardHeader>
                       <CardTitle>Booking của tôi</CardTitle>                      
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Status Filter Buttons */}
                            <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map((status) => {
                                    const count = status.value === 'all'
                                        ? bookings.length
                                        : bookings.filter(b => b.status === status.value).length;

                                    return (
                                        <button
                                            key={status.value}
                                            onClick={() => setActiveTab(status.value)}
                                            className={`group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === status.value
                                                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20'
                                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {status.label}
                                            {count > 0 && (
                                                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${activeTab === status.value
                                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                                        : 'bg-primary/10 text-primary'
                                                    }`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                           
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách booking</CardTitle>
                        <CardDescription>
                            {filteredBookings.length} booking
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="py-12 text-center">
                                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">Chưa có booking nào</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm
                                        ? "Không tìm thấy kết quả phù hợp"
                                        : "Bạn chưa đặt chỗ camping nào"}
                                </p>
                                {!searchTerm && (
                                    <Button
                                        onClick={() => router.push('/search')}
                                        className="mt-4"
                                    >
                                        Khám phá địa điểm
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredBookings.map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="rounded-lg border bg-card hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col lg:flex-row">
                                            {/* Campsite Image */}
                                            <div className="relative h-48 w-full lg:h-auto lg:w-64 flex-shrink-0">
                                                <Image
                                                    src={booking.campsite.images[0]}
                                                    alt={booking.campsite.name}
                                                    fill
                                                    className="object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none"
                                                />
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    <Badge className={STATUS_LABELS[booking.status].color}>
                                                        {STATUS_LABELS[booking.status].label}
                                                    </Badge>
                                                    <Badge className={PAYMENT_STATUS_LABELS[booking.paymentStatus].color}>
                                                        {PAYMENT_STATUS_LABELS[booking.paymentStatus].label}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-1 flex-col p-6">
                                                {/* Campsite Info */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                            {booking.campsite.name}
                                                        </h3>
                                                        <div className="mt-1 flex items-center text-sm text-gray-600">
                                                            <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                                                            {booking.campsite.location.city}, {booking.campsite.location.state}
                                                        </div>
                                                    </div>

                                                    <div className="text-right ml-4">
                                                        <p className="text-sm text-gray-500">Tổng tiền</p>
                                                        <p className="text-2xl font-bold text-primary">
                                                            {formatPrice(booking.pricing.total)} ₫
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Booking Details Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Check-in</p>
                                                        <p className="mt-1 font-semibold text-sm">
                                                            {formatDate(booking.checkIn)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Check-out</p>
                                                        <p className="mt-1 font-semibold text-sm">
                                                            {formatDate(booking.checkOut)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Số đêm</p>
                                                        <p className="mt-1 font-semibold text-sm">{booking.nights} đêm</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Khách</p>
                                                        <p className="mt-1 font-semibold text-sm">
                                                            <Users className="mr-1 inline h-3.5 w-3.5" />
                                                            {booking.numberOfGuests} người
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Guest Message */}
                                                {booking.guestMessage && (
                                                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                                                        <div className="flex items-start gap-2">
                                                            <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-xs font-medium text-muted-foreground">
                                                                    Ghi chú của bạn
                                                                </p>
                                                                <p className="mt-1 text-sm">
                                                                    {booking.guestMessage}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="mt-4 flex gap-2">
                                                    <Button
                                                        onClick={() => router.push(`/bookings/${booking._id}`)}
                                                        variant="default"
                                                        size="sm"
                                                        className="flex-1"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Xem chi tiết
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}