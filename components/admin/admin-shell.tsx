'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Building2,
  ChevronLeft,
  LayoutDashboard,
  ShieldAlert,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const adminNav = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/admin/orgs', label: 'Organizations', icon: Building2, exact: false },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users, exact: false },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin top banner - Adjusted transparency for safer dark mode ratios */}
      <div className="border-b border-border bg-destructive/10 px-6 py-2 dark:bg-destructive/20 transition-colors">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive dark:text-red-400 shrink-0" />
            <span className="text-sm font-bold text-destructive dark:text-red-400">
              Super Admin Panel
            </span>
            <span className="text-sm text-muted-foreground">
              — Changes here affect all organizations and users.
            </span>
          </div>
          <Button variant="ghost" size="sm" asChild className="hover:bg-accent hover:text-accent-foreground self-end sm:self-auto">
            <Link href="/dashboard">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 h-[calc(100vh-41px)] w-52 shrink-0 border-r border-border bg-card text-card-foreground p-3 hidden md:block">
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
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
