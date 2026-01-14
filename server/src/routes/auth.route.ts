import AuthController from "@/controllers/auth.controller";
import { container, TOKENS } from "@/di";
import { authenticate } from "@/middleware";
import type AuthService from "@/services/auth.service";
import { Router } from "express";

const authRoutes = Router();

const authService = container.resolve<AuthService>(TOKENS.AuthService);
const authController = new AuthController(authService);

// prefix: /auth
authRoutes.post("/register", authController.registerHandler);
authRoutes.post("/login", authController.loginHandler);
authRoutes.post("/login/google", authController.googleLoginHandler);
authRoutes.get("/refresh", authController.refreshHandler);
authRoutes.post("/logout", authController.logoutHandler);
authRoutes.post("/verify/send", authController.sendEmailVerificationHandler);
authRoutes.post("/verify", authController.verifyEmailHandler);
authRoutes.post("/password/verify", authController.verifyPasswordResetCodeHandler);
authRoutes.post("/password/send", authController.sendPasswordResetHandler);
authRoutes.post("/password/reset", authController.resetPasswordHandler);
authRoutes.post("/password/change", authenticate, authController.changePasswordHandler);

export default authRoutes;
