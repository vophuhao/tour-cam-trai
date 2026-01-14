import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { z } from 'zod';

// Camping platform knowledge base
const CAMPING_KNOWLEDGE = `
# Kiến Thức Về Nền Tảng Camping Việt Nam

## KIẾN TRÚC HỆ THỐNG

### Tech Stack
- **Frontend**: Next.js 16 App Router, React 19, TanStack Query v5, Zustand, shadcn/ui
- **Backend**: Express + TypeScript, MongoDB, Redis, Socket.io
- **Auth**: JWT (httpOnly cookies), Redis sessions, Google OAuth
- **Media**: Cloudinary (admin-only uploads)
- **Payments**: PayOS (Momo, ZaloPay, bank transfer - Vietnam market)
- **Real-time**: Socket.io cho admin chat, direct messages

### Kiến Trúc Property-Site (2 CẤP - RẤT QUAN TRỌNG)
**Đây là điểm khác biệt chính của platform:**

PROPERTY (Khu đất/Tài sản của host)
  - Thông tin chung: location, host, property-wide amenities/activities
  - Multiple SITES (các vị trí cắm trại riêng lẻ):
    * Site A: Tent site, $30/night, basic amenities
    * Site B: RV spot with hookups, $50/night
    * Site C: Luxury cabin, $120/night
  - Aggregate stats từ tất cả sites

**Quy tắc:**
- **Property** = khu đất chứa nhiều sites (shared location, amenities)
- **Site** = đơn vị được đặt (bookable unit với giá riêng)
- Review có 2 phần: propertyRatings (location, value, communication) + siteRatings (cleanliness, accuracy, amenities)
- Booking đặt **Site**, KHÔNG đặt Property

## Quy Trình Đặt Chỗ
1. **Tìm kiếm**: Tìm property theo địa điểm (state, city) hoặc tọa độ (lat, lng, radius)
2. **Chọn Site**: Xem các sites có sẵn trong property, chọn loại phù hợp
3. **Chọn ngày**: Check-in/Check-out, số lượng khách, trẻ em, pets
4. **Thanh toán**: Qua PayOS (Momo, ZaloPay, chuyển khoản ngân hàng)
5. **Xác nhận**: Nhận email xác nhận booking

## Loại Hình Camping
1. **Tent** (Lều): 
   - Giá: 200k-500k/đêm
   - Phù hợp: Camping truyền thống, nhóm bạn trẻ
   - Tiện nghi cơ bản: Khu vực cắm lều, nhà vệ sinh chung

2. **RV** (Recreational Vehicle):
   - Giá: 500k-1tr/đêm
   - Phù hợp: Gia đình có xe cắm trại/RV
   - Tiện nghi: Hookups (điện, nước), bãi đỗ xe rộng

3. **Glamping** (Glamorous Camping):
   - Giá: 1tr-3tr/đêm
   - Phù hợp: Gia đình, couples muốn thoải mái
   - Tiện nghi: Giường, điều hòa, phòng tắm riêng, nội thất đẹp

4. **Cabin** (Nhà gỗ):
   - Giá: 1.5tr-5tr/đêm
   - Phù hợp: Nhóm lớn, gia đình nhiều thế hệ
   - Tiện nghi: Nhà bếp, nhiều phòng ngủ, BBQ riêng

## Chính Sách Hủy & Hoàn Tiền
- **Trước 48 giờ**: Hủy miễn phí, hoàn 100%
- **24-48 giờ trước**: Phí hủy 50% tổng tiền
- **Trong 24 giờ**: Không hoàn tiền
- **Host hủy**: Hoàn 100% + voucher bồi thường

## Thanh Toán (PayOS)
- Momo: Thanh toán qua ví MoMo
- ZaloPay: Thanh toán qua ví ZaloPay
- Chuyển khoản: Chuyển khoản ngân hàng (VietQR)
- Bảo mật: PCI DSS compliant, mã hóa end-to-end

## Review & Ratings (Sau khi hoàn thành)
Chỉ review sau khi booking status = "completed"

**Property Ratings** (đánh giá khu đất):
- Location (1-5⭐): Vị trí có đẹp không
- Communication (1-5⭐): Host có thân thiện, phản hồi nhanh không
- Value (1-5⭐): Giá có xứng đáng không

**Site Ratings** (đánh giá vị trí cụ thể):
- Cleanliness (1-5⭐): Vệ sinh sạch sẽ
- Accuracy (1-5⭐): Đúng như mô tả
- Amenities (1-5⭐): Tiện nghi đầy đủ

## Địa Điểm Phổ Biến
- Sapa (Lào Cai): View núi, khí hậu mát mẻ
- Đà Lạt (Lâm Đồng): Nhiều glamping, cabin
- Mù Cang Chải (Yên Bái): Ruộng bậc thang
- Phú Quốc (Kiên Giang): Camping biển
- Ba Vì (Hà Nội): Gần nội thành

## TÍNH NĂNG CHÍNH

### Tìm Kiếm & Khám Phá
- **Geospatial Search**: Tìm theo tọa độ (lat, lng, radius) hoặc địa điểm (city, state)
- **Filters**: Giá, loại hình (tent/rv/glamping/cabin), amenities, pets allowed
- **Map View**: Hiển thị properties trên bản đồ tương tác
- **Favorites**: Lưu properties yêu thích vào wishlist

### Booking Workflow
1. **Search** -> Tìm property theo location/filters
2. **Browse** -> Xem các sites có sẵn trong property
3. **Select** -> Chọn site + dates (check-in/out)
4. **Review** -> Xem pricing breakdown (base price + fees)
5. **Payment** -> Thanh toán qua PayOS (Momo/ZaloPay/Bank)
6. **Confirm** -> Nhận email xác nhận + booking details

Booking Status Flow: pending -> confirmed -> completed (hoặc cancelled)

### Review System (Post-Booking Only)
Chỉ review sau khi booking status = completed

**Property Ratings** (đánh giá khu đất chung):
- Location (1-5⭐): Vị trí đẹp, thuận tiện
- Communication (1-5⭐): Host phản hồi nhanh, thân thiện
- Value (1-5⭐): Giá cả xứng đáng

**Site Ratings** (đánh giá vị trí cụ thể):
- Cleanliness (1-5⭐): Vệ sinh sạch sẽ
- Accuracy (1-5⭐): Đúng như mô tả
- Amenities (1-5⭐): Tiện nghi đầy đủ

### User Roles
- **User**: Browse, book, review
- **Host**: Manage properties/sites, respond to bookings
- **Admin**: Full CRUD, manage users, moderate reviews

### Real-time Features
- **Socket.io Messaging**: Direct messages giữa users
- **Admin Support Chat**: Real-time support 24/7
- **Booking Notifications**: Real-time updates về booking status

## QUEN THUỘC VỚI NGƯỜI DÙNG

### Địa Điểm Phổ Biến Tại Việt Nam
- **Sapa (Lào Cai)**: View núi, khí hậu mát mẻ, trekking
- **Đà Lạt (Lâm Đồng)**: Nhiều glamping/cabin cao cấp, thời tiết quanh năm
- **Mù Cang Chải (Yên Bái)**: Ruộng bậc thang, mùa lúa chín đẹp nhất
- **Phú Quốc (Kiên Giang)**: Camping biển, hoàng hôn tuyệt đẹp
- **Ba Vì (Hà Nội)**: Gần nội thành, phù hợp weekend trips

### Migration Notes (Cho Host/Admin)
Nếu host hỏi về migration từ Campsite -> Property-Site:
- Đã có migration script tự động (npm run migrate:property-site)
- Campsite cũ -> Property mới (1:1 mapping)
- Mỗi Campsite cũ tạo 1 default Site trong Property mới
- Data integrity được validate qua npm run validate:migration
- Có rollback script nếu cần (npm run migrate:rollback)

## CÂU HỎI THƯỜNG GẶP

Q: Có thể mang theo thú cưng không?
A: Tùy property/site. Tìm kiếm với filter "pets allowed" để xem các nơi chấp nhận pets 🐕

Q: Có wifi không?
A: Xem amenities của từng site. Nhiều nơi có wifi, đặc biệt glamping/cabin

Q: Cần mang gì?
A: 
- **Tent sites**: Lều, túi ngủ, đèn pin, đồ nấu ăn
- **RV sites**: Hookup cables (điện/nước), waste disposal supplies
- **Glamping/Cabin**: Chỉ cần đồ dùng cá nhân, đã có đầy đủ tiện nghi

Q: An toàn không?
A: ✅ Tất cả host đã xác minh. Property có reviews từ khách trước. Admin moderate 24/7

Q: Làm gì nếu gặp vấn đề?
A: Liên hệ support qua:
- Chatbot này (AI trả lời ngay)
- Direct message đến admin (real-time)
- Hotline 24/7 (check footer website)

Q: Thanh toán như thế nào?
A: PayOS hỗ trợ Momo, ZaloPay, chuyển khoản ngân hàng (VietQR). An toàn 100%, PCI DSS compliant

Q: Hủy đặt chỗ có được hoàn tiền không?
A: 
- Trước 48h: Hoàn 100% ✅
- 24-48h: Hoàn 50% ⚠️
- Trong 24h: Không hoàn tiền ❌
- Host hủy: Hoàn 100% + voucher bồi thường 💰
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get base URL from request headers or env
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const result = streamText({
      model: google('gemini-2.5-flash'), // Free tier: 15 requests/min, 1M tokens/day
      system: `Bạn là AI assistant chuyên nghiệp hỗ trợ khách hàng cho nền tảng đặt chỗ camping Việt Nam.

${CAMPING_KNOWLEDGE}

NHIỆM VỤ CỦA BẠN:
1. Trả lời câu hỏi về camping, đặt chỗ, giá cả, chính sách
2. Giúp khách tìm property/site phù hợp bằng tool searchProperties
3. Hướng dẫn quy trình đặt chỗ, thanh toán, hủy booking
4. Giải đáp thắc mắc về kiến trúc Property-Site, review system, amenities
5. Gợi ý địa điểm camping dựa vào sở thích và budget

PHONG CÁCH:
- Thân thiện, nhiệt tình nhưng chuyên nghiệp
- Ngắn gọn, súc tích (2-4 câu) - KHÔNG quá dài
- Sử dụng emoji phù hợp 🏕️⛺🌲🔥⭐
- Luôn dựa vào kiến thức đã cho
- Nếu không biết, khuyến khích liên hệ support 24/7
- **KHI TRẢ VỀ KẾT QUẢ TÌM KIẾM**: Format mỗi property như sau:
  * Tên property có LINK clickable (markdown format)
  * Hiển thị địa điểm, giá, số sites, rating
  * Example: **[Tên Property](url)** - Địa điểm | 💰 Giá từ XXXk/đêm | ⛺ X sites | ⭐ X.X (Y reviews)

QUY TẮC SỬ DỤNG TOOLS:
- **searchProperties**: Khi khách hỏi "tìm camping ở...", "địa điểm nào...", "muốn đi camping...", "chỗ cắm trại ở..."
  - accommodationType PHẢI là: tent, rv, glamping, cabin (viết THƯỜNG)
  - Nếu khách nói "Lều" → dùng "tent", "Nhà gỗ" → "cabin", "Camping sang" → "glamping"
  - location: tên thành phố/tỉnh (VD: "Sapa", "Đà Lạt", "Bảo Lộc")
  - Tool trả về url cho mỗi property - LUÔN format thành link clickable
- **checkAvailability**: Khi khách hỏi về availability của site cụ thể

LƯU Ý QUAN TRỌNG:
- Giá cả từ tool là ước tính, xem chi tiết trên từng site
- Luôn khuyến khích xem review trước khi đặt
- Nhắc nhở chính sách hủy miễn phí trước 48h
- Nhấn mạnh Property-Site architecture khi khách hỏi "đặt chỗ như thế nào"`,

      temperature: 0.7, // Balanced creativity and consistency

      messages,

      // Tool calling - tìm kiếm properties thật từ API
      tools: {
        searchProperties: {
          description:
            'Tìm kiếm camping properties theo địa điểm hoặc tọa độ. Sử dụng khi user hỏi về tìm chỗ cắm trại, địa điểm camping. Accommodation types: tent (lều), rv (xe cắm trại), glamping (camping sang trọng), cabin (nhà gỗ)',
          parameters: z.object({
            location: z
              .string()
              .optional()
              .describe('Tên địa điểm (VD: Đà Lạt, Sapa, Phú Quốc, Bảo Lộc)'),
            accommodationType: z
              .preprocess(
                val => (typeof val === 'string' ? val.toLowerCase() : val),
                z.enum(['tent', 'rv', 'glamping', 'cabin']),
              )
              .optional()
              .describe(
                'Loại hình camping: tent, rv, glamping, cabin (PHẢI viết thường)',
              ),
            minPrice: z.number().optional().describe('Giá tối thiểu (VNĐ)'),
            maxPrice: z.number().optional().describe('Giá tối đa (VNĐ)'),
          }),
          execute: async ({
            location,
            accommodationType,
            minPrice,
            maxPrice,
          }) => {
            try {
              const params = new URLSearchParams();

              // Sử dụng cả 'search' param để tìm text trong name/description
              if (location) {
                params.append('search', location);
                // Also filter by city to be more precise
                params.append('city', location);
              }

              if (accommodationType)
                params.append('campingStyle', accommodationType);
              if (minPrice) params.append('minPrice', minPrice.toString());
              if (maxPrice) params.append('maxPrice', maxPrice.toString());

              // Tăng limit lên 10 để tìm đủ kết quả
              params.append('limit', '10');
              params.append('page', '1');

              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/properties/search?${params}`,
                {
                  headers: { 'Content-Type': 'application/json' },
                },
              );

              if (!response.ok) {
                return {
                  properties: [],
                  total: 0,
                  message: 'Không tìm thấy property phù hợp',
                };
              }

              const data = await response.json();
              const properties = data.data || [];
              const total = data.pagination?.total || properties.length;

              return {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                properties: properties.map((p: any) => ({
                  name: p.name,
                  location: `${p.location?.city}, ${p.location?.state}`,
                  minPrice: p.minPrice,
                  totalSites: p.stats?.totalSites || 0,
                  rating: p.rating?.average || 0,
                  reviewCount: p.rating?.count || 0,
                  slug: p.slug,
                  url: `${baseUrl}/land/${p.slug}`,
                })),
                total,
                message:
                  properties.length > 0
                    ? `Tìm thấy ${total} property${total > 1 ? 's' : ''} phù hợp`
                    : 'Không tìm thấy properties phù hợp. Thử tìm kiếm với từ khóa khác hoặc mở rộng khu vực tìm kiếm.',
              };
            } catch (error) {
              console.error('Error searching properties:', error);
              return {
                properties: [],
                total: 0,
                message: 'Lỗi khi tìm kiếm, vui lòng thử lại',
              };
            }
          },
        },

        checkAvailability: {
          description: 'Kiểm tra availability của site trong khoảng thời gian',
          parameters: z.object({
            siteId: z.string().describe('ID của site cần kiểm tra'),
            checkIn: z.string().describe('Ngày check-in (YYYY-MM-DD)'),
            checkOut: z.string().describe('Ngày check-out (YYYY-MM-DD)'),
          }),
          execute: async ({ siteId, checkIn, checkOut }) => {
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/sites/${siteId}/availability?checkIn=${checkIn}&checkOut=${checkOut}`,
                {
                  headers: { 'Content-Type': 'application/json' },
                },
              );

              if (!response.ok) {
                return {
                  available: false,
                  message: 'Không thể kiểm tra availability',
                };
              }

              const data = await response.json();
              return {
                available: data.data?.available || false,
                message: data.data?.available
                  ? 'Site còn trống trong thời gian này'
                  : 'Site đã được đặt',
                price: data.data?.totalPrice || 0,
              };
            } catch (error) {
              console.error('Error checking availability:', error);
              return {
                available: false,
                message: 'Lỗi khi kiểm tra, vui lòng thử lại',
              };
            }
          },
        },
      },

      maxSteps: 5, // Limit multi-step tool calls
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error: unknown) => {
        console.error('Stream error:', error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('API key')) {
          return 'Lỗi xác thực API key. Vui lòng kiểm tra lại cấu hình.';
        }
        if (errorMessage.includes('quota')) {
          return 'Đã vượt giới hạn sử dụng API. Vui lòng thử lại sau.';
        }
        return 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.';
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Đã xảy ra lỗi, vui lòng thử lại' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
