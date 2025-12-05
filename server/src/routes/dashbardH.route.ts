import { Router } from 'express';

import {
  getHostStats,
  getRevenueAnalytics,
  getBookingTrends,
} from '../controllers/dashboardH.controller';
import authenticate from '@/middleware/authenticate';

const dashboardHRoutes = Router();

// All routes require authentication
dashboardHRoutes.use(authenticate);

// GET /api/dashboard/stats - Overall dashboard stats
dashboardHRoutes.get('/stats', getHostStats);

// GET /api/dashboard/revenue - Revenue analytics with filters
dashboardHRoutes.get('/revenue', getRevenueAnalytics);

// GET /api/dashboard/trends - Booking trends over time
dashboardHRoutes.get('/trends', getBookingTrends);

export default dashboardHRoutes;