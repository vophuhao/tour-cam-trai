// src/routes/tour.routes.ts
import { Router } from "express";
import {
  createTourHandler,
  getToursPaginatedHandler,
  getTourByIdHandler,
  updateTourHandler,
  deleteTourHandler,
  activateTourHandler,
  deactivateTourHandler,
  getTourBySlugHandler,
} from "../controllers/tour.controller";

const tourRoutes = Router();

// Tạo tour mới
tourRoutes.post("/create", createTourHandler);

// Lấy danh sách tours (có phân trang, search)
tourRoutes.get("/", getToursPaginatedHandler);

// Lấy chi tiết tour theo id
tourRoutes.get("/:id", getTourByIdHandler);

// Cập nhật tour
tourRoutes.post("/update/:id", updateTourHandler);

// Xóa tour
tourRoutes.post("/delete/:id", deleteTourHandler);

// Kích hoạt tour
tourRoutes.patch("/:id/activate", activateTourHandler);

// Hủy kích hoạt tour
tourRoutes.patch("/:id/deactivate", deactivateTourHandler);



tourRoutes.get("/slug/:slug", getTourBySlugHandler);

export default tourRoutes;
