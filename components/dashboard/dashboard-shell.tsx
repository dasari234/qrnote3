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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card text-card-foreground lg:flex">
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
          {/* Mobile Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-card text-card-foreground shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4">
              <span className="font-bold text-foreground">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="hover:bg-accent hover:text-accent-foreground rounded-md h-8 w-8"
              >
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent
                organizations={organizations}
                currentOrg={currentOrg}
                currentWorkspace={currentWorkspace}
                pathname={pathname}
                isSuperAdmin={isSuperAdmin}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Main content frame */}
      <div className="lg:pl-64">
        {/* Topbar navigation wrapper */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-accent text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <div className="flex-1" />

          {/* Action icons control panel */}
          <div className="flex items-center justify-end gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-accent hover:text-accent-foreground transition-all">
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground/80" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border shadow-md">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-semibold text-foreground leading-none">{profile.fullName || 'User'}</span>
                    <span className="text-xs text-muted-foreground font-mono leading-none truncate">{profile.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
                  <Link href="/dashboard/settings" className="w-full flex items-center">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive-foreground focus:bg-destructive/10 dark:focus:bg-destructive/20 cursor-pointer"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main page content insertion socket */}
        <main className="p-4 lg:p-6 bg-muted/40 dark:bg-background/20 min-h-[calc(100vh-56px)]">
          {children}
        </main>
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground">
      {/* Logo section */}
      <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm transition-transform group-hover:scale-105">
            <QrCode className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            QRNote
          </span>
        </Link>
      </div>

      {/* Organization selector zone */}
      <div className="shrink-0 border-b border-border p-3 bg-muted/20 dark:bg-transparent">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground">
              <span className="truncate font-medium">
                {currentOrg?.name || 'No organization'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground/80 shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 bg-popover text-popover-foreground border-border shadow-md" align="start">
            <DropdownMenuLabel className="text-muted-foreground font-semibold text-xs px-2 py-1.5">
              Organizations
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                className="flex items-center justify-between focus:bg-accent focus:text-accent-foreground cursor-pointer px-2 py-2"
              >
                <span className="truncate text-sm font-medium">{org.name}</span>
                <span className="text-xs text-muted-foreground font-mono bg-muted dark:bg-muted/60 px-1.5 py-0.5 rounded capitalize ml-2">
                  {org.role}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {currentWorkspace && (
          <p className="mt-2 px-1 text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <span className="text-muted-foreground/60">📁</span> Workspace: <span className="text-foreground">{currentWorkspace.name}</span>
          </p>
        )}
      </div>

      {/* Scrollable navigation map */}
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground/80")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Super Admin access link section */}
        {isSuperAdmin && (
          <div className="border-t border-border mt-2 p-3">
            <Link
              href="/dashboard/admin"
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200',
                pathname.startsWith('/dashboard/admin')
                  ? 'bg-destructive text-destructive-foreground shadow-sm'
                  : 'text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20'
              )}
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </div>

      {/* Fixed bottom action launcher box */}
      <div className="shrink-0 border-t border-border bg-card p-3">
        <Button asChild className="w-full shadow-sm">
          <Link href="/dashboard/qr/new" onClick={onNavigate}>
            <Plus className="mr-2 h-4 w-4" />
            Create QR Code
          </Link>
        </Button>
      </div>
    </div>
  );
}
