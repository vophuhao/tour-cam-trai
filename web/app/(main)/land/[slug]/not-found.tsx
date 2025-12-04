import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Không tìm thấy khu đất
        </h1>
        <p className="text-muted-foreground text-lg">
          Khu đất bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/properties/search">
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm khu đất khác
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
  );
}
