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

  updateProfileHandler = catchErrors(async (req, res) => {
    const userId = req.userId;
    appAssert(userId, ErrorFactory.invalidToken("Authentication required"));

    const { username, bio, avatar } = req.body;

    // Build update object
    const updateData: Record<string, string> = {};
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatarUrl = avatar;

    // Check if username is already taken (if changing)
    if (username) {
      const existingUser = await UserModel.findOne({
        username,
        _id: { $ne: userId },
      });
      appAssert(!existingUser, ErrorFactory.resourceExists("Username"));
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    appAssert(updatedUser, ErrorFactory.resourceNotFound("User"));

    return ResponseUtil.success(res, updatedUser.omitPassword(), "Cập nhật thông tin thành công");
  });

  searchUsers = catchErrors(async (req, res) => {
    const userId = req.userId;
    appAssert(userId, ErrorFactory.invalidCredentials('Người dùng chưa đăng nhập'));

    const { q } = req.query;
    appAssert(q, ErrorFactory.badRequest('Thiếu từ khóa tìm kiếm'));

    const query = String(q).trim();
    
    // Tìm kiếm theo username, full_name, email
    const users = await UserModel.find({
      _id: { $ne: userId }, // Không bao gồm chính mình
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username  avatar email')
      .limit(10);

    return ResponseUtil.success(res, users, 'Search results');
  });
}
