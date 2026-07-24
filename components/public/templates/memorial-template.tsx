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
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors">
        {/* Banner Section - Uses secondary layout variables for a softer theme-aware header background */}
        <div className="flex flex-col items-center bg-secondary px-6 py-10 text-center text-secondary-foreground shadow-inner dark:bg-muted/30">
          <Flower2 className="h-9 w-9 text-muted-foreground/90 shrink-0" />
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            In Loving Memory
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance text-foreground">{personName}</h1>
          {years && <p className="mt-1 text-sm text-muted-foreground font-medium font-mono">{years}</p>}
        </div>

        <div className="p-5 bg-card space-y-5">
          {payload.biography && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 font-medium bg-muted/20 dark:bg-muted/5 p-4 rounded-lg border border-border/30">
              {payload.biography}
            </p>
          )}

          <div className="grid grid-cols-1 gap-2 pt-1">
            {payload.galleryUrl && (
              <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground transition-all">
                <a href={payload.galleryUrl} target="_blank" rel="noreferrer">
                  <Images className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  Photo Gallery
                </a>
              </Button>
            )}
            {payload.videoUrl && (
              <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground transition-all">
                <a href={payload.videoUrl} target="_blank" rel="noreferrer">
                  <Video className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  Watch Video
                </a>
              </Button>
            )}
            {payload.donationsUrl && (
              <Button asChild className="w-full shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                <a href={payload.donationsUrl} target="_blank" rel="noreferrer">
                  <Heart className="mr-2 h-4 w-4 fill-current" />
                  Make a Donation
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {payload.familyTree && (
        <div className="mt-4 bg-card rounded-xl border border-border p-5 shadow-sm transition-colors">
          <Section title="Family">
            <div className="flex items-start gap-3 mt-2">
              <Users className="mt-0.5 h-4 w-4 text-primary shrink-0" />
              <p className="whitespace-pre-line text-sm text-foreground/90 leading-relaxed font-medium">
                {payload.familyTree}
              </p>
            </div>
          </Section>
        </div>
      )}

      {payload.stories && (
        <div className="mt-4 bg-card rounded-xl border border-border p-5 shadow-sm transition-colors">
          <Section title="Stories & Memories">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 font-medium bg-muted/30 dark:bg-muted/10 p-4 rounded-lg border border-border/30 mt-2">
              {payload.stories}
            </p>
          </Section>
        </div>
      )}
    </ScanShell>
  );
}
