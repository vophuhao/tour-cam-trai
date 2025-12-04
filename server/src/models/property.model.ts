import mongoose from "mongoose";

export interface PropertyDocument extends mongoose.Document {
  // ====== THUỘC SỞ HỮU ======
  host: mongoose.Types.ObjectId; // Chủ sở hữu property (host)

  // ====== THÔNG TIN CƠ BẢN ======
  name: string;           // Tên property
  slug: string;           // Dùng cho URL
  tagline?: string;       // Mô tả ngắn
  description: string;    // Mô tả chi tiết

  // ====== VỊ TRÍ – Property-level ======
  location: {
    address: string;
    city: string;        // Thành phố
    state: string;       // Tỉnh/thành
    country: string;
    zipCode?: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat] – dùng cho Map + filter khoảng cách
    };
    directions?: string;         // Hướng dẫn tới điểm cắm trại
    parkingInstructions?: string; // Hướng dẫn đỗ xe
  };

  // ====== THÔNG TIN DIỆN TÍCH/LOẠI ĐỊA HÌNH ======
  landSize?: {
    value: number;
    unit: "acres" | "hectares" | "square_meters";
  };
  terrain?: string; // Rừng, biển, núi, nông trại...
  propertyType: string; // Loại hình đất: private_land/farm/ranch/campground

  // ====== ẢNH PROPERTY ======
  photos: Array<{
    url: string;
    caption?: string;
    isCover: boolean;  // Ảnh bìa
    order: number;     // Thứ tự hiển thị
    uploadedAt?: Date;
  }>;

  // ====== TIỆN ÍCH DÙNG CHUNG ======
  sharedAmenities: {
    toilets?: {
      type: "none" | "portable" | "flush" | "vault" | "composting"; // Loại toilet
      count: number;
      isShared: boolean; // Dùng chung hay riêng
    };
    showers?: {
      type: "none" | "outdoor" | "indoor" | "hot" | "cold";
      count: number;
      isShared: boolean;
    };
    potableWater: boolean;                // Có nước uống được không
    waterSource?: "tap" | "well" | "stream" | "none";
    parkingType?: "drive_in" | "walk_in" | "nearby";
    parkingSpaces?: number;
    commonAreas?: string[];              // Khu dùng chung: bếp, bàn ăn, fire pit...
    laundry: boolean;                    // Giặt ủi
    wifi: boolean;
    cellService?: "excellent" | "good" | "limited" | "none"; // Sóng điện thoại
    electricityAvailable: boolean;       // Có điện không
  };

  // ====== HOẠT ĐỘNG VÀ ĐIỂM THAM QUAN GẦN ĐÓ ======
  activities: mongoose.Types.ObjectId[]; // Reference tới bảng Activity
  nearbyAttractions?: Array<{
    name: string;
    distance: number;   // km
    type: string;       // Loại địa điểm
  }>;

  // ====== NỘI QUY ======
  rules: Array<{
    text: string;        // Nội dung quy định
    category: "pets" | "noise" | "fire" | "general";
    order: number;
  }>;

  checkInInstructions?: string;
  checkOutInstructions?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    instructions?: string;
  };

  // ====== CHÍNH SÁCH HỦY ======
  cancellationPolicy: {
    type: "flexible" | "moderate" | "strict";
    description?: string;
    refundRules: Array<{
      daysBeforeCheckIn: number;   // Bao nhiêu ngày trước check-in
      refundPercentage: number;    // % hoàn tiền
    }>;
  };

  // ====== CHÍNH SÁCH THÚ CƯNG ======
  petPolicy: {
    allowed: boolean;
    maxPets?: number;
    fee?: number;
    rules?: string;
  };

  // ====== CHÍNH SÁCH TRẺ EM ======
  childrenPolicy: {
    allowed: boolean;
    ageRestrictions?: string;
  };

  // ====== THỐNG KÊ PROPERTY ======
  stats: {
    totalSites: number;        // Tổng số site trong property
    activeSites: number;       
    totalBookings: number;     
    totalReviews: number;
    averageRating: number;
    ratings: {
      location: number;
      communication: number;
      value: number;
    };
    responseRate?: number;     // Tỷ lệ phản hồi của host %
    responseTime?: number;     // Thời gian phản hồi (phút)
    viewCount: number;         // Lượt xem
  };

  // ====== TƯƠNG THÍCH RATING ======
  rating?: {
    average: number;
    count: number;
    breakdown: {
      location: number;
      communication: number;
      value: number;
    };
  };

  // ====== TRẠNG THÁI PROPERTY ======
  status: "active" | "inactive" | "pending_approval" | "suspended";
  isActive: boolean;
  isFeatured: boolean;
  featuredUntil?: Date;
  isVerified: boolean;         // Đã được kiểm duyệt chưa
  verifiedAt?: Date;

  // ====== CÀI ĐẶT BOOKING ======
  settings: {
    instantBookEnabled: boolean;          // Cho phép booking ngay lập tức
    requireApproval: boolean;             // Host phải duyệt?
    minimumAdvanceNotice: number;         // Báo trước tối thiểu (giờ)
    bookingWindow: number;                // Đặt trước tối đa (ngày)
    allowWholePropertyBooking: boolean;   // Cho thuê toàn bộ property
  };

  // ====== SEO ======
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  // ====== THỜI GIAN ======
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastBookedAt?: Date;

  // ====== METHOD ======
  activate(): Promise<PropertyDocument>;
  deactivate(): Promise<PropertyDocument>;
  incrementViews(): Promise<PropertyDocument>;
  updateStats(): Promise<PropertyDocument>;
}

// ========== SCHEMA – ĐÃ THÊM COMMENT TIẾNG VIỆT ==========
const propertySchema = new mongoose.Schema<PropertyDocument>(
  {
    // Chủ sở hữu property
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Thông tin cơ bản
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },

    // Vị trí
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
      country: { type: String, required: true, default: "Vietnam" },
      zipCode: { type: String },

      // Toạ độ bản đồ dùng để search theo bán kính
      coordinates: {
        type: { type: String, enum: ["Point"], required: true, default: "Point" },
        coordinates: { type: [Number], required: true },
      },

      directions: { type: String, maxlength: 1000 },
      parkingInstructions: { type: String, maxlength: 500 },
    },

    // Thông tin diện tích
    landSize: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ["acres", "hectares", "square_meters"] },
    },

    terrain: { type: String, maxlength: 100 },

    // Loại hình property
    propertyType: {
      type: String,
      required: true,
      index: true,
      enum: ["private_land", "farm", "ranch", "campground"],
    },

    // Ảnh property
    photos: [
      {
        url: { type: String, required: true },
        caption: { type: String, maxlength: 200 },
        isCover: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Tiện ích dùng chung
    sharedAmenities: {
      toilets: {
        type: { type: String, enum: ["none", "portable", "flush", "vault", "composting"] },
        count: { type: Number, min: 0, default: 0 },
        isShared: { type: Boolean, default: true },
      },
      showers: {
        type: { type: String, enum: ["none", "outdoor", "indoor", "hot", "cold"] },
        count: { type: Number, min: 0, default: 0 },
        isShared: { type: Boolean, default: true },
      },

      potableWater: { type: Boolean, default: false },
      waterSource: { type: String, enum: ["tap", "well", "stream", "none"] },
      parkingType: { type: String, enum: ["drive_in", "walk_in", "nearby"] },
      parkingSpaces: { type: Number, min: 0 },
      commonAreas: [{ type: String }],
      laundry: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      cellService: { type: String, enum: ["excellent", "good", "limited", "none"] },
      electricityAvailable: { type: Boolean, default: false },
    },

    // Hoạt động
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],

    // Địa điểm gần đó
    nearbyAttractions: [
      {
        name: { type: String, required: true },
        distance: { type: Number, required: true, min: 0 },
        type: { type: String, required: true },
      },
    ],

    // Nội quy
    rules: [
      {
        text: { type: String, required: true, maxlength: 500 },
        category: { type: String, enum: ["pets", "noise", "fire", "general"], default: "general" },
        order: { type: Number, default: 0 },
      },
    ],

    // Hướng dẫn check-in/out
    checkInInstructions: { type: String, maxlength: 2000 },
    checkOutInstructions: { type: String, maxlength: 2000 },

    // Liên hệ khẩn cấp
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      instructions: { type: String, maxlength: 500 },
    },

    // Chính sách huỷ
    cancellationPolicy: {
      type: {
        type: String,
        enum: ["flexible", "moderate", "strict"],
        default: "moderate",
      },
      description: { type: String, maxlength: 1000 },
      refundRules: [
        {
          daysBeforeCheckIn: { type: Number, required: true, min: 0 },
          refundPercentage: { type: Number, required: true, min: 0, max: 100 },
        },
      ],
    },

    // Chính sách thú cưng
    petPolicy: {
      allowed: { type: Boolean, default: false },
      maxPets: { type: Number, min: 0 },
      fee: { type: Number, min: 0 },
      rules: { type: String, maxlength: 500 },
    },

    // Chính sách trẻ em
    childrenPolicy: {
      allowed: { type: Boolean, default: true },
      ageRestrictions: { type: String, maxlength: 200 },
    },

    // Thống kê
    stats: {
      totalSites: { type: Number, default: 0, min: 0 },
      activeSites: { type: Number, default: 0, min: 0 },
      totalBookings: { type: Number, default: 0, min: 0 },
      totalReviews: { type: Number, default: 0, min: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      ratings: {
        location: { type: Number, default: 0, min: 0, max: 5 },
        communication: { type: Number, default: 0, min: 0, max: 5 },
        value: { type: Number, default: 0, min: 0, max: 5 },
      },
      responseRate: { type: Number, min: 0, max: 100 },
      responseTime: { type: Number, min: 0 },
      viewCount: { type: Number, default: 0, min: 0 },
    },

    // Rating tổng hợp
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
      breakdown: {
        location: { type: Number, default: 0, min: 0, max: 5 },
        communication: { type: Number, default: 0, min: 0, max: 5 },
        value: { type: Number, default: 0, min: 0, max: 5 },
      },
    },

    // Trạng thái
    status: {
      type: String,
      enum: ["active", "inactive", "pending_approval", "suspended"],
      default: "active",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    featuredUntil: { type: Date },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },

    // Cài đặt booking
    settings: {
      instantBookEnabled: { type: Boolean, default: false },
      requireApproval: { type: Boolean, default: true },
      minimumAdvanceNotice: { type: Number, default: 24, min: 0 },
      bookingWindow: { type: Number, default: 365, min: 1 },
      allowWholePropertyBooking: { type: Boolean, default: false },
    },

    // SEO
    seo: {
      metaTitle: { type: String, maxlength: 100 },
      metaDescription: { type: String, maxlength: 200 },
      keywords: [{ type: String }],
    },

    // Timestamps
    publishedAt: { type: Date },
    lastBookedAt: { type: Date },
  },
  { timestamps: true }
);

// ====== INDEXES ======
propertySchema.index({ host: 1, isActive: 1 });
propertySchema.index({ "location.coordinates": "2dsphere" });
propertySchema.index({ propertyType: 1, isActive: 1 });
propertySchema.index({ isFeatured: 1, "stats.averageRating": -1 });
propertySchema.index({ createdAt: -1 });

// Search text index
propertySchema.index({
  name: "text",
  description: "text",
  tagline: "text",
  "location.city": "text",
  "location.state": "text",
});

// ====== METHODS ======
propertySchema.methods.activate = async function () {
  this.status = "active";
  this.isActive = true;
  return this.save();
};

propertySchema.methods.deactivate = async function () {
  this.status = "inactive";
  this.isActive = false;
  return this.save();
};

propertySchema.methods.incrementViews = async function () {
  this.stats.viewCount += 1;
  return this.save();
};

propertySchema.methods.updateStats = async function () {
  // TODO: Gộp thống kê từ các site (sẽ làm sau)
  return this.save();
};

export const PropertyModel = mongoose.model<PropertyDocument>("Property", propertySchema);
