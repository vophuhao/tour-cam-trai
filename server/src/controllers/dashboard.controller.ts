import { catchErrors } from "@/errors";
import { BookingModel } from "@/models/booking.model";
import HostModel from "@/models/host.modal";
import { OrderModel } from "@/models/order.model";
import { PropertyModel } from "@/models/property.model";
import ProductModel from "@/models/product.model";
import { ReviewModel } from "@/models/review.model";
import UserModel from "@/models/user.model";
import { ResponseUtil } from "@/utils";

export default class DashboardController {
  // Thống kê tổng quan
  getOverviewStats = catchErrors(async (req, res) => {
    const [
      totalUsers,
      totalHosts,
      totalProperties,
      totalProducts,
      totalBookings,
      totalOrders,
      bookingRevenue,
      orderRevenue,
      pendingHostRequests,
      activeBookings,
      totalReviews,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: "host" }),
      PropertyModel.countDocuments({ status: "active" }),
      ProductModel.countDocuments({ isActive: true }),
      BookingModel.countDocuments(),
      OrderModel.countDocuments(),
      // Booking revenue from pricing.total
      BookingModel.aggregate([
        { $match: { status: { $in: ["confirmed", "completed"] } } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
      // Order revenue from grandTotal
      OrderModel.aggregate([
        { $match: { orderStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
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
      properties: {
        total: totalProperties,
      },
      products: {
        total: totalProducts,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
      },
      orders: {
        total: totalOrders,
      },
      revenue: {
        booking: bookingRevenue[0]?.total || 0,
        order: orderRevenue[0]?.total || 0,
        total: (bookingRevenue[0]?.total || 0) + (orderRevenue[0]?.total || 0),
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

  // Thống kê doanh thu theo tháng (Booking + Order)
  getRevenueStats = catchErrors(async (req, res) => {
    const { year = new Date().getFullYear() } = req.query;

    const [bookingRevenueByMonth, orderRevenueByMonth] = await Promise.all([
      // Booking revenue
      BookingModel.aggregate([
        {
          $match: {
            status: { $in: ["confirmed", "completed"] },
            createdAt: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$pricing.total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Order revenue
      OrderModel.aggregate([
        {
          $match: {
            orderStatus: "completed",
            createdAt: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$grandTotal" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge and fill missing months
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const bookingData = bookingRevenueByMonth.find((r: any) => r._id === i + 1);
      const orderData = orderRevenueByMonth.find((r: any) => r._id === i + 1);
      
      return {
        month: i + 1,
        bookingRevenue: bookingData?.revenue || 0,
        bookingCount: bookingData?.count || 0,
        orderRevenue: orderData?.revenue || 0,
        orderCount: orderData?.count || 0,
        totalRevenue: (bookingData?.revenue || 0) + (orderData?.revenue || 0),
        totalCount: (bookingData?.count || 0) + (orderData?.count || 0),
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
          totalRevenue: { $sum: "$pricing.total" },
        },
      },
    ]);

    const stats = {
      byStatus: bookingsByStatus,
      total: bookingsByStatus.reduce((sum: number, item: any) => sum + item.count, 0),
      totalRevenue: bookingsByStatus.reduce((sum: number, item: any) => sum + item.totalRevenue, 0),
    };

    return ResponseUtil.success(res, stats, "Lấy thống kê booking thành công");
  });

  // Thống kê order theo trạng thái
  getOrderStats = catchErrors(async (req, res) => {
    const ordersByStatus = await OrderModel.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$grandTotal" },
        },
      },
    ]);

    const stats = {
      byStatus: ordersByStatus,
      total: ordersByStatus.reduce((sum: number, item: any) => sum + item.count, 0),
      totalRevenue: ordersByStatus.reduce((sum: number, item: any) => sum + item.totalRevenue, 0),
    };

    return ResponseUtil.success(res, stats, "Lấy thống kê đơn hàng thành công");
  });

  // Top properties (theo booking count & revenue)
  getTopProperties = catchErrors(async (req, res) => {
    const { limit = 10 } = req.query;

    const topProperties = await BookingModel.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      {
        $group: {
          _id: "$property",
          bookingCount: { $sum: 1 },
          revenue: { $sum: "$pricing.total" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit as string) },
      {
        $lookup: {
          from: "properties",
          localField: "_id",
          foreignField: "_id",
          as: "property",
        },
      },
      { $unwind: "$property" },
      {
        $project: {
          name: "$property.name",
          location: "$property.location",
          photos: { $arrayElemAt: ["$property.photos", 0] },
          bookingCount: 1,
          revenue: 1,
        },
      },
    ]);

    return ResponseUtil.success(res, topProperties, "Lấy top properties thành công");
  });

  // Top products (theo order count & revenue)
  getTopProducts = catchErrors(async (req, res) => {
    const { limit = 10 } = req.query;

    const topProducts = await OrderModel.aggregate([
      { $match: { orderStatus: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          orderCount: { $sum: 1 },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit as string) },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          price: "$product.price",
          image: { $arrayElemAt: ["$product.images", 0] },
          orderCount: 1,
          quantitySold: 1,
          revenue: 1,
        },
      },
    ]);

    return ResponseUtil.success(res, topProducts, "Lấy top sản phẩm thành công");
  });

  // Top hosts (theo booking & revenue)
  getTopHosts = catchErrors(async (req, res) => {
    const { limit = 10 } = req.query;

    const topHosts = await BookingModel.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      {
        $group: {
          _id: "$host",
          bookingCount: { $sum: 1 },
          revenue: { $sum: "$pricing.total" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit as string) },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "host",
        },
      },
      { $unwind: "$host" },
      {
        $lookup: {
          from: "properties",
          localField: "_id",
          foreignField: "host",
          as: "properties",
        },
      },
      {
        $project: {
          username: "$host.username",
          email: "$host.email",
          avatarUrl: "$host.avatarUrl",
          propertyCount: { $size: "$properties" },
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
    const limitPerType = Math.ceil(parseInt(limit as string) / 4);

    const [recentBookings, recentOrders, recentReviews, recentUsers] = await Promise.all([
      BookingModel.find()
        .sort({ createdAt: -1 })
        .limit(limitPerType)
        .populate("guest", "username avatarUrl")
        .populate("property", "name")
        .select("status pricing.total createdAt"),

      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(limitPerType)
        .populate("user", "username avatarUrl")
        .select("orderStatus grandTotal createdAt code"),

      ReviewModel.find()
        .sort({ createdAt: -1 })
        .limit(limitPerType)
        .populate("user", "username avatarUrl")
        .populate("property", "name")
        .select("rating comment createdAt"),

      UserModel.find()
        .sort({ createdAt: -1 })
        .limit(limitPerType)
        .select("username email role createdAt"),
    ]);

    const activities = [
      ...recentBookings.map((b: any) => ({
        type: "booking",
        data: b,
        createdAt: b.createdAt,
      })),
      ...recentOrders.map((o: any) => ({
        type: "order",
        data: o,
        createdAt: o.createdAt,
      })),
      ...recentReviews.map((r: any) => ({
        type: "review",
        data: r,
        createdAt: r.createdAt,
      })),
      ...recentUsers.map((u: any) => ({
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
      ordersThisMonth,
      ordersLastMonth,
      bookingRevenueThisMonth,
      bookingRevenueLastMonth,
      orderRevenueThisMonth,
      orderRevenueLastMonth,
    ] = await Promise.all([
      UserModel.countDocuments({ createdAt: { $gte: thisMonth } }),
      UserModel.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      
      BookingModel.countDocuments({ createdAt: { $gte: thisMonth } }),
      BookingModel.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      
      OrderModel.countDocuments({ createdAt: { $gte: thisMonth } }),
      OrderModel.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      
      BookingModel.aggregate([
        { $match: { status: { $in: ["confirmed", "completed"] }, createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
      BookingModel.aggregate([
        { $match: { status: { $in: ["confirmed", "completed"] }, createdAt: { $gte: lastMonth, $lt: thisMonth } } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
      
      OrderModel.aggregate([
        { $match: { orderStatus: "completed", createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      OrderModel.aggregate([
        { $match: { orderStatus: "completed", createdAt: { $gte: lastMonth, $lt: thisMonth } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
    ]);

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const bookingRevCurrent = bookingRevenueThisMonth[0]?.total || 0;
    const bookingRevPrevious = bookingRevenueLastMonth[0]?.total || 0;
    const orderRevCurrent = orderRevenueThisMonth[0]?.total || 0;
    const orderRevPrevious = orderRevenueLastMonth[0]?.total || 0;
    const totalRevCurrent = bookingRevCurrent + orderRevCurrent;
    const totalRevPrevious = bookingRevPrevious + orderRevPrevious;

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
      orders: {
        current: ordersThisMonth,
        previous: ordersLastMonth,
        growth: calculateGrowth(ordersThisMonth, ordersLastMonth),
      },
      revenue: {
        booking: {
          current: bookingRevCurrent,
          previous: bookingRevPrevious,
          growth: calculateGrowth(bookingRevCurrent, bookingRevPrevious),
        },
        order: {
          current: orderRevCurrent,
          previous: orderRevPrevious,
          growth: calculateGrowth(orderRevCurrent, orderRevPrevious),
        },
        total: {
          current: totalRevCurrent,
          previous: totalRevPrevious,
          growth: calculateGrowth(totalRevCurrent, totalRevPrevious),
        },
      },
    };

    return ResponseUtil.success(res, stats, "Lấy thống kê tăng trưởng thành công");
  });

  // Thống kê sản phẩm
  getProductStats = catchErrors(async (req, res) => {
    const [totalProducts, activeProducts, outOfStock, lowStock] = await Promise.all([
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ isActive: true }),
      ProductModel.countDocuments({ stock: 0 }),
      ProductModel.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
    ]);

    const stats = {
      total: totalProducts,
      active: activeProducts,
      inactive: totalProducts - activeProducts,
      outOfStock,
      lowStock,
    };

    return ResponseUtil.success(res, stats, "Lấy thống kê sản phẩm thành công");
  });

  // Thống kê properties
  getPropertyStats = catchErrors(async (req, res) => {
    const propertiesByStatus = await PropertyModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      byStatus: propertiesByStatus,
      total: propertiesByStatus.reduce((sum: number, item: any) => sum + item.count, 0),
    };

    return ResponseUtil.success(res, stats, "Lấy thống kê properties thành công");
  });
}