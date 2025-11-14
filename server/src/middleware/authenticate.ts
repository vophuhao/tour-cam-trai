import { ErrorFactory } from "@/errors";
import { appAssert } from "@/utils";
import { verifyToken } from "@/utils/jwt";
import type { RequestHandler } from "express";
import type mongoose from "mongoose";

// wrap with catchErrors() if you need this to be async
const authenticate: RequestHandler = (req, _res, next) => {
  try {
    const accessToken = req.cookies.accessToken as string | undefined;
    appAssert(accessToken, ErrorFactory.invalidToken("Missing access token"));

    const { error, payload } = verifyToken(accessToken);
    appAssert(
      payload,
      error === "jwt expired" ? ErrorFactory.expiredToken() : ErrorFactory.invalidToken()
    );

    req.userId = payload.userId as mongoose.Types.ObjectId;
    req.sessionId = payload.sessionId as mongoose.Types.ObjectId;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
