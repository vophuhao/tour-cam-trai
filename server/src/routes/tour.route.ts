// src/routes/tour.routes.ts
import TourController from "@/controllers/tour.controller";
import { container, TOKENS } from "@/di";
import type TourService from "@/services/tour.service";
import { Router } from "express";

const tourRoutes = Router();

// Resolve dependencies via DI container
const tourService = container.resolve<TourService>(TOKENS.TourService);
const tourController = new TourController(tourService);

// Tạo tour mới
tourRoutes.post("/create", tourController.createTour);

// Lấy danh sách tours (có phân trang, search)
tourRoutes.get("/", tourController.getToursPaginated);

// Lấy chi tiết tour theo id
tourRoutes.get(":id", tourController.getTourById);

// Cập nhật tour
tourRoutes.post("/update/:id", tourController.updateTour);

// Xóa tour
tourRoutes.post("/delete/:id", tourController.deleteTour);

// Kích hoạt tour
tourRoutes.patch(":id/activate", tourController.activateTour);

// Hủy kích hoạt tour
tourRoutes.patch(":id/deactivate", tourController.deactivateTour);

tourRoutes.get("/slug/:slug", tourController.getTourBySlug);

export default tourRoutes;
