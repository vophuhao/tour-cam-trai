'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  sendEmailVerification,
  sendPasswordReset,
  verifyPasswordResetCode,
  verifyVerificationCode,
} from '@/lib/actions/auth.actions';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

type Props = {
  email: string;
  type: 'verification' | 'reset';
  isOpenFromParent: boolean;
  onClose: () => void; // callback for parent when modal is closed
};

const OTPModal = ({ email, type, isOpenFromParent, onClose }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsOpen(isOpenFromParent);
  }, [isOpenFromParent]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleResend = async () => {
    const res =
      type === 'verification'
        ? await sendEmailVerification({ email })
        : await sendPasswordReset({ email });

    toast[res.success ? 'success' : 'error'](res.message);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const res =
      type === 'verification'
        ? await verifyVerificationCode({ email, code: password })
        : await verifyPasswordResetCode({ email, code: password });

    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
      router.push(
        type === 'verification'
          ? '/sign-in'
          : `/reset-password?email=${encodeURIComponent(email)}`,
      );
      handleClose();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Xác thực OTP
            <button
              className="absolute top-2 right-2 cursor-pointer"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </button>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vui lòng nhập OTP đã được gửi đến email của bạn.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <AlertDialogFooter>
          <Button type="button" variant="link" onClick={handleResend}>
            Gửi lại OTP
          </Button>

          <AlertDialogAction onClick={handleSubmit} type="button">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OTPModal;
