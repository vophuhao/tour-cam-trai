import { UserController } from "@/controllers";
import { authenticate } from "@/middleware";
import { Router } from "express";

const userRoutes = Router();

const userController = new UserController();

// prefix: /users
userRoutes.get("/search", authenticate, userController.searchUsers);
userRoutes.get("/me", authenticate, userController.getUserHandler);
userRoutes.patch("/me", authenticate, userController.updateProfileHandler);
userRoutes.get("/:username", userController.getUserByUsernameHandler);

export default userRoutes;
