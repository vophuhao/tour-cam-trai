"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { googleLogin } from "@/lib/api";
import GoogleIcon from "./GoogleIcon";

interface GoogleUserInfo {
  email: string;
  role:string;
  name: string;
  picture: string;
  id: string;
}

const GoogleLoginButton: React.FC = () => {
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`,
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to fetch Google user info");
        }

        const userInfo: GoogleUserInfo = await userInfoResponse.json();

        // Gửi thông tin user thay vì token
        await googleLogin({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          googleId: userInfo.id,
        });
        router.push("/home");
      } catch (error) {
        console.error("Google login error:", error);
        toast.error("Đăng nhập thất bại");
        router.push("/login");
      }
    },
    onError: () => {
      toast.error("Đăng nhập thất bại");
      router.push("/login");
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="text-foreground border-border flex w-full items-center justify-center space-x-3 rounded-2xl border bg-white/70 px-4 py-4 font-bold transition-all duration-300 hover:bg-white dark:bg-white/10 dark:hover:bg-white/40"
    >
      <GoogleIcon />
      <span className="text-black dark:text-white">Đăng nhập bằng Google</span>
    </button>
  );
};

export default GoogleLoginButton;
