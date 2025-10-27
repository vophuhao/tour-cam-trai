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
import { registerUser, resetRegistered } from "@/store/slices/authSlice";
import { AppDispatch, RootState } from "@/store";

const Register: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isRegistered } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = () => {
    dispatch(registerUser({ email, username, password, confirmPassword }) as any);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleConfirm = () => {
    dispatch(resetRegistered());
    router.push("/login");
  };

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) =>
    setter(e.target.value);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Theme toggle top-right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: INFO */}
          <div className="hidden md:flex flex-col justify-between p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 shadow-lg border border-emerald-100 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-600 text-white rounded-xl">
                  <Mountain className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Cắm Trại</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chuyến dã ngoại, trải nghiệm thiên nhiên.</p>
                </div>
              </div>

              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="text-emerald-600 mt-1"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-medium dark:text-white">Điểm đến chọn lọc</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nơi cắm trại an toàn, view đẹp, tiện nghi hợp lý.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-amber-500 mt-1">🔥</div>
                  <div>
                    <h4 className="font-medium dark:text-white">Hoạt động đa dạng</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Leo núi, lửa trại, câu cá, picnic.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Image src="/assets/camp-illustration.jpg" alt="camp" width={320} height={200} className="rounded-lg shadow-md" />
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">Đăng ký để nhận ưu đãi và lịch trình mới nhất.</div>
            </div>
          </div>

          {/* RIGHT: REGISTER FORM */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-emerald-100 dark:border-gray-700 p-8 shadow-2xl transition-colors duration-300">
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">Tạo tài khoản</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Tham gia cộng đồng yêu thiên nhiên và đặt tour dễ dàng.
                  </p>
                </div>

                {error && <ErrorAlertWithAutoClose message={error} />}

                <div className="space-y-4">
                  <FloatingInput type="email" id="email" value={email} onChange={handleChange(setEmail)} label="Email" required />

                  <FloatingInput type="text" id="username" value={username} onChange={handleChange(setUsername)} label="Tên hiển thị" required />

                  <FloatingInput type="password" id="password" value={password} onChange={handleChange(setPassword)} label="Mật khẩu" required showPasswordToggle />

                  <FloatingInput type="password" id="confirmPassword" value={confirmPassword} onChange={handleChange(setConfirmPassword)} onKeyDown={handleKeyDown} label="Xác nhận mật khẩu" required showPasswordToggle />

                  <div className="flex items-center justify-between text-sm">
                    <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Đã có tài khoản? Đăng nhập</Link>
                    <Link href="/terms" className="text-gray-500 dark:text-gray-400 hover:underline text-xs">Điều khoản & Chính sách</Link>
                  </div>

                  <Divider text="hoặc" />

                  <GoogleLoginButton />

                  <button
                    type="submit"
                    disabled={isLoading || !email || password.length < 6 || password !== confirmPassword}
                    onClick={handleSubmit}
                    className="w-full mt-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-md hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                  </button>

                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Bằng việc đăng ký, bạn đồng ý với <Link href="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">Chính sách bảo mật</Link>.
                  </div>
                </div>
              </div>

              <div className="text-center mt-4 text-xs text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} Tour Cắm Trại
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success popup */}
      {isRegistered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 text-center shadow-lg">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">Đăng ký thành công</h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">Vui lòng kiểm tra email để xác thực tài khoản.</p>
            <button onClick={handleConfirm} className="rounded-lg bg-emerald-600 px-6 py-2 text-white shadow hover:bg-emerald-700">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
