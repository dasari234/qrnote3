import { QrCode } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Full-screen, mobile-first wrapper for public scan landing pages.
 * `accent` sets the hero band color via an inline style so each QR type
 * can have its own identity while still using the shared layout.
 */
export function ScanShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-8 sm:py-12">
      <div className={cn('mx-auto w-full max-w-md', className)}>
        {children}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" />
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
}: {
  label: string;
  value?: ReactNode;
  icon?: ReactNode;
}) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 break-words text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      {title && (
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
