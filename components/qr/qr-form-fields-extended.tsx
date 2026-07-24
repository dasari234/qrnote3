'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface ExtendedQrFormFieldsProps {
  // existing
  typeDef: any;
  payload: Record<string, any>;
  onChange: (key: string, value: string) => void;

  // new: expiry
  expiresAt?: string;
  onExpiryChange: (date: string | null) => void;

  // new: vanity slug
  shortCode?: string;
  onShortCodeChange: (code: string) => void;
  suggestedShortCode?: string;

  // new: A/B testing
  variant?: string | null;
  onVariantChange: (variant: string | null) => void;
  testName?: string;
  onTestNameChange: (name: string) => void;
}

export function QrFormFieldsExtended({
  typeDef,
  payload,
  onChange,
  expiresAt,
  onExpiryChange,
  shortCode,
  onShortCodeChange,
  suggestedShortCode,
  variant,
  onVariantChange,
  testName,
  onTestNameChange,
}: ExtendedQrFormFieldsProps) {
  const [showVanityEditor, setShowVanityEditor] = useState(false);
  const [showAbTesting, setShowAbTesting] = useState(!!variant);
  const [isCustomSlug, setIsCustomSlug] = useState(!!shortCode);

  return (
    <div className="space-y-6 text-foreground">
      {/* Existing QR Type Fields */}
      <div className="space-y-4">
        {typeDef?.fields?.map((field: any) => (
          <FieldInput
            key={field.key}
            field={field}
            value={payload[field.key] || ''}
            onChange={(v) => onChange(field.key, v)}
          />
        ))}
      </div>

      {/* Vanity Slug Section */}
      <Card className="bg-card text-card-foreground border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base text-foreground font-bold">Custom Link (Vanity Slug)</CardTitle>
              <CardDescription className="text-muted-foreground">Use a memorable short code instead of random</CardDescription>
            </div>
            <Switch
              checked={isCustomSlug}
              onCheckedChange={(checked) => {
                setIsCustomSlug(checked);
                if (!checked) {
                  onShortCodeChange('');
                  setShowVanityEditor(false);
                } else {
                  setShowVanityEditor(true);
                }
              }}
            />
          </div>
        </CardHeader>

        {isCustomSlug && (
          <CardContent className="space-y-3 pt-2">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., my-promo, summer2026"
                value={shortCode || ''}
                onChange={(e) => onShortCodeChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                maxLength={32}
                className="flex-1 bg-background text-foreground border-input placeholder:text-muted-foreground/50 font-mono"
              />
              {suggestedShortCode && !shortCode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onShortCodeChange(suggestedShortCode)}
                  className="gap-2 hover:bg-accent hover:text-accent-foreground shrink-0"
                >
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  Use suggested
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground/80 font-medium px-0.5">
              Format: letters, numbers, hyphens only • Max 32 characters
            </p>
          </CardContent>
        )}
      </Card>

      {/* Expiry Section */}
      <Card className="bg-card text-card-foreground border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base text-foreground font-bold">QR Code Expiry</CardTitle>
              <CardDescription className="text-muted-foreground">Automatically deactivate on a specific date</CardDescription>
            </div>
            <Switch
              checked={!!expiresAt}
              onCheckedChange={(checked) => {
                if (!checked) {
                  onExpiryChange(null);
                } else {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  onExpiryChange(tomorrow.toISOString().split('T')[0]);
                }
              }}
            />
          </div>
        </CardHeader>

        {expiresAt && (
          <CardContent className="pt-2">
            <Input
              type="date"
              value={expiresAt.split('T')[0]}
              onChange={(e) => onExpiryChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="bg-background text-foreground border-input focus-visible:ring-ring"
            />
            <p className="mt-2 text-xs text-muted-foreground/80 font-medium px-0.5">
              After this date, scans will see a &quot;QR code expired&quot; message
            </p>
          </CardContent>
        )}
      </Card>

      {/* A/B Testing Section */}
      <Card className="bg-card text-card-foreground border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base text-foreground font-bold">A/B Testing</CardTitle>
              <CardDescription className="text-muted-foreground">Create test variants to measure performance</CardDescription>
            </div>
            <Switch
              checked={showAbTesting}
              onCheckedChange={(checked) => {
                setShowAbTesting(checked);
                if (!checked) {
                  onVariantChange(null);
                  onTestNameChange('');
                }
              }}
            />
          </div>
        </CardHeader>

        {showAbTesting && (
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="test-name" className="text-foreground font-medium">Test Name</Label>
              <Input
                id="test-name"
                placeholder="e.g., Homepage CTA Test"
                value={testName || ''}
                onChange={(e) => onTestNameChange(e.target.value)}
                className="bg-background text-foreground border-input placeholder:text-muted-foreground/50 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant" className="text-foreground font-medium">This QR is variant:</Label>
              <Select
                value={variant || 'A'}
                onValueChange={(v) => onVariantChange(v)}
              >
                <SelectTrigger id="variant" className="w-full bg-background text-foreground border-input focus:ring-ring">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border shadow-md">
                  <SelectItem value="A" className="focus:bg-accent focus:text-accent-foreground cursor-pointer py-2">Variant A</SelectItem>
                  <SelectItem value="B" className="focus:bg-accent focus:text-accent-foreground cursor-pointer py-2">Variant B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Premium Info Callout Block - Adjusted contrast colors for dark mode harmony */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-400 shadow-inner flex items-start gap-2.5 leading-relaxed font-medium">
              <AlertCircle className="h-4 w-full max-w-[16px] text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <span>Variants in the same test are tracked separately for comparison</span>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}


// Reuse existing FieldInput component or define inline
function FieldInput({
  field,
  value,
  onChange,
}: {
  field: any;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2 transition-colors">
      <Label htmlFor={field.key} className="text-foreground/90 font-medium">
        {field.label}
        {field.required && (
          <span className="ml-1 text-destructive font-bold dark:text-red-400">*</span>
        )}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          id={field.key}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-background text-foreground border-input placeholder:text-muted-foreground/50 focus-visible:ring-ring font-medium text-sm leading-relaxed"
          rows={3}
        />
      ) : field.type === 'select' ? (
        <Select value={value || field.options?.[0]?.value} onValueChange={onChange}>
          <SelectTrigger
            id={field.key}
            className="w-full bg-background text-foreground border-input focus:ring-ring font-medium text-sm"
          >
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          {/* Fix: Set explicit popover token color overrides to prevent invisible black-on-black menus */}
          <SelectContent className="bg-popover text-popover-foreground border-border shadow-md">
            {field.options?.map((opt: any) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="focus:bg-accent focus:text-accent-foreground cursor-pointer font-medium text-sm py-2"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={field.key}
          // Fix: Ensure password masks render securely by passing explicit password type
          type={field.type === 'url' ? 'url' : field.type === 'password' ? 'password' : 'text'}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-background text-foreground border-input placeholder:text-muted-foreground/50 focus-visible:ring-ring font-medium text-sm"
        />
      )}

      {field.helpText && (
        <p className="text-xs text-muted-foreground/80 font-medium mt-1 leading-normal px-0.5">
          ℹ️ {field.helpText}
        </p>
      )}
    </div>
  );
}

