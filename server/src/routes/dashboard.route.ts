// import { Router } from "express";

// import DashboardController from "@/controllers/dashboard.controller";
// import { authenticate, requireAdmin } from "@/middleware";

// const dashboardRoutes = Router();
// const dashboardController = new DashboardController();

// // Tất cả routes đều yêu cầu admin
// dashboardRoutes.use(authenticate, requireAdmin);

// // Overview stats
// dashboardRoutes.get("/overview", dashboardController.getOverviewStats);

// // Revenue stats
// dashboardRoutes.get("/revenue", dashboardController.getRevenueStats);

// // Booking stats
// dashboardRoutes.get("/bookings", dashboardController.getBookingStats);

// // Top locations
// dashboardRoutes.get("/top-locations", dashboardController.getTopLocations);

// // Top hosts
// dashboardRoutes.get("/top-hosts", dashboardController.getTopHosts);

// // Recent activities
// dashboardRoutes.get("/activities", dashboardController.getRecentActivities);

// // Growth stats
// dashboardRoutes.get("/growth", dashboardController.getGrowthStats);

// export default dashboardRoutes;