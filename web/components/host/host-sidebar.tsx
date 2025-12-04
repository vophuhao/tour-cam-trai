'use client';

import { logout } from '@/lib/client-actions';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import {
  BarChart,
  Home,
  LogOut,
  Calendar,
  Star,
  MessageSquare,
  Tent,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type MenuItem = {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
  subMenu?: { name: string; href: string }[];
};

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
};

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const handleLogout = async () => {
    const response = await logout();
    if (response.success) {
      toast.success(response.message);
      useAuthStore.getState().setUser(null);
      router.push('/sign-in');
    }
  };

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/host', icon: Home },
  { name: 'Bookings', href: '/host/bookings', icon: Calendar }, // ✅ Calendar thay BarChart
  { name: 'Campsites', href: '/host/campsites', icon: Tent }, // ✅ Giữ nguyên
  { name: 'Đánh giá', href: '/host/reviews', icon: Star }, // ✅ Star thay Users
  { name: 'Hỗ trợ', href: '/host/support', icon: MessageSquare }, // ✅ MessageSquare thay Settings
  { name: 'Đăng xuất', icon: LogOut, action: handleLogout }, // ✅ Giữ nguyên
];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen bg-white shadow-lg flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-45'
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex h-16 items-center justify-between px-3">
        <h1
          className={cn(
            'text-xl font-bold transition-all duration-300',
            collapsed ? 'opacity-0 w-0 overflow-hidden' : ''
          )}
        >
          Admin Panel
        </h1>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-200"
        >
          <BarChart className="h-5 w-5" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isHovered = hovered === (item.href || item.name);

          const hasSubmenu = !!item.subMenu;
          const isExpanded = expandedMenus.includes(item.name);

          const finalClasses = cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full justify-between',
            isHovered
              ? 'bg-[#3B6E5F] text-[#F4FAF4]'
              : !hovered && isActive
              ? 'bg-[#3B6E5F] text-[#F4FAF4]'
              : 'hover:bg-gray-200'
          );

          const mainContent = (
            <div className="flex items-center gap-3 w-full">
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="flex-1">{item.name}</span>}
              {!collapsed && hasSubmenu && (
                <span className="flex-shrink-0">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              )}
            </div>
          );

          // Nếu item có subMenu
          if (hasSubmenu) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  onMouseEnter={() => setHovered(item.name)}
                  onMouseLeave={() => setHovered(null)}
                  className={finalClasses}
                >
                  {mainContent}
                </button>

                {/* Submenu */}
                {isExpanded && !collapsed && (
                  <div className="ml-6 flex flex-col gap-1 mt-1">
                    {item.subMenu!.map((sub) => {
                      const subActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={cn(
                            'px-3 py-2 rounded-lg text-sm transition-colors',
                            subActive
                              ? 'bg-[#3B6E5F] text-[#F4FAF4]'
                              : 'hover:bg-gray-200'
                          )}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Item bình thường
          return item.action ? (
            <button
              key={item.name}
              onClick={item.action}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              className={finalClasses}
            >
              {mainContent}
            </button>
          ) : (
            <Link
              key={item.name}
              href={item.href!}
              onMouseEnter={() => setHovered(item.href!)}
              onMouseLeave={() => setHovered(null)}
              className={finalClasses}
            >
              {mainContent}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
