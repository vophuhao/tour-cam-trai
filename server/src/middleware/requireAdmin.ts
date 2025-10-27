import type { RequestHandler } from "express";
import UserModel from "../models/user.model" // model User của bạn
import { FORBIDDEN } from "@/constants/http";
import { AppErrorCode, appAssert } from "@/utils/errors";
import { UNAUTHORIZED } from "@/constants/http";
import { verifyToken } from "@/utils/jwt";
import type mongoose from "mongoose";
declare module "express-serve-static-core" {
  interface Request {
    userId: mongoose.Types.ObjectId;
    sessionId: mongoose.Types.ObjectId;
  }
}

// Middleware chỉ cho admin
const requireAdmin: RequestHandler = async (req, _res, next) => {
    try {
       const accessToken = req.cookies.accessToken as string | undefined;
           appAssert(
             accessToken,
             UNAUTHORIZED,
             "Access token is required",
             AppErrorCode.INVALID_ACCESS_TOKEN
           );
       
           const { error, payload } = verifyToken(accessToken);
           appAssert(
             payload,
             UNAUTHORIZED,
             error === "jwt expired" ? "Token expired" : "Invalid token",
             AppErrorCode.INVALID_ACCESS_TOKEN
           );
        const user = await UserModel.findById( payload.userId as mongoose.Types.ObjectId).select("role");
        appAssert(
            user,
            FORBIDDEN,
            "User not found",
            AppErrorCode.USER_NOT_FOUND
        );

        appAssert(
            user.role === "admin",
            FORBIDDEN,
            "Access denied. Admin only",
            AppErrorCode.FORBIDDEN
        );

        next(); // user là admin => cho phép tiếp tục
    } catch (error) {
        next(error);
    }
};

export default requireAdmin;
