'use client';

import { QrFormFieldsExtended } from '@/components/qr/qr-form-fields-extended';

import {
    Card,
    CardContent,
} from '@/components/ui/card';

import {
    ChevronDown,
    Settings2,
} from 'lucide-react';

import { useState } from 'react';

interface Props {
  typeDef: any;
  payload: Record<string, any>;

  onFieldChange: (
    key: string,
    value: string
  ) => void;

  expiresAt?: string | null;
  onExpiryChange: (
    value: string | null
  ) => void;

  shortCode: string;
  onShortCodeChange: (
    value: string
  ) => void;

  suggestedShortCode: string;

  variant: string | null;
  onVariantChange: (
    value: string | null
  ) => void;

  testName: string;
  onTestNameChange: (
    value: string
  ) => void;
}

export function QrAdvancedSection({
  typeDef,
  payload,
  onFieldChange,
  expiresAt,
  onExpiryChange,
  shortCode,
  onShortCodeChange,
  suggestedShortCode,
  variant,
  onVariantChange,
  testName,
  onTestNameChange,
}: Props) {
  const [open, setOpen] =
    useState(false);

  return (
    <section>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <button
          type="button"
          onClick={() =>
            setOpen((previous) => !previous)
          }
          className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-muted/30"
          aria-expanded={open}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Settings2 className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Advanced settings
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Expiration, custom URL and A/B testing
              </p>
            </div>
          </div>

          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <CardContent className="border-t border-border/70 p-5">
            <QrFormFieldsExtended
              typeDef={typeDef}
              payload={payload}
              onChange={onFieldChange}
              expiresAt={expiresAt}
              onExpiryChange={onExpiryChange}
              shortCode={shortCode}
              onShortCodeChange={
                onShortCodeChange
              }
              suggestedShortCode={
                suggestedShortCode
              }
              variant={variant}
              onVariantChange={
                onVariantChange
              }
              testName={testName}
              onTestNameChange={
                onTestNameChange
              }
            />
          </CardContent>
        )}
      </Card>
    </section>
  );
}
