import { MONGO_URI } from "@/constants/env";
import { CategoryModel, ProductModel, TourModel } from "@/models";
import "dotenv/config";
import mongoose from "mongoose";

const categories = [
  { name: "Lều trại", isActive: true },
  { name: "Túi ngủ", isActive: true },
  { name: "Ba lô", isActive: true },
  { name: "Dụng cụ nấu ăn", isActive: true },
  { name: "Quần áo", isActive: true },
  { name: "Phụ kiện", isActive: true },
  { name: "Tour miền Bắc", isActive: true },
  { name: "Tour miền Trung", isActive: true },
  { name: "Tour miền Nam", isActive: true },
];

const tourLocations = [
  "Sapa",
  "Đà Lạt",
  "Phú Quốc",
  "Nha Trang",
  "Hạ Long",
  "Hội An",
  "Phan Thiết",
  "Mù Cang Chải",
];

const tourImages = [
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
  "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5",
  "https://images.unsplash.com/photo-1510312305653-8ed496efae75",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
];

const productImages = [
  "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
  "https://images.unsplash.com/photo-1445308394109-4ec2920981b1",
  "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b",
  "https://images.unsplash.com/photo-1622260614153-03223fb72052",
  "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084",
];

async function seedDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await CategoryModel.deleteMany({});
    await TourModel.deleteMany({});
    await ProductModel.deleteMany({});

    // Seed categories
    console.log("📦 Seeding categories...");
    const createdCategories = await CategoryModel.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Get category IDs
    const tourCategories = createdCategories.filter((cat) => cat.name.includes("Tour"));
    const productCategories = createdCategories.filter((cat) => !cat.name.includes("Tour"));

    // Seed 15 tours
    console.log("🎯 Seeding 15 tours...");
    const tours = [];
    const durations = [2, 3, 4, 5, 7];
    for (let i = 1; i <= 15; i++) {
      const location = tourLocations[(i - 1) % tourLocations.length] as string;
      const duration = durations[i % 5] as number;
      const categoryIndex = i % tourCategories.length;
      const category = tourCategories[categoryIndex];

      if (!category || !duration || !location) continue;

      tours.push({
        code: `TOUR${String(i).padStart(3, "0")}`,
        name: `Tour ${location} ${duration}N${duration - 1}Đ - Khám phá thiên nhiên ${i}`,
        slug: `tour-${location.toLowerCase().replace(/\s+/g, "-")}-${duration}n${duration - 1}d-kham-pha-${i}`,
        description: `Chuyến đi khám phá ${location} với ${duration} ngày ${duration - 1} đêm, trải nghiệm văn hóa địa phương và cảnh quan thiên nhiên tuyệt đẹp.`,
        durationDays: duration - 1,
        durationNights: duration,
        stayType: i % 2 === 0 ? "Hotel 3 sao" : "Homestay",
        transportation: i % 3 === 0 ? "Máy bay + Xe ô tô" : "Xe ô tô",
        departurePoint: i % 2 === 0 ? "Hà Nội" : "TP. Hồ Chí Minh",
        departureFrequency: "Hàng tuần",
        targetAudience: "Phù hợp cho mọi lứa tuổi",
        itinerary: Array.from({ length: duration }, (_, day) => ({
          day: day + 1,
          title: `Ngày ${day + 1}: ${day === 0 ? "Khởi hành" : day === duration - 1 ? "Trở về" : "Khám phá"}`,
          activities: [
            {
              timeFrom: "08:00",
              timeTo: "12:00",
              description: `Hoạt động buổi sáng ngày ${day + 1}`,
            },
            {
              timeFrom: "14:00",
              timeTo: "18:00",
              description: `Hoạt động buổi chiều ngày ${day + 1}`,
            },
          ],
        })),
        priceOptions: [
          {
            name: "Người lớn",
            price: 2000000 + i * 500000,
            minPeople: 1,
          },
          {
            name: "Trẻ em (6-12 tuổi)",
            price: 1500000 + i * 300000,
            minPeople: 1,
          },
        ],
        servicesIncluded: [
          {
            title: "Dịch vụ bao gồm",
            details: [
              { value: "Xe đưa đón tận nơi" },
              { value: "Khách sạn tiêu chuẩn" },
              { value: "Ăn uống theo chương trình" },
              { value: "Vé tham quan" },
              { value: "Hướng dẫn viên chuyên nghiệp" },
            ],
          },
        ],
        servicesExcluded: [
          {
            title: "Không bao gồm",
            details: [
              { value: "Chi phí cá nhân" },
              { value: "Đồ uống ngoài bữa ăn" },
              { value: "Bảo hiểm du lịch" },
            ],
          },
        ],
        notes: [
          {
            title: "Lưu ý",
            details: [
              { value: "Mang theo CMND/CCCD" },
              { value: "Chuẩn bị quần áo phù hợp thời tiết" },
              { value: "Thuốc men cá nhân" },
            ],
          },
        ],
        images: [
          tourImages[i % tourImages.length],
          tourImages[(i + 1) % tourImages.length],
          tourImages[(i + 2) % tourImages.length],
        ],
        isActive: true,
        rating: {
          average: 4 + Math.random(),
          count: Math.floor(Math.random() * 50) + 10,
        },
        category: category._id,
      });
    }

    const createdTours = await TourModel.insertMany(tours);
    console.log(`✅ Created ${createdTours.length} tours`);

    // Seed 15 products
    console.log("🛒 Seeding 15 products...");
    const products = [];
    const productNames = [
      "Lều 2 người Coleman",
      "Túi ngủ The North Face -10°C",
      "Ba lô leo núi Osprey 50L",
      "Bếp gas mini Kovea",
      "Áo khoác chống thấm Patagonia",
      "Giày trekking Salomon",
      "Đèn pin LED siêu sáng",
      "Bình nước giữ nhiệt Stanley",
      "Lều 4 người NatureHike",
      "Túi ngủ mùa hè Sea to Summit",
      "Ba lô du lịch Deuter 40L",
      "Bộ nồi cắm trại MSR",
      "Quần trekking Columbia",
      "Dây leo núi chuyên dụng",
      "Mũ chống nắng UV 50+",
    ];

    for (let i = 1; i <= 15; i++) {
      const categoryIndex = i % productCategories.length;
      const category = productCategories[categoryIndex];
      const basePrice = 500000 + i * 300000;
      const deal = i % 3 === 0 ? Math.floor(Math.random() * 30) + 10 : 0;

      if (!category) continue;

      const productName = productNames[i - 1] as string;

      products.push({
        name: productName,
        slug: `${productName.toLowerCase().replace(/\s+/g, "-").replace(/[°+]/g, "")}-${i}`,
        description: `Sản phẩm chất lượng cao cho các chuyến cắm trại và leo núi. ${productName} được thiết kế bền bỉ, phù hợp cho mọi điều kiện thời tiết.`,
        price: basePrice,
        deal: deal,
        stock: Math.floor(Math.random() * 100) + 20,
        images: [
          productImages[i % productImages.length],
          productImages[(i + 1) % productImages.length],
        ],
        category: category._id,
        specifications: [
          { label: "Chất liệu", value: i % 2 === 0 ? "Nylon" : "Polyester" },
          { label: "Trọng lượng", value: `${500 + i * 100}g` },
          {
            label: "Xuất xứ",
            value: i % 3 === 0 ? "USA" : i % 3 === 1 ? "Vietnam" : "China",
          },
        ],
        variants:
          i % 4 === 0
            ? [
                {
                  size: "S",
                  expandedSize: "200x100x80cm",
                  foldedSize: "40x20cm",
                  loadCapacity: "2kg",
                  weight: "1.5kg",
                },
                {
                  size: "M",
                  expandedSize: "220x120x90cm",
                  foldedSize: "45x25cm",
                  loadCapacity: "3kg",
                  weight: "2kg",
                },
              ]
            : [],
        details: [
          {
            title: "Thông số kỹ thuật",
            items: [{ label: "Kích thước: Tùy theo phiên bản" }, { label: "Màu sắc: Đa dạng" }],
          },
        ],
        guide: [
          "Kiểm tra sản phẩm trước khi sử dụng",
          "Làm sạch sau mỗi lần dùng",
          "Bảo quản nơi khô ráo",
        ],
        warnings: ["Tránh xa nguồn lửa", "Không để trẻ em sử dụng không có người lớn giám sát"],
        isActive: true,
      });
    }

    const createdProducts = await ProductModel.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log("\n🎉 Database seeded successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Tours: ${createdTours.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

seedDatabase();
