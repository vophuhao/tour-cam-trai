import { catchErrors, ErrorFactory } from "@/errors";
import { ResponseUtil, sendMail } from "@/utils";
import UserModel from "../models/user.model";
import appAssert from "../utils/app-assert";
import HostModel from "@/models/host.modal";

export default class UserController {
  getUserHandler = catchErrors(async (req, res) => {
    const user = await UserModel.findById(req.userId);
    appAssert(user, ErrorFactory.resourceNotFound("User"));
    return ResponseUtil.success(res, user, "Lấy thông tin user thành công");
  });

  getAllHost = catchErrors(async (req, res) => {
    const hosts = await UserModel.find({ role: "host" }).select('username email avatarUrl createdAt');
    return ResponseUtil.success(res, hosts, 'Lấy danh sách host thành công');
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
      _id: { $ne: userId },
      role: "host",
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { role: "host" },
      ],
    })
      .select('username  avatar email')
      .limit(10);

    return ResponseUtil.success(res, users, 'Search results');
  });

  getAllUsers = catchErrors(async (req, res) => {
    const users = await UserModel.find().select('username email role createdAt avatarUrl');
    return ResponseUtil.success(res, users, 'Lấy danh sách người dùng thành công');
  });

  becomeHostHandler = catchErrors(async (req, res) => {
    const userId = req.userId;

    const data = req.body;
    data.user = userId;
    await HostModel.create(data);
    return ResponseUtil.success(res, null, "Đăng ký trở thành host thành công");
  });

  getAllBecomeHost = catchErrors(async (req, res) => {
    const hosts = await HostModel.find().populate('user', 'username email avatarUrl');
    return ResponseUtil.success(res, hosts, 'Lấy danh sách đăng ký host thành công');
  });

  updateStatusHostHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    
    const host = await HostModel.findById(id);
    const user = await UserModel.findById(host?.user);
    appAssert(host, ErrorFactory.resourceNotFound("Host request"));

    const previousStatus = host.status;
    host.status = status;
    await host.save();

    // Gửi email thông báo
    if (status === 'approved' && previousStatus !== 'approved') {
      await user?.updateOne({ role: 'host' });
      await sendMail({
        to: host.gmail,
        subject: '🎉 Chúc mừng! Yêu cầu trở thành Host đã được chấp nhận',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info-box { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Chúc mừng ${host.name}!</h1>
                <p style="font-size: 18px; margin: 10px 0;">Bạn đã trở thành Host chính thức</p>
              </div>
              
              <div class="content">
                <p>Xin chào <strong>${host.name}</strong>,</p>
                
                <p>Chúc mừng! Yêu cầu trở thành Host của bạn đã được <strong style="color: #10b981;">CHẤP NHẬN</strong>.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #10b981;">📋 Thông tin tài khoản Host</h3>
                  <p><strong>Tên:</strong> ${host.name}</p>
                  <p><strong>Email:</strong> ${host.gmail}</p>
                  ${host.phone ? `<p><strong>Số điện thoại:</strong> ${host.phone}</p>` : ''}
                  <p><strong>Trạng thái:</strong> <span style="color: #10b981; font-weight: bold;">Đã kích hoạt</span></p>
                </div>
                
                <h3>🚀 Bước tiếp theo:</h3>
                <ul>
                  <li>Đăng nhập vào hệ thống với tài khoản của bạn</li>
                  <li>Tạo địa điểm cắm trại đầu tiên của bạn</li>
                  <li>Thiết lập giá cả và quy định</li>
                  <li>Bắt đầu đón khách và kinh doanh</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.CLIENT_URL}/host/locations/create" class="button">
                    Tạo địa điểm ngay
                  </a>
                </div>
                
                <p style="margin-top: 30px;">Chúng tôi rất vui mừng được đồng hành cùng bạn trên con đường phát triển kinh doanh du lịch cắm trại!</p>
                
                <p>Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
                
                <p style="margin-top: 20px;">
                  Trân trọng,<br>
                  <strong>Đội ngũ HipCamp</strong>
                </p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} HipCamp. All rights reserved.</p>
                <p>Email này được gửi tự động, vui lòng không phản hồi.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } else if (status === 'rejected' && previousStatus !== 'rejected') {
      // Email cho rejected
      await sendMail({
        to: host.gmail,
        subject: '❌ Thông báo về yêu cầu trở thành Host',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info-box { background: white; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 5px; }
              .tips-box { background: #dbeafe; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thông báo về yêu cầu Host</h1>
                <p style="font-size: 16px; margin: 10px 0;">Yêu cầu của bạn chưa được chấp nhận</p>
              </div>
              
              <div class="content">
                <p>Xin chào <strong>${host.name}</strong>,</p>
                
                <p>Cảm ơn bạn đã quan tâm và gửi yêu cầu trở thành Host trên nền tảng của chúng tôi.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #ef4444;">📋 Thông tin yêu cầu</h3>
                  <p><strong>Tên:</strong> ${host.name}</p>
                  <p><strong>Email:</strong> ${host.gmail}</p>
                  ${host.phone ? `<p><strong>Số điện thoại:</strong> ${host.phone}</p>` : ''}
                  <p><strong>Trạng thái:</strong> <span style="color: #ef4444; font-weight: bold;">Chưa được chấp nhận</span></p>
                </div>
                
                <p>Rất tiếc, yêu cầu của bạn <strong>chưa được chấp nhận</strong> vào lúc này. Điều này có thể do một trong những lý do sau:</p>
                
                <div class="tips-box">
                  <h3 style="margin-top: 0; color: #3b82f6;">💡 Các lý do thường gặp:</h3>
                  <ul>
                    <li>Thông tin cung cấp chưa đầy đủ hoặc chưa chính xác</li>
                    <li>Chưa đáp ứng các tiêu chuẩn về chất lượng dịch vụ</li>
                    <li>Địa điểm dự kiến chưa phù hợp với quy định</li>
                    <li>Cần bổ sung thêm giấy tờ hoặc chứng nhận</li>
                  </ul>
                </div>
                
                <h3>🔄 Bạn có thể làm gì tiếp theo?</h3>
                <ul>
                  <li>Kiểm tra và cập nhật đầy đủ thông tin cá nhân</li>
                  <li>Chuẩn bị các giấy tờ cần thiết (nếu có)</li>
                  <li>Liên hệ với chúng tôi để được tư vấn chi tiết</li>
                  <li>Gửi lại yêu cầu sau khi đã hoàn thiện hồ sơ</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.CLIENT_URL}/contact" class="button">
                    Liên hệ hỗ trợ
                  </a>
                </div>
                
                <p style="margin-top: 30px;">Chúng tôi rất mong được hợp tác với bạn trong tương lai. Đừng nản lòng và hãy thử lại sau khi đã hoàn thiện hồ sơ nhé!</p>
                
                <p style="margin-top: 20px;">
                  Trân trọng,<br>
                  <strong>Đội ngũ HipCamp</strong>
                </p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} HipCamp. All rights reserved.</p>
                <p>Nếu có thắc mắc, vui lòng liên hệ: support@hipcamp.vn</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    return ResponseUtil.success(res, null, 'Cập nhật trạng thái host thành công');
  });
} 
