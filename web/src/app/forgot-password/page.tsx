"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { sendPasswordResetEmail } from "@/lib/api";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ErrorAlertWithAutoClose from "@/components/ui/ErrorAlertWithAutoClose";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");

  const mutation = useMutation<any, Error, string>({
    mutationFn: sendPasswordResetEmail,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) mutation.mutate(email);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 lg:px-12">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: Info / Illustration */}
          <div className="hidden md:flex flex-col justify-center gap-6 p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 shadow-lg border border-emerald-100 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quên mật khẩu</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Nhập email đã đăng ký, chúng tôi sẽ gửi link để đặt lại mật khẩu.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li>• Hướng dẫn chi tiết gửi đến inbox</li>
                <li>• Kiểm tra cả thư mục Spam nếu không thấy</li>
                <li>• Cần trợ giúp? Liên hệ support</li>
              </ul>
            </div>

            <div className="mt-6">
              <img
                src="/assets/camp-illustration.jpg"
                alt="camp"
                className="w-full rounded-lg shadow-sm"
              />
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-emerald-100 dark:border-gray-700 p-8 shadow-2xl transition-colors duration-300">
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">Lấy lại mật khẩu</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Nhập email để nhận liên kết đặt lại mật khẩu.
                  </p>
                </div>

                {mutation.isError && (
                  <ErrorAlertWithAutoClose message={mutation.error?.message || "Có lỗi xảy ra"} />
                )}

                {mutation.isSuccess ? (
                  <div className="p-4 mb-4 text-sm text-green-700 bg-green-50 dark:bg-green-900 dark:text-green-300 rounded-md">
                    Đã gửi email. Vui lòng kiểm tra hộp thư để tiếp tục.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Email đăng ký</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-emerald-500"
                      required
                    />

                    <button
                      type="submit"
                      disabled={!email }
                      
                      className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      Gửi
                      {/* {mutation.isLoading ? "Đang gửi..." : "Gửi liên kết"} */}
                    </button>
                  </form>
                )}

                <div className="mt-6 flex items-center justify-between text-sm">
                  <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">Quay lại đăng nhập</Link>
                  <Link href="/register" className="text-gray-600 dark:text-gray-300 hover:underline">Đăng ký tài khoản</Link>
                </div>
              </div>

              <div className="text-center mt-4 text-xs text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} Tour Cắm Trại
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
