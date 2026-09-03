"use client";

import { useCart } from "@/components/providers/cart/cart-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ChevronDown, Menu, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  setMobileOpen: (open: boolean) => void;
  profile: any;
  initials: string;
  signOut: () => void;
}

export function DashboardHeader({ setMobileOpen, profile, initials, signOut }: DashboardHeaderProps) {
  // This hook now lives perfectly underneath the CartProvider!
  const { items } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  const cartItemCount = items.reduce((total, item) => total + item.qty, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
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

      <div className="flex items-center justify-end gap-2">
        {isMounted && cartItemCount > 0 && (
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/dashboard/billing/cart" aria-label="View Shopping Cart">
              <ShoppingCart className="h-5 w-5 text-foreground" />

              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground animate-in fade-in zoom-in-50 duration-200">
                {cartItemCount}
              </span>

            </Link>
          </Button>
        )}

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
              className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 cursor-pointer"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
