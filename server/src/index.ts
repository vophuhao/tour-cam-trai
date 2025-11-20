import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { connectRedis, connectToDatabase } from "./config";
import { APP_ORIGIN, NODE_ENV, OK, PORT } from "./constants";
import { authenticate, errorHandler, requireAdmin } from "./middleware";
import http from "http";
import cron from "node-cron";
import {
  addressRoutes,
  authRoutes,
  categoryRoutes,
  mediaRoutes,
  orderRoutes,
  productRoutes,
  tourRoutes,
  userRoutes,
} from "./routes";
import cartRoutes from "./routes/cart.route";
import { OrderService } from "./services";


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

// health check
app.get("/", (_, res) => {
  return res.status(OK).json({
    status: "healthy",
  });
});

const orderService = new OrderService();

// Chạy mỗi 10 phút
cron.schedule("*/10 * * * *", async () => {
  console.log("⏱️ Cron: kiểm tra đơn cần hủy...");
  await orderService.cancelExpiredOrders();
});

// public routes
app.use("/auth", authRoutes);

// protected routes
app.use("/users", authenticate, userRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", authenticate, productRoutes);
app.use("/tours", tourRoutes);
app.use("/media", authenticate, requireAdmin, mediaRoutes);
app.use("/cart", authenticate, cartRoutes);
app.use("/address", authenticate, addressRoutes)
app.use("/orders", orderRoutes);


// error handler middleware
app.use(errorHandler);

const server = http.createServer(app);


server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
  await connectRedis();
});
