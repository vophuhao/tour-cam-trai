import { catchErrors, ErrorFactory } from "@/errors";
import { ResponseUtil } from "@/utils";
import UserModel from "../models/user.model";
import appAssert from "../utils/app-assert";

export default class UserController {
  getUserHandler = catchErrors(async (req, res) => {
    const user = await UserModel.findById(req.userId);
    appAssert(user, ErrorFactory.resourceNotFound("User"));
    return ResponseUtil.success(res, user, "Lấy thông tin user thành công");
  });

  getUserByUsernameHandler = catchErrors(async (req, res) => {
    const { username } = req.params;
    const user = await UserModel.findOne({ username });
    appAssert(user, ErrorFactory.resourceNotFound("User"));
    return ResponseUtil.success(res, user, "Lấy thông tin user thành công");
  });
}
