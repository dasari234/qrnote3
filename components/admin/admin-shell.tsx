'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ChevronLeft,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const adminNav = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/admin/orgs', label: 'Organizations', icon: Building2, exact: false },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users, exact: false },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      {/* Admin top banner */}
      <div className="border-b bg-destructive/5 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">
              Super Admin Panel
            </span>
            <span className="text-sm text-muted-foreground">
              — Changes here affect all organizations and users.
            </span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 h-[calc(100vh-41px)] w-52 shrink-0 border-r bg-background p-3">
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
