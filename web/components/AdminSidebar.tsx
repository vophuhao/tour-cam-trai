'use client';

import { logout } from '@/lib/client-actions';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import {
  BarChart,
  Home,
  LogOut,
  Package,
  Settings,
  Tent,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type MenuItem = {
  name: string;
  href?: string; // với logout mình không cần href
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const handleLogout = async () => {
    const response = await logout();

    if (response.success) {
      toast.success(response.message);
      useAuthStore.getState().setUser(null);
      router.push('/sign-in');
    }
  };

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Tours', href: '/admin/tours', icon: Tent },
    { name: 'Category', href: '/admin/category', icon: Package },
    { name: 'Đăng xuất', icon: LogOut, action: handleLogout }, // xử lý riêng
  ];

  return (
    <aside className="fixed top-5 left-0 flex h-screen w-64 flex-col shadow-lg">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isHovered = hovered === item.href;

          return item.action ? (
            // Nếu có action (logout) -> dùng button
            <button
              key={item.name}
              onClick={item.action}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-4 py-4 text-left text-sm font-medium transition-colors',
                hovered === item.name
                  ? 'bg-[#3B6E5F] text-[#F4FAF4]'
                  : 'hover:bg-gray-200',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </button>
          ) : (
            <Link
              key={item.name}
              href={item.href!}
              onMouseEnter={() => setHovered(item.href!)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-4 text-sm font-medium transition-colors',
                hovered === item.href
                  ? 'bg-[#3B6E5F] text-[#F4FAF4]'
                  : !hovered && isActive
                    ? 'bg-[#3B6E5F] text-[#F4FAF4]'
                    : 'hover:bg-gray-200',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
