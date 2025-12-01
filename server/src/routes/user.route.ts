import { UserController } from "@/controllers";
import { Router } from "express";

const userRoutes = Router();

const userController = new UserController();

// prefix: /users
userRoutes.get("/me", userController.getUserHandler);
userRoutes.get("/:username", userController.getUserByUsernameHandler);

export default userRoutes;
