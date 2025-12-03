/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Calendar, DollarSign, Home, TrendingUp, Users, Star, MessageSquare } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

interface DashboardStats {
  totalCampsites: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  averageRating: number;
  unreadMessages: number;
}

interface RecentBooking {
  _id: string;
  campsite: {
    name: string;
    images?: string[];
  };
  user: {
    username: string;
    avatar?: string;
  };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
}

export default function HostDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalCampsites: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    averageRating: 0,
    unreadMessages: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // Load stats
      const statsRes = await fetch(`${API}/host/stats`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data || {});
      }

      // Load recent bookings
      const bookingsRes = await fetch(`${API}/host/bookings/recent?limit=5`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setRecentBookings(data.data || []);
      }
    } catch (err) {
      console.error('Load dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Chào mừng trở lại, {user?.username || 'Host'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Campsites */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số địa điểm</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCampsites}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số đặt chỗ</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(stats.totalRevenue)}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đặt chỗ chờ duyệt</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Unread Messages */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tin nhắn chưa đọc</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.unreadMessages}</p>
            </div>
            <div className="rounded-full bg-pink-100 p-3">
              <MessageSquare className="h-6 w-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Đặt chỗ gần đây</h2>
          <a
            href="/host/bookings"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Xem tất cả
          </a>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-sm">Chưa có đặt chỗ nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Khách hàng</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Địa điểm</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Thời gian</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Tổng tiền</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {booking.user.avatar ? (
                          <img
                            src={booking.user.avatar}
                            alt={booking.user.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                            {booking.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {booking.user.username}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-900">{booking.campsite.name}</span>
                    </td>
                    <td className="py-4">
                      <div className="text-sm text-gray-600">
                        <div>
                          {new Date(booking.checkIn).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-400">
                          đến {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(booking.totalPrice)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}