'use client';

import { QrFormFieldsExtended } from '@/components/qr/qr-form-fields-extended';

import {
  Card,
  CardContent,
} from '@/components/ui/card';



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

  return (
    <section>
      <Card className="overflow-hidden border-border/70 shadow-sm">
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
      </Card>
    </section>
  );
}
