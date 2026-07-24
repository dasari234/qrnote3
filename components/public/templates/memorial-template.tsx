import { Button } from '@/components/ui/button';
import { Flower2, Heart, Images, Users, Video } from 'lucide-react';
import { ScanShell, Section } from '../scan-shell';

export function MemorialTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const personName = payload.name || name;
  const years = [payload.birthYear, payload.deathYear].filter(Boolean).join(' – ');

  return (
    <ScanShell>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col items-center bg-secondary px-6 py-10 text-center text-secondary-foreground">
          <Flower2 className="h-9 w-9 text-muted-foreground" />
          <p className="mt-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            In Loving Memory
          </p>
          <h1 className="mt-2 text-2xl font-bold text-balance">{personName}</h1>
          {years && <p className="mt-1 text-sm text-muted-foreground">{years}</p>}
        </div>

        <div className="space-y-4 p-5">
          {payload.biography && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {payload.biography}
            </p>
          )}
          <div className="grid grid-cols-1 gap-2">
            {payload.galleryUrl && (
              <Button asChild variant="outline" className="w-full">
                <a href={payload.galleryUrl} target="_blank" rel="noreferrer">
                  <Images className="mr-2 h-4 w-4" />
                  Photo Gallery
                </a>
              </Button>
            )}
            {payload.videoUrl && (
              <Button asChild variant="outline" className="w-full">
                <a href={payload.videoUrl} target="_blank" rel="noreferrer">
                  <Video className="mr-2 h-4 w-4" />
                  Watch Video
                </a>
              </Button>
            )}
            {payload.donationsUrl && (
              <Button asChild className="w-full">
                <a href={payload.donationsUrl} target="_blank" rel="noreferrer">
                  <Heart className="mr-2 h-4 w-4" />
                  Make a Donation
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {payload.familyTree && (
        <div className="mt-4">
          <Section title="Family">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <p className="whitespace-pre-line text-sm text-foreground">
                {payload.familyTree}
              </p>
            </div>
          </Section>
        </div>
      )}

      {payload.stories && (
        <div className="mt-4">
          <Section title="Stories & Memories">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {payload.stories}
            </p>
          </Section>
        </div>
      )}
    </ScanShell>
  );
}
