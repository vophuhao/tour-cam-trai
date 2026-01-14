'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
}

export default function LoginPromptDialog({
  open,
  onOpenChange,
  redirectTo,
}: LoginPromptDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogin = () => {
    const redirect = encodeURIComponent(
      redirectTo ||
        `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`,
    );
    onOpenChange(false);
    router.push(`/sign-in?redirect=${redirect}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn cần đăng nhập</DialogTitle>
          <DialogDescription>
            Bạn cần đăng nhập để tiếp tục đặt chỗ. Đăng nhập ngay để tiếp tục.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleLogin}>Đăng nhập</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
