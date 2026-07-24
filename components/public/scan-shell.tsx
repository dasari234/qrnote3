import { QrCode } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

/**
 * Full-screen, mobile-first wrapper for public scan landing pages.
 * Handles continuous system theme background transitions gracefully.
 */
export function ScanShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    // Update: Uses context-aware root background tokens for depth layered screens
    <div className="min-h-screen bg-background text-foreground px-4 py-8 sm:py-12 transition-colors duration-200">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className={cn('mx-auto w-full max-w-md', className)}>
        {children}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
          <QrCode className="h-3.5 w-3.5 text-primary" />
          <span>Powered by QRNote</span>
        </div>
      </div>
    </div>
  );
}

export function InfoRow({
  label,
  value,
  icon,
  className, // Added optional className prop for flexible row styles
}: {
  label: string;
  value?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className={cn("flex items-start gap-3 py-3 px-1 transition-colors", className)}>
      {icon && <div className="mt-0.5 text-muted-foreground/80 shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
          {label}
        </p>
        <div className="mt-1 break-words text-sm text-foreground/90 leading-relaxed font-medium">
          {value}
        </div>
      </div>
    </div>
  );
}

export function Section({
  title,
  children,
  className, // Added optional className prop for card overrides
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    // Update: Uses semantic bg-card and explicit border-border for strict theme harmony
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-sm text-card-foreground transition-colors", className)}>
      {title && (
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/90 border-b border-border/40 pb-1.5">
          {title}
        </h2>
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
}
