"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mountain, MapPin } from "lucide-react";

import Divider from "@/components/ui/Divider";
import ErrorAlertWithAutoClose from "@/components/ui/ErrorAlertWithAutoClose";
import FloatingInput from "@/components/ui/FloatingInput";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { loginUser } from "@/store/slices/authSlice";
import { AppDispatch, RootState } from "@/store";
import BackgroundImage from "@/components/ui/BackgroundImage";
import logo from "@/assets/images/logo.jpg";
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
        localStorage.setItem("role", role);
        router.push(role === "admin" ? "/admin" : "/home");
      } else if (loginUser.rejected.match(resultAction)) {
        console.error("Login failed:", resultAction.payload);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Theme toggle top-right */}
        <BackgroundImage />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: INFO */}
          <div className="hidden md:flex flex-col justify-center gap-6 p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 shadow-lg border border-emerald-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-xl">
                <Mountain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Cắm Trại</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Khám phá thiên nhiên. Trải nghiệm ngoài trời.</p>
              </div>
            </div>

            <div className="text-gray-700 dark:text-gray-300 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-emerald-600 mt-1"><MapPin className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-medium dark:text-white">Địa điểm chọn lọc</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Các điểm cắm trại an toàn, view đẹp.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-amber-500 mt-1">🔥</div>
                <div>
                  <h4 className="font-medium dark:text-white">Hoạt động ngoài trời</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Leo núi, câu cá, picnic, team building.</p>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Đăng nhập để quản lý đặt tour, xem ưu đãi và lịch sử.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Image
                src={logo}
                alt="camp"
                width={320}
                height={200}
                className="rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* RIGHT: LOGIN FORM */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-emerald-100 dark:border-gray-700 p-8 shadow-2xl transition-colors duration-300">
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    Chào mừng trở lại
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Đăng nhập để tiếp tục trải nghiệm tour cắm trại
                  </p>
                </div>

                {error && <ErrorAlertWithAutoClose message={error} />}

                <div className="space-y-5">
                  <FloatingInput
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    label="Email"
                    required
                  />

                  <FloatingInput
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    label="Mật khẩu"
                    required
                    showPasswordToggle
                  />

                  <div className="flex items-center justify-between text-sm">
                    <Link href="/forgot-password" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                      Quên mật khẩu?
                    </Link>
                    <Link href="/register" className="text-gray-600 dark:text-gray-300 hover:underline">
                      Đăng ký
                    </Link>
                  </div>

                  <Divider text="hoặc" />

                  <GoogleLoginButton />

                  <button
                    type="submit"
                    disabled={!email || password.length < 6 || isLoading}
                    onClick={handleSubmit}
                    className="w-full mt-2 transform rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Đang đăng nhập...</span>
                      </div>
                    ) : (
                      "Đăng nhập"
                    )}
                  </button>

                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Bằng việc đăng nhập bạn đồng ý với{" "}
                    <Link href="/terms" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      Điều khoản sử dụng
                    </Link>.
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-center mt-4 text-xs text-gray-400 dark:text-gray-500">
                <span>© {new Date().getFullYear()} Tour Cắm Trại</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
