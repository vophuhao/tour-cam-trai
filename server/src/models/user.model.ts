import { compareValue, hashValue } from "@/utils/bcrypt";
import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  role: "admin" | "user";
  username: string;
  avatarUrl?: string;
  phoneNumber?: string;
  isVerified: boolean;
  provider: "local" | "google" | "google+local";
  googleId?: string;

  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function (this: UserDocument) {
        return this.provider === "local";
      },
    },

    // Instagram-like profile fields
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 30,
      match: /^[\p{L}\p{N}._\s]+$/u,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    avatarUrl: {
      type: String,
      default: "https://i.pinimg.com/736x/41/76/b9/4176b9b864c1947320764e82477c168f.jpg",
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    isVerified: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: ["local", "google", "google+local"],
      default: "local",
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },

    // Social counts
  },
  { timestamps: true }
);

// Index để tối ưu query
// userSchema.index({ email: 1 });
// userSchema.index({ googleId: 1 });

userSchema.pre("save", async function (next) {
  // Tự động tạo username từ email nếu chưa có username
  if (!this.username || this.username === "User") {
    this.username = this.email ? this.email.split("@")[0]! : "User";
  }

  if (!this.isModified("password") || !this.password) {
    return next();
  }

  this.password = await hashValue(this.password);
  return next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
