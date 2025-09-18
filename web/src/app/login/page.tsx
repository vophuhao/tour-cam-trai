"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";

import BackgroundImage from "@/components/ui/BackgroundImage";
import Divider from "@/components/ui/Divider";
import ErrorAlertWithAutoClose from "@/components/ui/ErrorAlertWithAutoClose";
import FloatingInput from "@/components/ui/FloatingInput";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import ThemeToggle from "@/components/ui/ThemeToggle"
import { loginUser } from "@/store/slices/authSlice";
import { AppDispatch, RootState } from "@/store";

const Login: React.FC = () => {
  
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async () => {
  try {
    const resultAction = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(resultAction)) {
      const role = resultAction.payload.data.role;
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/home");
      }
    } else if (loginUser.rejected.match(resultAction)) {
      console.error("Login failed:", resultAction.payload);
    }
  } catch (err: unknown) {
    console.error("Login failed:", err);
  }
};
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      {/* <BackgroundImage /> */}

      {/* Theme Toggle */}
       <ThemeToggle /> 

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-md">
          <div className="bg-card/20 border-border rounded-3xl border p-8 shadow-2xl backdrop-blur-sm">
            {/* Header */}
            <div className="mb-10 text-center">
              <h1 className="font-pacifico text-card-foreground text-4xl font-bold lg:text-5xl">
                Hi! It&apos;s Pixyy
              </h1>
            </div>

            {/* Error Message */}
            {error && <ErrorAlertWithAutoClose message={error} />}

            {/* Form */}
            <div className="space-y-6">
              <FloatingInput
                type="email"
                id="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                label="Email"
                required
              />

              <FloatingInput
                type="password"
                id="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                onKeyDown={handleKeyDown}
                label="Mật khẩu"
                required
                showPasswordToggle
              />

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="hover:text-accent-foreground text-foreground text-sm font-bold transition-colors duration-300"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Divider text="hoặc" />

              <GoogleLoginButton />

              <button
                type="submit"
                disabled={!email || password.length < 6 || isLoading}
                onClick={handleSubmit}
                className="w-full transform rounded-2xl bg-gradient-to-r from-pink-300 to-red-400 px-4 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-pink-400 hover:to-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-600"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </button>

              {/* Sign up link */}
              <div className="mt-6 text-center">
                <span className="text-muted-foreground text-sm">
                  Bạn chưa có tài khoản?{" "}
                  <Link
                    href="/register"
                    className="hover:text-accent-foreground text-foreground font-bold underline transition-colors duration-300"
                  >
                    Đăng ký
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
