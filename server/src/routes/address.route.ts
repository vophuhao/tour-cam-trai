// src/routes/address.routes.ts
import AddressController from "@/controllers/address.controller";
import AddressService from "@/services/address.service";
import { container, TOKENS } from "@/di";
import { Router } from "express";

const addressRoutes = Router();

// Nếu dùng DI container:
let addressService: AddressService;
try {
  addressService = container.resolve<AddressService>(TOKENS.AddressService);
} catch {
  // fallback nếu chưa đăng ký trong container
  addressService = new AddressService();
}

const addressController = new AddressController(addressService);

// Lấy danh sách địa chỉ user
addressRoutes.get("/", addressController.getAddresses);

// Thêm địa chỉ mới
addressRoutes.post("/", addressController.addAddress);

// Xóa địa chỉ theo index
addressRoutes.delete("/:index", addressController.removeAddress);

// Đặt địa chỉ mặc định theo index
addressRoutes.patch("/:index/default", addressController.setDefault);

export default addressRoutes;