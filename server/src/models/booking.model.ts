import mongoose from "mongoose";

// Booking/Reservation model
export interface BookingDocument extends mongoose.Document {
  // Reference
  code?: string; // mã đặt chỗ
  property: mongoose.Types.ObjectId; // Reference to Property
  site: mongoose.Types.ObjectId; // Reference to Site (specific site booked)
  guest: mongoose.Types.ObjectId; // user đặt chỗ
  host: mongoose.Types.ObjectId; // chủ property

  // Booking Details
  checkIn: Date;
  checkOut: Date;
  nights: number;

  // Guest Info
  numberOfGuests: number;
  numberOfPets?: number;
  numberOfVehicles?: number;

  // Pricing Breakdown
  pricing: {
    basePrice: number; // giá cơ bản
    totalNights: number;
    subtotal: number; // basePrice * nights
    cleaningFee: number;
    petFee: number;
    extraGuestFee: number;
    serviceFee: number; // phí dịch vụ platform
    tax: number; // thuế
    total: number; // tổng cuối
  };

  // Status
  status: "pending" | "confirmed" | "cancelled" | "completed" | "refunded";

  // Payment
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentMethod?: "card";
  transactionId?: string;
  paidAt?: Date;

  // Communication
  guestMessage?: string; // lời nhắn của khách
  hostMessage?: string; // phản hồi của host

  // Cancellation
  cancelledBy?: mongoose.Types.ObjectId; // user hủy
  cancelledAt?: Date;
  cancellationReason?: string;
  refundAmount?: number;

  // Review
  reviewed: boolean;
  review?: mongoose.Types.ObjectId; // ref Review

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  payOSOrderCode?: Number;
  payOSCheckoutUrl?: String;

  // Methods
  confirm(): Promise<BookingDocument>;
  cancel(userId: mongoose.Types.ObjectId, reason?: string): Promise<BookingDocument>;
  complete(): Promise<BookingDocument>;
  calculateTotal(): Promise<BookingDocument>;
}

const bookingSchema = new mongoose.Schema<BookingDocument>(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },
    code: { type: String, index: true, unique: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    checkIn: { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },
    nights: { type: Number, required: true, min: 1 },

    numberOfGuests: { type: Number, required: true, min: 1 },
    numberOfPets: { type: Number, min: 0, default: 0 },
    numberOfVehicles: { type: Number, min: 0, default: 0 },

    pricing: {
      basePrice: { type: Number, required: true, min: 0 },
      totalNights: { type: Number, required: true, min: 1 },
      subtotal: { type: Number, required: true, min: 0 },
      cleaningFee: { type: Number, default: 0, min: 0 },
      petFee: { type: Number, default: 0, min: 0 },
      extraGuestFee: { type: Number, default: 0, min: 0 },
      serviceFee: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "refunded"],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card"],
    },
    payOSOrderCode: { type: Number },
    payOSCheckoutUrl: { type: String },

    transactionId: { type: String, index: true },
    paidAt: { type: Date },

    guestMessage: { type: String, maxlength: 1000 },
    hostMessage: { type: String, maxlength: 1000 },

    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, maxlength: 500 },
    refundAmount: { type: Number, min: 0 },

    reviewed: { type: Boolean, default: false },
    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ status: 1, checkIn: 1 });
bookingSchema.index({ status: 1, checkOut: 1 });
bookingSchema.index({ guest: 1, status: 1, createdAt: -1 });
bookingSchema.index({ host: 1, status: 1, createdAt: -1 });
bookingSchema.index({ site: 1, checkIn: 1, checkOut: 1 });

// Prevent overlapping bookings
bookingSchema.index(
  { site: 1, checkIn: 1, checkOut: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed"] },
    },
  }
);

// Methods
bookingSchema.methods.confirm = async function (this: BookingDocument) {
  this.status = "confirmed";
  this.paymentStatus = "paid";
  this.paidAt = new Date();
  return this.save();
};

bookingSchema.methods.cancel = async function (
  this: BookingDocument,
  userId: mongoose.Types.ObjectId,
  reason?: string
) {
  this.status = "cancelled";
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  if (reason) this.cancellationReason = reason;
  return this.save();
};

bookingSchema.methods.complete = async function (this: BookingDocument) {
  this.status = "completed";
  return this.save();
};

bookingSchema.methods.calculateTotal = async function (
  this: BookingDocument
): Promise<BookingDocument> {
  const { subtotal, cleaningFee, petFee, extraGuestFee, serviceFee, tax } = this.pricing;
  this.pricing.total = subtotal + cleaningFee + petFee + extraGuestFee + serviceFee + tax;
  return this.save();
};

export const BookingModel = mongoose.model<BookingDocument>("Booking", bookingSchema);
