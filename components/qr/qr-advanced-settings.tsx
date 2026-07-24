'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { isRedirectType } from '@/lib/qr/factory';
import {
  AB_KEY,
  EXPIRES_KEY,
  getAbConfig,
  type AbVariant,
} from '@/lib/qr/meta';
import { QRType } from '@/lib/types';
import { CalendarClock, Link2, Plus, Split, Trash2 } from 'lucide-react';

/** ISO (UTC) -> value for a datetime-local input, in the viewer's local time. */
function isoToLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function newVariant(index: number): AbVariant {
  return {
    id: `v${Date.now()}_${index}`,
    label: `Variant ${index + 1}`,
    url: '',
    weight: 50,
    scans: 0,
  };
}

interface Props {
  type: QRType;
  isDynamic: boolean;
  payload: Record<string, any>;
  setPayload: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  slug: string;
  onSlugChange: (value: string) => void;
  origin: string;
}

export function QrAdvancedSettings({
  type,
  isDynamic,
  payload,
  setPayload,
  slug,
  onSlugChange,
  origin,
}: Props) {
  const ab = getAbConfig(payload) || { enabled: false, variants: [] };
  const expiresInput = isoToLocalInput(payload[EXPIRES_KEY]);
  const showAb = isDynamic && isRedirectType(type);

  const setExpiry = (value: string) => {
    const iso = localInputToIso(value);
    setPayload((prev) => {
      const next = { ...prev };
      if (iso) next[EXPIRES_KEY] = iso;
      else delete next[EXPIRES_KEY];
      return next;
    });
  };

  const updateAb = (variants: AbVariant[], enabled: boolean) => {
    setPayload((prev) => ({ ...prev, [AB_KEY]: { enabled, variants } }));
  };

  const toggleAb = (enabled: boolean) => {
    const variants =
      ab.variants.length > 0 ? ab.variants : [newVariant(0), newVariant(1)];
    updateAb(variants, enabled);
  };

  const updateVariant = (id: string, patch: Partial<AbVariant>) => {
    updateAb(
      ab.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)),
      ab.enabled
    );
  };

  const addVariant = () => {
    updateAb([...ab.variants, newVariant(ab.variants.length)], ab.enabled);
  };

  const removeVariant = (id: string) => {
    updateAb(
      ab.variants.filter((v) => v.id !== id),
      ab.enabled
    );
  };

  const totalWeight = ab.variants.reduce((s, v) => s + (v.weight || 0), 0);
  const totalScans = ab.variants.reduce((s, v) => s + (v.scans || 0), 0);

  if (!isDynamic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced</CardTitle>
          <CardDescription>
            Vanity links, scheduling and A/B testing are available for dynamic
            QR codes. Enable “Dynamic QR” above to use them.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced</CardTitle>
        <CardDescription>
          Custom short link, expiry scheduling and destination rotation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vanity slug */}
        <div className="space-y-2">
          <Label htmlFor="slug" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Custom short link
          </Label>
          <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
            <span className="whitespace-nowrap border-r px-3 py-2 text-sm text-muted-foreground">
              {origin.replace(/^https?:\/\//, '')}/q/
            </span>
            <input
              id="slug"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="my-campaign"
              className="h-10 flex-1 rounded-r-md bg-transparent px-3 py-2 text-sm outline-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            3–48 letters, numbers, hyphens or underscores. Leave blank to keep an
            auto-generated code.
          </p>
        </div>

        {/* Scheduled expiry */}
        <div className="space-y-2">
          <Label htmlFor="expiresAt" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" /> Expiry date
          </Label>
          <div className="flex gap-2">
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresInput}
              onChange={(e) => setExpiry(e.target.value)}
              className="flex-1"
            />
            {expiresInput && (
              <Button type="button" variant="outline" onClick={() => setExpiry('')}>
                Clear
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            After this time, scanners see an “expired” page instead of your
            content. Leave blank for no expiry.
          </p>
        </div>

        {/* A/B testing */}
        {showAb && (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Split className="h-4 w-4" /> A/B testing &amp; rotation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Split scans across multiple destinations by weight.
                </p>
              </div>
              <Switch checked={ab.enabled} onCheckedChange={toggleAb} />
            </div>

            {ab.enabled && (
              <div className="space-y-3">
                {ab.variants.map((v) => {
                  const pct =
                    totalWeight > 0
                      ? Math.round((v.weight / totalWeight) * 100)
                      : 0;
                  const scanPct =
                    totalScans > 0
                      ? Math.round((v.scans / totalScans) * 100)
                      : 0;
                  return (
                    <div key={v.id} className="space-y-2 rounded-md border bg-muted/30 p-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={v.label}
                          onChange={(e) => updateVariant(v.id, { label: e.target.value })}
                          placeholder="Label"
                          className="h-9 max-w-[9rem]"
                        />
                        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {pct}% split
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => removeVariant(v.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={v.url}
                        onChange={(e) => updateVariant(v.id, { url: e.target.value })}
                        placeholder="https://example.com/landing-a"
                        className="h-9"
                      />
                      <div className="flex items-center gap-3">
                        <Label className="text-xs text-muted-foreground">Weight</Label>
                        <Input
                          type="number"
                          min={0}
                          value={v.weight}
                          onChange={(e) =>
                            updateVariant(v.id, { weight: Number(e.target.value) || 0 })
                          }
                          className="h-9 w-20"
                        />
                        <span className="ml-auto text-xs text-muted-foreground">
                          {v.scans} scans{totalScans > 0 ? ` · ${scanPct}%` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add variant
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
