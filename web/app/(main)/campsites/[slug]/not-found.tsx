import { Button } from '@/components/ui/button';
import { Home, MapPinOff, Search } from 'lucide-react';
import Link from 'next/link';

export default function CampsiteNotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 px-4 text-center">
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-8">
            <MapPinOff className="text-muted-foreground h-16 w-16" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Không tìm thấy campsite
          </h1>
          <p className="text-muted-foreground">
            Rất tiếc, chúng tôi không thể tìm thấy campsite bạn đang tìm kiếm.
            Có thể nó đã bị xóa hoặc địa chỉ không chính xác.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm campsite
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
