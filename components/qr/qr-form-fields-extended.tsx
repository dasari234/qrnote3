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
    <div className="space-y-6">
      {/* Existing QR Type Fields */}
      <div className="space-y-4">
        {typeDef.fields.map((field: any) => (
          <FieldInput
            key={field.key}
            field={field}
            value={payload[field.key] || ''}
            onChange={(v) => onChange(field.key, v)}
          />
        ))}
      </div>

      {/* Vanity Slug Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Custom Link (Vanity Slug)</CardTitle>
              <CardDescription>Use a memorable short code instead of random</CardDescription>
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
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., my-promo, summer2024"
                value={shortCode || ''}
                onChange={(e) => onShortCodeChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                maxLength={32}
                className="flex-1"
              />
              {suggestedShortCode && !shortCode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onShortCodeChange(suggestedShortCode)}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Use suggested
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Format: letters, numbers, hyphens only • Max 32 characters
            </p>
          </CardContent>
        )}
      </Card>

      {/* Expiry Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">QR Code Expiry</CardTitle>
              <CardDescription>Automatically deactivate on a specific date</CardDescription>
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
          <CardContent>
            <Input
              type="date"
              value={expiresAt.split('T')[0]}
              onChange={(e) => onExpiryChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              After this date, scans will see a "QR code expired" message
            </p>
          </CardContent>
        )}
      </Card>

      {/* A/B Testing Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">A/B Testing</CardTitle>
              <CardDescription>Create test variants to measure performance</CardDescription>
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
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-name">Test Name</Label>
              <Input
                id="test-name"
                placeholder="e.g., Homepage CTA Test"
                value={testName || ''}
                onChange={(e) => onTestNameChange(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="variant">This QR is variant:</Label>
              <Select
                value={variant || 'A'}
                onValueChange={(v) => onVariantChange(v)}
              >
                <SelectTrigger id="variant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Variant A</SelectItem>
                  <SelectItem value="B">Variant B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400">
              <AlertCircle className="mb-1 inline h-4 w-4" />
              {' '}
              Variants in the same test are tracked separately for comparison
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
    <div className="space-y-2">
      <Label htmlFor={field.key}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {field.type === 'textarea' ? (
        <Textarea
          id={field.key}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'select' ? (
        <Select value={value || field.options?.[0]?.value} onValueChange={onChange}>
          <SelectTrigger id={field.key}>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt: any) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={field.key}
          type={field.type === 'url' ? 'url' : field.type === 'password' ? 'text' : 'text'}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
