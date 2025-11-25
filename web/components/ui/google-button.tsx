'use client';

import { googleLogin } from '@/lib/client-actions';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import GoogleIcon from './google-icon';

interface GoogleUserInfo {
  email: string;
  role: string;
  name: string;
  picture: string;
  id: string;
}

const GoogleLoginButton = ({
  onAuthSuccess,
}: {
  onAuthSuccess: (user: User | null) => void;
}) => {
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`,
        );
        const userInfo: GoogleUserInfo = await userInfoResponse.json();

        // Gửi thông tin user thay vì token
        // const res = await googleLogin({
        //   email: userInfo.email,
        //   name: userInfo.name,
        //   picture: userInfo.picture,
        //   googleId: userInfo.id,
        // });

        // if (!res.success) {
        //   toast.error(res.message);
        // }

        const response = await googleLogin({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          googleId: userInfo.id,
        });

        if (response.success) {
          onAuthSuccess(response.data || null);
          router.push('/');
        } else {
          toast.error('Đăng nhập thất bại');
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Đăng nhập thất bại');
        router.push('/sign-in');
      }
    },
    onError: () => {
      toast.error('Đăng nhập thất bại');
      router.push('/sign-in');
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="text-foreground border-border flex w-full items-center justify-center space-x-3 rounded-2xl border bg-white/70 px-4 py-4 font-bold transition-all duration-300 hover:bg-white dark:bg-white/10 dark:hover:bg-white/40"
    >
      <GoogleIcon />
      <span className="text-black dark:text-white">Google</span>
    </button>
  );
};

export default GoogleLoginButton;
