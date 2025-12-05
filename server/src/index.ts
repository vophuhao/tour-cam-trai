import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import cron from "node-cron";
import { connectRedis, connectToDatabase } from "./config";
import { APP_ORIGIN, NODE_ENV, OK, PORT } from "./constants";
import { authenticate, errorHandler } from "./middleware";
import {
  addressRoutes,
  amenityRoutes,
  authRoutes,
  bookingRoutes,
  campsiteRoutes,
  categoryRoutes,
  mediaRoutes,
  orderRoutes,
  productRoutes,
  propertyRoutes,
  reviewRoutes,
  siteRoutes,
  tourRoutes,
  userRoutes,
} from "./routes";
import cartRoutes from "./routes/cart.route";
import supportRouter from "./routes/directMessage.route";
import payosRoutes from "./routes/payos.route,";
import ratingRoutes from "./routes/rating.route";
import { OrderService } from "./services";
import { initializeSocket } from "./socket";
// import dashboardRoutes from "./routes/dashboard.route";

const app = express();

// add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

const orderService = new OrderService();

// Ch?y m?i 10 ph?t
cron.schedule("*/10 * * * *", async () => {
  console.log("?? Cron: ki?m tra don c?n h?y...");
  await orderService.cancelExpiredOrders();
});
// health check
app.get("/", (_, res) => {
  return res.status(OK).json({
    status: "healthy",
  });
});

// public routes
app.use("/auth", authRoutes);

// protected routes
app.use("/users", authenticate, userRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/tours", tourRoutes);
app.use("/media", authenticate, mediaRoutes);
app.use("/cart", authenticate, cartRoutes);
app.use("/address", authenticate, addressRoutes);
app.use("/support", authenticate, supportRouter);
app.use("/orders", authenticate, orderRoutes);
app.use("/rating", authenticate, ratingRoutes);
app.use("/campsites", campsiteRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/amenities", amenityRoutes);
app.use("/properties", propertyRoutes);
app.use("/sites", siteRoutes);
app.use("/payos/webhook", payosRoutes);
app.use("/messages", authenticate, supportRouter);
// app.use("/dashboard", authenticate, dashboardRoutes);

app.use(errorHandler);

const server = http.createServer(app);
initializeSocket(server); // Kh?i t?o socket v?i server

server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
  await connectRedis();
});
