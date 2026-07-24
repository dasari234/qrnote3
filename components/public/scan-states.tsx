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
      <div className="flex flex-col items-center rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{message}</p>
      </div>
    </ScanShell>
  );
}

export function NotFoundState() {
  return (
    <StateCard
      icon={<SearchX className="h-7 w-7" />}
      title="QR code not found"
      message="This code doesn't exist or may have been deleted. Double-check the link and try again."
    />
  );
}

export function PausedState() {
  return (
    <StateCard
      icon={<PauseCircle className="h-7 w-7" />}
      title="This QR code is paused"
      message="The owner has temporarily disabled this QR code. Please check back later."
    />
  );
}

export function ExpiredState() {
  return (
    <StateCard
      icon={<CalendarX className="h-7 w-7" />}
      title="This QR code has expired"
      message="The content behind this QR code is no longer available."
    />
  );
}
