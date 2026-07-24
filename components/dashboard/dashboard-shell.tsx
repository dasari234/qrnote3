'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  ChevronDown,
  CreditCard,
  Folder,
  LayoutDashboard,
  Menu,
  Plus,
  QrCode,
  Settings,
  ShieldAlert,
  Upload,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface DashboardShellProps {
  children: ReactNode;
  organizations: { id: string; name: string; slug: string; role: string }[];
  workspaces: { id: string; org_id: string; name: string }[];
  profile: { email: string; fullName: string };
  isSuperAdmin?: boolean;
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/qr', label: 'QR Codes', icon: QrCode },
  { href: '/dashboard/qr/bulk', label: 'Bulk Import', icon: Upload },
  { href: '/dashboard/folders', label: 'Folders', icon: Folder },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({
  children,
  organizations,
  workspaces,
  profile,
  isSuperAdmin = false,
}: DashboardShellProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentOrg = organizations[0];
  const currentWorkspace = workspaces[0];

  const initials = (profile.fullName || profile.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background lg:flex">
        <SidebarContent
          organizations={organizations}
          currentOrg={currentOrg}
          currentWorkspace={currentWorkspace}
          pathname={pathname}
          isSuperAdmin={isSuperAdmin}
        />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-background">
            <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent
              organizations={organizations}
              currentOrg={currentOrg}
              currentWorkspace={currentWorkspace}
              pathname={pathname}
              isSuperAdmin={isSuperAdmin}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <div className="flex flex-1 items-center justify-end gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {/* <span className="hidden text-sm font-medium sm:inline">
                    {profile.fullName || profile.email}
                  </span> */}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{profile.fullName || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{profile.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  organizations,
  currentOrg,
  currentWorkspace,
  pathname,
  isSuperAdmin,
  onNavigate,
}: {
  organizations: any[];
  currentOrg: any;
  currentWorkspace: any;
  pathname: string;
  isSuperAdmin?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <QrCode className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="flex flex-col justify-center leading-none">
            <span className="text-lg font-semibold tracking-tight">
              QRNote
            </span>
          </div>
        </Link>
      </div>

      {/* Org / workspace switcher */}
      <div className="border-b p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {currentOrg?.name || 'No organization'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem key={org.id} className="flex items-center justify-between">
                <span className="truncate">{org.name}</span>
                <span className="text-xs text-muted-foreground">{org.role}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {currentWorkspace && (
          <p className="mt-2 px-1 text-xs text-muted-foreground">
            Workspace: {currentWorkspace.name}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarGutter: 'stable' }}>
        <div className="space-y-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
        </div>
      </nav>

       {/* Super admin link */}
      {isSuperAdmin && (
        <div className="border-t p-3">
          <Link
            href="/dashboard/admin"
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/dashboard/admin')
                ? 'bg-destructive text-destructive-foreground'
                : 'text-destructive hover:bg-destructive/10'
            )}
          >
            <ShieldAlert className="h-4 w-4" />
            Admin Panel
          </Link>
        </div>
      )}

      {/* Create button */}
      <div className="border-t p-3">
        <Button asChild className="w-full" onClick={onNavigate}>
          <Link href="/dashboard/qr/new">
            <Plus className="mr-2 h-4 w-4" />
            Create QR Code
          </Link>
        </Button>
      </div>
    </div>
  );
}
