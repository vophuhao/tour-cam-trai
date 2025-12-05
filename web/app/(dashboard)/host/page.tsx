/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  Calendar,
  DollarSign,
  Home,
  TrendingUp,
  Users,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

interface DashboardStats {
  properties: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    suspended: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  recentBookings: any[];
}

interface RevenueData {
  period: string;
  summary: {
    totalRevenue: number;
    totalBookings: number;
    averageBookingValue: number;
  };
  chartData: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  topProperties: Array<{
    name: string;
    revenue: number;
    bookings: number;
  }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function HostDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadRevenueData();
    }
  }, [user, period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${API}/dashboardH/stats`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Load dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch(
        `${API}/dashboardH/revenue?period=${period}`,
        {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRevenueData(data.data);
      }
    } catch (err) {
      console.error('Load revenue error:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string) => {
    const texts: any = {
      confirmed: 'Đã xác nhận',
      pending: 'Chờ xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành',
    };
    return texts[status.toLowerCase()] || status;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Không thể tải dữ liệu dashboard
      </div>
    );
  }

  // Pie chart data for properties status
  const propertiesChartData = [
    { name: 'Đang hoạt động', value: stats.properties.active },
    { name: 'Chờ duyệt', value: stats.properties.pending },
    { name: 'Không hoạt động', value: stats.properties.inactive },
    { name: 'Tạm ngưng', value: stats.properties.suspended },
  ].filter(item => item.value > 0);

  // Pie chart data for bookings status
  const bookingsChartData = [
    { name: 'Đã xác nhận', value: stats.bookings.confirmed },
    { name: 'Hoàn thành', value: stats.bookings.completed },
    { name: 'Chờ xác nhận', value: stats.bookings.pending },
    { name: 'Đã hủy', value: stats.bookings.cancelled },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <p className="mt-2 text-lg ">
          Chào mừng trở lại, {user?.username || 'Host'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Properties */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Property</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.properties.total}
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                {stats.properties.active} đang hoạt động
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3">
              <Home className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Booking</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.bookings.total}
              </p>
              <p className="mt-1 text-xs text-yellow-600">
                {stats.bookings.pending} chờ duyệt
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đánh Giá TB</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.averageRating}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {stats.totalReviews} đánh giá
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Properties Status */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Trạng Thái Properties
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={propertiesChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent ?? 0 * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {propertiesChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings Status */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Trạng Thái Bookings
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingsChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent ?? 0 * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {bookingsChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Báo Cáo Doanh Thu
          </h3>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hôm nay</SelectItem>
              <SelectItem value="week">7 ngày</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {revenueData && (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200">
                <p className="text-sm font-medium text-emerald-900">
                  Tổng Doanh Thu
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {formatCurrency(revenueData.summary.totalRevenue)}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  Tổng Booking
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {revenueData.summary.totalBookings}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
                <p className="text-sm font-medium text-purple-900">
                  Giá Trị TB/Booking
                </p>
                <p className="mt-1 text-2xl font-bold text-purple-700">
                  {formatCurrency(revenueData.summary.averageBookingValue)}
                </p>
              </div>
            </div>

            {/* Revenue Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  name="Doanh thu"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  name="Số booking"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Top Properties */}
            {revenueData.topProperties.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-4 font-semibold text-gray-900">
                  Top 5 Properties Có Doanh Thu Cao Nhất
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueData.topProperties}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#10b981" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Booking Gần Đây
          </h2>
          <a
            href="/host/bookings"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Xem tất cả
          </a>
        </div>

        {stats.recentBookings.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-sm">Chưa có booking nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">
                    Khách hàng
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">
                    Property
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">
                    Thời gian
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">
                    Tổng tiền
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentBookings.map((booking: any) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {booking.guest?.avatarUrl ? (
                          <img
                            src={booking.guest.avatarUrl}
                            alt={booking.guest.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                            {booking.guest?.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {booking.guest?.username}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-900">
                        {booking.property?.name}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="text-sm text-gray-600">
                        <div>
                          {new Date(booking.checkIn).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-400">
                          đến{' '}
                          {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalPrice)}
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