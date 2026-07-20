'use client';

import { QRStyle } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X } from 'lucide-react';

interface QrStyleEditorProps {
  style: QRStyle;
  onChange: (style: QRStyle) => void;
}

const PRESET_COLORS = [
  '#000000',
  '#1e40af',
  '#059669',
  '#dc2626',
  '#d97706',
  '#7c3aed',
  '#0f766e',
  '#be185d',
];

export function QrStyleEditor({ style, onChange }: QrStyleEditorProps) {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...style, logoUrl: reader.result as string, errorCorrection: 'H' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Foreground</Label>
          <div className="flex flex-wrap gap-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ ...style, fgColor: c })}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  (style.fgColor || '#000000') === c ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Input
            type="color"
            value={style.fgColor || '#000000'}
            onChange={(e) => onChange({ ...style, fgColor: e.target.value })}
            className="h-9 w-full cursor-pointer"
          />
        </div>
        <div className="space-y-2">
          <Label>Background</Label>
          <div className="flex flex-wrap gap-1">
            {['#ffffff', '#f8fafc', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ ...style, bgColor: c })}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  (style.bgColor || '#ffffff') === c ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Input
            type="color"
            value={style.bgColor || '#ffffff'}
            onChange={(e) => onChange({ ...style, bgColor: e.target.value })}
            className="h-9 w-full cursor-pointer"
          />
        </div>
      </div>

      {/* Error correction */}
      <div className="space-y-2">
        <Label>Error correction level</Label>
        <Select
          value={style.errorCorrection || 'M'}
          onValueChange={(v) => onChange({ ...style, errorCorrection: v as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">Low (7%) — more data capacity</SelectItem>
            <SelectItem value="M">Medium (15%) — recommended</SelectItem>
            <SelectItem value="Q">Quartile (25%) — good with logo</SelectItem>
            <SelectItem value="H">High (30%) — best with logo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo (center image)</Label>
        {style.logoUrl ? (
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-lg border bg-white p-1">
              <img src={style.logoUrl} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const { logoUrl, ...rest } = style;
                onChange(rest);
              }}
            >
              <X className="mr-1 h-3 w-3" /> Remove
            </Button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground hover:bg-accent/50">
            <Upload className="mr-2 h-4 w-4" />
            Upload logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </label>
        )}
      </div>

      {/* Frame */}
      <div className="space-y-2">
        <Label>Frame style</Label>
        <Select
          value={style.frame || 'none'}
          onValueChange={(v) => onChange({ ...style, frame: v as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No frame</SelectItem>
            <SelectItem value="rounded">Rounded border</SelectItem>
            <SelectItem value="border">Solid border</SelectItem>
            <SelectItem value="caption">Caption frame</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {style.frame && style.frame !== 'none' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Frame color</Label>
            <Input
              type="color"
              value={style.frameColor || '#000000'}
              onChange={(e) => onChange({ ...style, frameColor: e.target.value })}
              className="h-9 w-full cursor-pointer"
            />
          </div>
          {style.frame === 'caption' && (
            <div className="space-y-2">
              <Label>Caption text</Label>
              <Input
                value={style.caption || ''}
                onChange={(e) => onChange({ ...style, caption: e.target.value })}
                placeholder="Scan me"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
