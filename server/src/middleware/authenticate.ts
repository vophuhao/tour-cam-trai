import { ErrorFactory } from "@/errors";
import { UserModel } from "@/models";
import { appAssert } from "@/utils";
import { verifyToken } from "@/utils/jwt";
import type { RequestHandler } from "express";
import type mongoose from "mongoose";

// wrap with catchErrors() if you need this to be async
const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const accessToken = req.cookies.accessToken as string | undefined;
    appAssert(accessToken, ErrorFactory.invalidToken("Missing access token"));

    const { error, payload } = verifyToken(accessToken);
    appAssert(
      payload,
      error === "jwt expired" ? ErrorFactory.expiredToken() : ErrorFactory.invalidToken()
    );

    // Check if user account is blocked
    const user = await UserModel.findById(payload.userId).select("isBlocked").lean();
    appAssert(user, ErrorFactory.invalidToken("User not found"));
    appAssert(!user.isBlocked, ErrorFactory.forbidden("Tài khoản của bạn đã bị khóa"));

    req.userId = payload.userId as mongoose.Types.ObjectId;
    req.sessionId = payload.sessionId as mongoose.Types.ObjectId;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
