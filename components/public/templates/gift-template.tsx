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
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/15">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-balance">{title}</h1>
          {payload.recipient && (
            <p className="text-sm text-primary-foreground/80">
              For {payload.recipient}
            </p>
          )}
        </div>

        <div className="space-y-2 p-5">
          {payload.videoUrl && (
            <Button asChild className="w-full">
              <a href={payload.videoUrl} target="_blank" rel="noreferrer">
                <Video className="mr-2 h-4 w-4" />
                Play Video Message
              </a>
            </Button>
          )}
          {payload.photoAlbumUrl && (
            <Button asChild variant="outline" className="w-full">
              <a href={payload.photoAlbumUrl} target="_blank" rel="noreferrer">
                <Images className="mr-2 h-4 w-4" />
                View Photo Album
              </a>
            </Button>
          )}
          {payload.playlistUrl && (
            <Button asChild variant="outline" className="w-full">
              <a href={payload.playlistUrl} target="_blank" rel="noreferrer">
                <Music className="mr-2 h-4 w-4" />
                Listen to Playlist
              </a>
            </Button>
          )}
        </div>
      </div>

      {payload.loveLetter && (
        <div className="mt-4">
          <Section title="A Message For You">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {payload.loveLetter}
            </p>
          </Section>
        </div>
      )}

      {payload.timeline && (
        <div className="mt-4">
          <Section title="Our Memories">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {payload.timeline}
            </p>
          </Section>
        </div>
      )}
    </ScanShell>
  );
}
