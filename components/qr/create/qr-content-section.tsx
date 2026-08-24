'use client';

import { QrFormFields } from '@/components/qr/qr-form-fields';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Share2 } from 'lucide-react';

interface Props {
  typeDef: any;
  name: string;
  payload: Record<string, any>;
  isDynamic: boolean;
  onNameChange: (value: string) => void;
  onFieldChange: (
    key: string,
    value: string
  ) => void;
  onDynamicChange: (
    value: boolean
  ) => void;
}

export function QrContentSection({
  typeDef,
  name,
  payload,
  isDynamic,
  onNameChange,
  onFieldChange,
  onDynamicChange,
}: Props) {
  return (
    <section>
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            2
          </span>

          <h2 className="text-base font-semibold">
            QR content
          </h2>
        </div>

        <p className="ml-8 mt-1 text-sm text-muted-foreground">
          Configure the information your QR code
          will contain.
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-base">
            {typeDef?.label || 'QR Code'}
          </CardTitle>

          <CardDescription>
            Enter the content for your QR code.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-5">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-semibold"
            >
              QR name
            </Label>

            <Input
              id="name"
              value={name}
              placeholder="e.g. Summer Campaign"
              required
              onChange={(event) =>
                onNameChange(
                  event.target.value
                )
              }
              className="h-11"
            />

            <p className="text-xs text-muted-foreground">
              Give this QR code a name so you can
              easily find it later.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/[0.18] p-4">
            <QrFormFields
              typeDef={typeDef}
              payload={payload}
              onChange={onFieldChange}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/[0.12] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Share2 className="h-4 w-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="dynamic"
                    className="cursor-pointer text-sm font-semibold"
                  >
                    Dynamic QR
                  </Label>

                  {isDynamic && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Change the destination later without
                  reprinting and enable scan analytics.
                </p>
              </div>
            </div>

            <Switch
              id="dynamic"
              checked={isDynamic}
              onCheckedChange={onDynamicChange}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
