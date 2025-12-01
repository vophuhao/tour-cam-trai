import mongoose from "mongoose";

// Booking/Reservation model
export interface BookingDocument extends mongoose.Document {
  // Reference
  campsite: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId; // user đặt chỗ
  host: mongoose.Types.ObjectId; // chủ campsite

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
  paymentMethod?: "card" | "bank_transfer" | "cash" | "momo" | "zalopay";
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

  // Methods
  confirm(): Promise<BookingDocument>;
  cancel(userId: mongoose.Types.ObjectId, reason?: string): Promise<BookingDocument>;
  complete(): Promise<BookingDocument>;
  calculateTotal(): number;
}

const bookingSchema = new mongoose.Schema<BookingDocument>(
  {
    campsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campsite",
      required: true,
      index: true,
    },
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
      enum: ["card", "bank_transfer", "cash", "momo", "zalopay"],
    },
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
bookingSchema.index({ campsite: 1, checkIn: 1, checkOut: 1 });

// Prevent overlapping bookings
bookingSchema.index(
  { campsite: 1, checkIn: 1, checkOut: 1, status: 1 },
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

bookingSchema.methods.calculateTotal = function (this: BookingDocument): number {
  const { subtotal, cleaningFee, petFee, extraGuestFee, serviceFee, tax } = this.pricing;
  return subtotal + cleaningFee + petFee + extraGuestFee + serviceFee + tax;
};

export const BookingModel = mongoose.model<BookingDocument>("Booking", bookingSchema);
