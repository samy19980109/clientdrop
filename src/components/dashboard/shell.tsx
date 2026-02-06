'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface DashboardShellProps {
  user: {
    id: string;
    email: string;
    businessName: string;
  };
  children: React.ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-foreground">ClientDrop</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 cursor-pointer">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-border flex flex-col transition-transform sm:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">ClientDrop</div>
              <div className="text-xs text-muted truncate max-w-[160px]">
                {user.businessName || user.email}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-foreground/5 hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-foreground/5 hover:text-foreground transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="sm:ml-64 min-h-screen pt-14 sm:pt-0">
        <div className="p-6 sm:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
