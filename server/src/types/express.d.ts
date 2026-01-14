import type mongoose from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    userId: mongoose.Types.ObjectId;
    sessionId: mongoose.Types.ObjectId;
  }
}
