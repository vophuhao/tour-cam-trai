<div align="center">

# 🏕️ Tour Camping Platform

### Nền Tảng Đặt Địa Điểm Cắm Trại & Thương Mại Điện Tử

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-green?style=flat&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Tính năng](#-tính-năng-chính) •
[Công nghệ](#-công-nghệ-sử-dụng) •
[Cài đặt](#-cài-đặt) •
[Sử dụng](#-sử-dụng) •
[Đóng góp](#-đóng-góp)

</div>

---

## 📖 Giới thiệu

**Tour Camping Platform** là nền tảng marketplace toàn diện cho cộng đồng yêu thích cắm trại tại Việt Nam. Dự án kết hợp giữa đặt chỗ địa điểm cắm trại và thương mại điện tử sản phẩm camping, tạo nên một hệ sinh thái "tất cả trong một" cho người dùng.

### 🎯 Điểm nổi bật

- **Kiến trúc Property-Site 2 cấp** giống Hipcamp - phân biệt rõ ràng giữa khu đất (Property) và vị trí cắm trại cụ thể (Site)
- **Real-time messaging** với Socket.io cho chat hỗ trợ và tin nhắn trực tiếp
- **Hệ thống đánh giá kép** - đánh giá riêng cho property (location, value) và site (cleanliness, amenities)
- **Tích hợp thanh toán** PayOS hỗ trợ Momo, ZaloPay, chuyển khoản ngân hàng
- **Quản lý booking** với state workflow (pending → confirmed → completed)
- **Authentication mạnh mẽ** với JWT, Redis sessions, Google OAuth

---

## 👥 Sinh viên thực hiện

| Họ và tên | MSSV | Vai trò |
|-----------|------|---------|
| **Trần Tiến Đạt** | 22110308 | Full-stack Developer |
| **Võ Phú Hào** | 22110317 | Full-stack Developer |

---

## 🎯 Mục tiêu dự án

- ✅ Cung cấp nền tảng trực tuyến tập trung cho việc đặt địa điểm cắm trại
- ✅ Tích hợp thương mại điện tử cho các sản phẩm cắm trại
- ✅ Cho phép người dùng đăng ký vai trò Host và quản lý địa điểm
- ✅ Nâng cao trải nghiệm người dùng với giao diện hiện đại, responsive
- ✅ Xây dựng hệ thống real-time messaging và notifications
- ✅ Đảm bảo bảo mật với JWT authentication và Redis sessions

---

## 🚀 Tính năng chính

### 👤 Người dùng (User)

- 🔐 Đăng ký/đăng nhập (email/password + Google OAuth)
- 🔍 Tìm kiếm địa điểm cắm trại với filters (giá, tiện ích, hoạt động)
- 🗺️ Xem chi tiết property và các sites trong property
- 📅 Đặt chỗ với calendar availability và pricing breakdown
- ⭐ Đánh giá kép (property ratings + site ratings)
- 💬 Chat trực tiếp với host và admin support
- 🛒 Mua sản phẩm camping với giỏ hàng và thanh toán
- ❤️ Lưu yêu thích (wishlists)

### 🏠 Host

- ✍️ Đăng ký trở thành Host
- 📝 Tạo và quản lý Properties (khu đất)
- 🏕️ Thêm nhiều Sites trong mỗi Property (tent/RV/cabin)
- 📸 Upload hình ảnh qua Cloudinary
- 💰 Quản lý giá và availability calendar
- 📊 Theo dõi bookings và đánh giá
- 🔔 Nhận notifications real-time

### 👨‍💼 Admin

- 📊 Dashboard quản lý tổng quan
- 👥 Quản lý users, hosts, properties, sites
- 🛍️ Quản lý categories, products, tours
- 💬 Support chat với users
- 📈 Xem thống kê và báo cáo
- 🔧 Cấu hình hệ thống

---

## 🛠️ Công nghệ sử dụng

### 🎨 Frontend

| Công nghệ | Mục đích |
|-----------|----------|
| **Next.js 16** | React framework với App Router, SSR, Turbopack |
| **React 19** | UI library với Server Components |
| **TypeScript** | Type safety và developer experience |
| **TanStack Query v5** | Server state management, caching, mutations |
| **Zustand** | Client state management với localStorage persistence |
| **React Hook Form + Zod** | Form validation với type-safe schemas |
| **Tailwind CSS** | Utility-first CSS framework |
| **Shadcn/ui** | Re-usable component library |
| **Axios** | HTTP client với auto token refresh |
| **Socket.io Client** | Real-time messaging |

### ⚙️ Backend

| Công nghệ | Mục đích |
|-----------|----------|
| **Node.js + Express** | RESTful API server |
| **TypeScript** | Type-safe backend code |
| **MongoDB** | NoSQL database (17 models) |
| **Mongoose** | ODM với schema validation |
| **Redis** | Session storage, verification codes, rate limiting |
| **JWT** | Authentication với refresh tokens |
| **Socket.io** | Real-time messaging server |
| **Cloudinary** | Image upload và storage |
| **PayOS** | Payment gateway (Momo, ZaloPay, bank transfer) |
| **Zod** | Runtime validation schemas |
| **Nodemailer** | Email notifications |

### 🗂️ Kiến trúc

- **Monorepo** structure với `server/` và `web/`
- **Custom Dependency Injection** container
- **Centralized error handling** với ErrorFactory
- **Response utilities** cho consistent API responses
- **Middleware chain** cho authentication và authorization
- **2dsphere geospatial indexing** cho location-based search

---

## 📁 Cấu trúc dự án

```
tour-cam-trai/
├── server/                    # Backend Express + TypeScript
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Mongoose schemas (17 models)
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Authentication, error handling
│   │   ├── validators/        # Zod validation schemas
│   │   ├── di/                # Dependency injection container
│   │   ├── errors/            # Error factory và custom errors
│   │   ├── socket/            # Socket.io handlers
│   │   ├── scripts/           # Migration scripts
│   │   └── seeds/             # Database seeding
│   ├── API_DOCUMENTATION.md
│   ├── HIPCAMP_ARCHITECTURE.md
│   └── PROPERTY_MIGRATION_DESIGN.md
│
└── web/                       # Frontend Next.js 16
    ├── app/                   # Next.js App Router
    │   ├── (auth)/           # Auth routes (login, register)
    │   ├── (dashboard)/      # Admin dashboard
    │   ├── (main)/           # Main app routes
    │   └── admin/            # Admin pages
    ├── components/            # React components
    │   ├── ui/               # Shadcn/ui components
    │   ├── admin/            # Admin-specific components
    │   ├── property/         # Property components
    │   └── site/             # Site components
    ├── hooks/                 # Custom React hooks
    ├── lib/                   # Utilities, API client
    ├── store/                 # Zustand stores
    └── types/                 # TypeScript type definitions
```

---

## 💻 Cài đặt

### Yêu cầu hệ thống

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **MongoDB**: >= 7.x
- **Redis**: >= 7.x

### 1. Clone repository

```bash
git clone https://github.com/vophuhao/tour-cam-trai.git
cd tour-cam-trai
```

### 2. Cài đặt Backend

```bash
cd server
npm install
```

Tạo file `.env` trong thư mục `server/`:

```env
# Database
MONGO_URI=mongodb://localhost:27017/tour-camping
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# PayOS
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

# App
PORT=5000
NODE_ENV=development
```

### 3. Cài đặt Frontend

```bash
cd ../web
npm install
```

Tạo file `.env.local` trong thư mục `web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🎮 Sử dụng

### Development Mode

**Backend:**
```bash
cd server
npm run dev              # Start dev server với hot reload
npm run seed             # Seed database với sample data
npm run seed:hipcamp     # Seed campsite/booking data
```

**Frontend:**
```bash
cd web
npm run dev              # Start Next.js dev server (http://localhost:3000)
```

### Production Build

**Backend:**
```bash
cd server
npm run build            # Compile TypeScript
npm start                # Start production server
```

**Frontend:**
```bash
cd web
npm run build            # Build production bundle
npm start                # Start production server
```

### Các lệnh hữu ích

```bash
# Backend
npm run type-check       # Check TypeScript types
npm run lint:fix         # Auto-fix ESLint issues
npm run migrate:property-site  # Run Property-Site migration
npm run validate:migration     # Validate migration

# Frontend
npm run lint             # Run Next.js linting
```

---

## 🔑 API Endpoints (Tóm tắt)

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Đăng xuất

### Properties & Sites
- `GET /api/properties` - Danh sách properties (với filters)
- `POST /api/properties` - Tạo property (host only)
- `GET /api/properties/:id` - Chi tiết property
- `GET /api/properties/:id/sites` - Sites trong property
- `POST /api/sites` - Tạo site (host only)

### Bookings
- `POST /api/bookings` - Đặt chỗ
- `GET /api/bookings/my-bookings` - Bookings của user
- `PATCH /api/bookings/:id/status` - Cập nhật status

### Reviews
- `POST /api/reviews` - Tạo review
- `GET /api/reviews/property/:id` - Reviews của property

_Xem đầy đủ tại [API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)_

---

## 🗺️ Kiến trúc Property-Site

Hệ thống sử dụng kiến trúc 2 cấp giống Hipcamp:

```
Property (Khu đất/Tài sản)
  ├── Host, location, shared amenities/activities
  ├── Property-wide rules và policies
  ├── Aggregate stats từ tất cả sites
  │
  └── Multiple Sites (Vị trí cắm trại cụ thể)
       ├── Site A: Tent site - $30/night
       ├── Site B: RV spot với hookups - $50/night
       └── Site C: Cabin - $120/night
```

**Lưu ý quan trọng:**
- **Property** = khu đất của host (shared resources)
- **Site** = vị trí cắm trại riêng lẻ (bookable unit)
- Booking đặt **Site**, không phải Property
- Review gồm 2 phần: propertyRatings + siteRatings

_Chi tiết tại [HIPCAMP_ARCHITECTURE.md](server/HIPCAMP_ARCHITECTURE.md)_

---

## 🧪 Testing

```bash
# Backend
cd server
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

_Xem hướng dẫn đầy đủ tại [TESTING_GUIDE.md](TESTING_GUIDE.md)_

---

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Vui lòng làm theo các bước sau:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Coding Conventions

- Sử dụng TypeScript strict mode
- Follow ESLint rules đã cấu hình
- Sử dụng `@/` path aliases thay vì relative imports
- Backend: Luôn dùng `ErrorFactory` và `catchErrors` wrapper
- Frontend: Sử dụng React Hook Form + Zod cho forms
- Commit messages theo format: `type(scope): message`

---

## 📚 Tài liệu tham khảo

- [API Documentation](server/API_DOCUMENTATION.md) - Chi tiết về các API endpoints
- [Hipcamp Architecture](server/HIPCAMP_ARCHITECTURE.md) - Kiến trúc Property-Site
- [Migration Guide](server/MIGRATION_GUIDE.md) - Hướng dẫn migration
- [Redis Verification](server/REDIS_VERIFICATION.md) - Hệ thống xác thực Redis

---

## 🗺️ Roadmap

- [ ] Tích hợp diễn đàn cộng đồng camping
- [ ] Gợi ý địa điểm theo vị trí và nhu cầu người dùng (AI-powered)
- [ ] Gợi ý combo sản phẩm theo từng loại địa điểm
- [ ] Mobile app (React Native)
- [ ] Multi-language support (English, Vietnamese)
- [ ] Advanced analytics và reporting cho hosts
- [ ] Integration với Google Maps API cho better location search

---

## 📝 License

Dự án này được phân phối dưới giấy phép **MIT License**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 📞 Liên hệ

- **GitHub Repository**: [vophuhao/tour-cam-trai](https://github.com/vophuhao/tour-cam-trai)
- **Issues & Bug Reports**: [GitHub Issues](https://github.com/vophuhao/tour-cam-trai/issues)

---

## 🙏 Acknowledgments

- [Hipcamp](https://www.hipcamp.com/) - Inspiration cho kiến trúc Property-Site
- [Next.js](https://nextjs.org/) - React framework
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [TanStack Query](https://tanstack.com/query) - Server state management
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database

---

<div align="center">

**Được xây dựng với ❤️ bởi Trần Tiến Đạt & Võ Phú Hào**

Trường Đại học Sư phạm Kỹ thuật Thành phố Hồ Chí Minh

</div>
