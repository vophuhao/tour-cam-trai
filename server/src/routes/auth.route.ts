import AuthController from "@/controllers/auth.controller";
import { container, TOKENS } from "@/di";
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
authRoutes.post("/email/verification", authController.sendEmailVerificationHandler);
authRoutes.post("/email/verify", authController.verifyEmailHandler);
authRoutes.post("/password/forgot", authController.sendPasswordResetHandler);
authRoutes.post("/password/reset", authController.resetPasswordHandler);

export default authRoutes;
