import { Button } from '@/components/ui/button';
import { Gift, Music, Images, Video } from 'lucide-react';
import { ScanShell, Section } from '../scan-shell';

export function GiftTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const title = payload.title || name;

  return (
    <ScanShell>
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors">
        {/* Banner Section - Maintains high visual consistency via primary color token mapping */}
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground shadow-inner">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur-sm">
            <Gift className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-balance">{title}</h1>
          {payload.recipient && (
            <p className="text-sm text-primary-foreground/90 mt-1 font-medium">
              For {payload.recipient}
            </p>
          )}
        </div>

        <div className="space-y-2 p-5 bg-card">
          {payload.videoUrl && (
            <Button asChild className="w-full shadow-sm transition-transform active:scale-[0.99]">
              <a href={payload.videoUrl} target="_blank" rel="noreferrer">
                <Video className="mr-2 h-4 w-4" />
                Play Video Message
              </a>
            </Button>
          )}
          {payload.photoAlbumUrl && (
            <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground transition-all">
              <a href={payload.photoAlbumUrl} target="_blank" rel="noreferrer">
                <Images className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                View Photo Album
              </a>
            </Button>
          )}
          {payload.playlistUrl && (
            <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground transition-all">
              <a href={payload.playlistUrl} target="_blank" rel="noreferrer">
                <Music className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                Listen to Playlist
              </a>
            </Button>
          )}
        </div>
      </div>

      {payload.loveLetter && (
        <div className="mt-4 bg-card rounded-xl border border-border p-5 shadow-sm transition-colors">
          <Section title="A Message For You">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 font-medium bg-muted/30 dark:bg-muted/10 p-4 rounded-lg border border-border/30 mt-2">
              {payload.loveLetter}
            </p>
          </Section>
        </div>
      )}

      {payload.timeline && (
        <div className="mt-4 bg-card rounded-xl border border-border p-5 shadow-sm transition-colors">
          <Section title="Our Memories">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 font-medium bg-muted/30 dark:bg-muted/10 p-4 rounded-lg border border-border/30 mt-2">
              {payload.timeline}
            </p>
          </Section>
        </div>
      )}
    </ScanShell>
  );
}
