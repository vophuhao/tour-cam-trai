import mongoose from "mongoose";

export interface TourDocument extends mongoose.Document {
  code?: string;
  name: string;
  slug?: string;
  description: string;
  durationDays: number;
  durationNights: number;
  stayType: string;
  transportation: string;
  departurePoint: string;
  departureFrequency?: string;
  targetAudience?: string;

  itinerary: {
    day: number;
    title: string;
    activities: {
      timeFrom?: string;
      timeTo?: string;
      description: string;
    }[];
  }[];

  priceOptions: {
    name: string;
    price: number;
    minPeople?: number;
    maxPeople?: number;
  }[];

  servicesIncluded: {
    title: string;
    details: { value: string }[];
  }[];
  servicesExcluded: {
    title: string;
    details: { value: string }[];
  }[];
  notes: {
    title: string;
    details: { value: string }[];
  }[];

  images: string[];
  isActive: boolean;

  rating?: {
    average: number;
    count: number;
  };

  viewsCount?: number;
  soldCount?: number;
  createdAt: Date;
  updatedAt: Date;

  activate(): Promise<TourDocument>;
  deactivate(): Promise<TourDocument>;
}

const tourSchema = new mongoose.Schema<TourDocument>(
  {
    code: { type: String, trim: true, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, unique: true },
    description: { type: String, default: "" },

    durationDays: { type: Number, required: true, min: 1 },
    durationNights: { type: Number, required: true, min: 0 },
    stayType: { type: String, required: true },
    transportation: { type: String, required: true },
    departurePoint: { type: String, required: true },
    departureFrequency: { type: String, default: "" },
    targetAudience: { type: String, default: "" },

    itinerary: [
      {
        day: { type: Number, required: true },
        title: { type: String, required: true },
        activities: [
          {
            timeFrom: { type: String },
            timeTo: { type: String },
            description: { type: String, required: true },
          },
        ],
      },
    ],

    priceOptions: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        minPeople: { type: Number },
        maxPeople: { type: Number },
      },
    ],

    servicesIncluded: [
      {
        title: { type: String, required: true },
        details: [{ value: { type: String, required: true } }],
      },
    ],
    servicesExcluded: [
      {
        title: { type: String, required: true },
        details: [{ value: { type: String, required: true } }],
      },
    ],
    notes: [
      {
        title: { type: String, required: true },
        details: [{ value: { type: String, required: true } }],
      },
    ],

    images: { type: [String], default: [] },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    viewsCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
tourSchema.index({ name: 1 });
tourSchema.index({ departurePoint: 1, isActive: 1 });

// Methods
tourSchema.methods.activate = async function () {
  this.isActive = true;
  return this.save();
};
tourSchema.methods.deactivate = async function () {
  this.isActive = false;
  return this.save();
};

// Virtual populate
// tourSchema.virtual("bookings", {
//   ref: "Booking",
//   lonlField: "_id",
//   foreignField: "tour",
//   options: { sort: { createdAt: -1 } },
// });

tourSchema.set("toJSON", { virtuals: true });
tourSchema.set("toObject", { virtuals: true });

const TourModel = mongoose.model<TourDocument>("Tour", tourSchema);

export default TourModel;
