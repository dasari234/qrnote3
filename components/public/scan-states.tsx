import { CalendarX, PauseCircle, SearchX } from 'lucide-react';
import { ScanShell } from './scan-shell';

function StateCard({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <ScanShell>
      {/* Container Frame - Explicitly sets boundary tokens to block unstyled browser light leaks */}
      <div className="flex flex-col items-center rounded-xl border border-border bg-card px-6 py-12 text-center text-card-foreground shadow-sm transition-colors duration-200">
        {/* Vector Asset Capsule Container - Tinted translucent surfaces for visual isolation depth */}
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted dark:bg-muted/40 border border-border/20 text-muted-foreground/90 shrink-0 shadow-inner">
          {icon}
        </div>

        {/* Informative Error Messages Matrix */}
        <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground font-medium leading-relaxed px-2">
          {message}
        </p>
      </div>
    </ScanShell>
  );
}

export function NotFoundState() {
  return (
    <StateCard
      icon={<SearchX className="h-6 w-6 text-destructive dark:text-red-400" />}
      title="QR Code Not Found"
      message="This code doesn't exist or may have been deleted. Double-check the link and try again."
    />
  );
}

export function PausedState() {
  return (
    <StateCard
      icon={<PauseCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
      title="This QR Code is Paused"
      message="The owner has temporarily disabled this QR code. Please check back later."
    />
  );
}

export function ExpiredState() {
  return (
    <StateCard
      icon={<CalendarX className="h-6 w-6 text-muted-foreground/80" />}
      title="This QR Code Has Expired"
      message="The content behind this QR code is no longer available as its set lifespan has concluded."
    />
  );
}
