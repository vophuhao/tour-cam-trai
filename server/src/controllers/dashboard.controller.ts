import { catchErrors } from "@/errors";
import { BookingModel } from "@/models/booking.model";
import HostModel from "@/models/host.modal";
import { OrderModel } from "@/models/order.model";
import { ReviewModel } from "@/models/review.model";
import UserModel from "@/models/user.model";
import { ResponseUtil } from "@/utils";

export default class DashboardController {
  // Thống kê tổng quan
  getOverviewStats = catchErrors(async (req, res) => {
    const [
      totalUsers,
      totalHosts,
      totalLocations,
      totalBookings,
      totalRevenue,
      pendingHostRequests,
      activeBookings,
      totalReviews,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: "host" }),
      LocationModel.countDocuments({ status: "approved" }),
      BookingModel.countDocuments(),
      OrderModel.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      HostModel.countDocuments({ status: "pending" }),
      BookingModel.countDocuments({ status: "confirmed" }),
      ReviewModel.countDocuments(),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        hosts: totalHosts,
        guests: totalUsers - totalHosts,
      },
      locations: {
        total: totalLocations,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
      },
      pendingRequests: {
        hosts: pendingHostRequests,
      },
      reviews: {
        total: totalReviews,
      },
    };

    return ResponseUtil.success(res, stats, "Lấy thống kê tổng quan thành công");
  });

  // Thống kê doanh thu theo tháng
  getRevenueStats = catchErrors(async (req, res) => {
    const { year = new Date().getFullYear() } = req.query;

    const revenueByMonth = await OrderModel.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill missing months with 0
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthData = revenueByMonth.find((r: { _id: number }) => r._id === i + 1);
      return {
        month: i + 1,
        revenue: monthData?.revenue || 0,
        count: monthData?.count || 0,
      };
    });

    return ResponseUtil.success(res, monthlyData, "Lấy thống kê doanh thu thành công");
  });

  // Thống kê booking theo trạng thái
  getBookingStats = catchErrors(async (req, res) => {
    const bookingsByStatus = await BookingModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const stats = {
      byStatus: bookingsByStatus,
      total: bookingsByStatus.reduce((sum: any, item: { count: any }) => sum + item.count, 0),
    };

    return ResponseUtil.success(res, stats, "Lấy thống kê booking thành công");
  });

  // Top locations
  getTopLocations = catchErrors(async (req, res) => {
    const { limit = 10 } = req.query;

    const topLocations = await LocationModel.aggregate([
      { $match: { status: "approved" } },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "location",
          as: "bookings",
        },
      },
      {
        $addFields: {
          bookingCount: { $size: "$bookings" },
          revenue: { $sum: "$bookings.totalPrice" },
        },
      },
      {
        $sort: { bookingCount: -1 },
      },
      {
        $limit: parseInt(limit as string),
      },
      {
        $project: {
          name: 1,
          address: 1,
          rating: 1,
          bookingCount: 1,
          revenue: 1,
          images: { $arrayElemAt: ["$images", 0] },
        },
      },
    ]);

    return ResponseUtil.success(res, topLocations, "Lấy top địa điểm thành công");
  });

  // Top hosts
  getTopHosts = catchErrors(async (req, res) => {
    const { limit = 10 } = req.query;

    const topHosts = await UserModel.aggregate([
      { $match: { role: "host" } },
      {
        $lookup: {
          from: "locations",
          localField: "_id",
          foreignField: "host",
          as: "locations",
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "locations._id",
          foreignField: "location",
          as: "bookings",
        },
      },
      {
        $addFields: {
          locationCount: { $size: "$locations" },
          bookingCount: { $size: "$bookings" },
          revenue: { $sum: "$bookings.totalPrice" },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: parseInt(limit as string),
      },
      {
        $project: {
          username: 1,
          email: 1,
          avatarUrl: 1,
          locationCount: 1,
          bookingCount: 1,
          revenue: 1,
        },
      },
    ]);

    return ResponseUtil.success(res, topHosts, "Lấy top host thành công");
  });

  // Recent activities
  getRecentActivities = catchErrors(async (req, res) => {
    const { limit = 20 } = req.query;

    const [recentBookings, recentReviews, recentUsers] = await Promise.all([
      BookingModel.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string) / 3)
        .populate("user", "username avatarUrl")
        .populate("location", "name")
        .select("status totalPrice createdAt"),

      ReviewModel.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string) / 3)
        .populate("user", "username avatarUrl")
        .populate("location", "name")
        .select("rating comment createdAt"),

      UserModel.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string) / 3)
        .select("username email role createdAt"),
    ]);

    const activities = [
      ...recentBookings.map((b: { createdAt: any }) => ({
        type: "booking",
        data: b,
        createdAt: b.createdAt,
      })),
      ...recentReviews.map((r: { createdAt: any }) => ({
        type: "review",
        data: r,
        createdAt: r.createdAt,
      })),
      ...recentUsers.map((u: { createdAt: any }) => ({
        type: "user",
        data: u,
        createdAt: u.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return ResponseUtil.success(
      res,
      activities.slice(0, parseInt(limit as string)),
      "Lấy hoạt động gần đây thành công"
    );
  });

  // Growth stats (so với tháng trước)
  getGrowthStats = catchErrors(async (req, res) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      usersThisMonth,
      usersLastMonth,
      bookingsThisMonth,
      bookingsLastMonth,
      revenueThisMonth,
      revenueLastMonth,
    ] = await Promise.all([
      UserModel.countDocuments({ createdAt: { $gte: thisMonth } }),
      UserModel.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      BookingModel.countDocuments({ createdAt: { $gte: thisMonth } }),
      BookingModel.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      OrderModel.aggregate([
        { $match: { status: "completed", createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      OrderModel.aggregate([
        { $match: { status: "completed", createdAt: { $gte: lastMonth, $lt: thisMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const stats = {
      users: {
        current: usersThisMonth,
        previous: usersLastMonth,
        growth: calculateGrowth(usersThisMonth, usersLastMonth),
      },
      bookings: {
        current: bookingsThisMonth,
        previous: bookingsLastMonth,
        growth: calculateGrowth(bookingsThisMonth, bookingsLastMonth),
      },
      revenue: {
        current: revenueThisMonth[0]?.total || 0,
        previous: revenueLastMonth[0]?.total || 0,
        growth: calculateGrowth(revenueThisMonth[0]?.total || 0, revenueLastMonth[0]?.total || 0),
      },
    };

    return ResponseUtil.success(res, stats, "Lấy thống kê tăng trưởng thành công");
  });
}
