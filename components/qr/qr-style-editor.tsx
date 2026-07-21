'use client';

import { QrTemplatePicker } from '@/components/qr/qr-template-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CornerDotType, CornerSquareType, DotType, GradientType, QRStyle } from '@/lib/types';
import { Upload, X } from 'lucide-react';

interface QrStyleEditorProps {
  style: QRStyle;
  onChange: (style: QRStyle) => void;
}

const FG_PRESET_COLORS = [
  '#000000',
  '#1e40af',
  '#059669',
  '#dc2626',
  '#d97706',
  '#0f766e',
  '#be185d',
  '#7c3aed',
];

const BG_PRESET_COLORS = [
  '#ffffff',
  '#f8fafc',
  '#fef3c7',
  '#dbeafe',
  '#dcfce7',
  '#fce7f3',
  '#0f172a',
  '#fffbeb',
];

const GRADIENT_PRESETS: { label: string; c1: string; c2: string; type: GradientType }[] = [
  { label: 'Ocean', c1: '#0ea5e9', c2: '#1e3a8a', type: 'diagonal' },
  { label: 'Emerald', c1: '#10b981', c2: '#065f46', type: 'vertical' },
  { label: 'Sunset', c1: '#f59e0b', c2: '#dc2626', type: 'diagonal' },
  { label: 'Plum', c1: '#ec4899', c2: '#7c3aed', type: 'radial' },
  { label: 'Coral', c1: '#fb7185', c2: '#f97316', type: 'diagonal' },
  { label: 'Frost', c1: '#60a5fa', c2: '#0c4a6e', type: 'vertical' },
];

const DOT_TYPES: { label: string; value: DotType }[] = [
  { label: 'Square', value: 'square' },
  { label: 'Rounded', value: 'rounded' },
  { label: 'Dots', value: 'dots' },
  { label: 'Classy', value: 'classy' },
  { label: 'Classy Rounded', value: 'classy-rounded' },
  { label: 'Extra Rounded', value: 'extra-rounded' },
];

const CORNER_SQUARE_TYPES: { label: string; value: CornerSquareType }[] = [
  { label: 'Square', value: 'square' },
  { label: 'Dot', value: 'dot' },
  { label: 'Extra Rounded', value: 'extra-rounded' },
];

const CORNER_DOT_TYPES: { label: string; value: CornerDotType }[] = [
  { label: 'Square', value: 'square' },
  { label: 'Dot', value: 'dot' },
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

  const isGradient = (style.gradientType || 'solid') !== 'solid';

  return (
    <div className="space-y-4">
      <Tabs defaultValue="templates">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <QrTemplatePicker
            selectedId={style.templateId}
            onSelect={(templateId, templateStyle) =>
              onChange({ ...templateStyle, templateId, logoUrl: style.logoUrl })
            }
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-4 space-y-5">
          {/* Color mode */}
          <div className="space-y-2">
            <Label>Color mode</Label>
            <Select
              value={style.gradientType || 'solid'}
              onValueChange={(v) => onChange({ ...style, gradientType: v as GradientType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid color</SelectItem>
                <SelectItem value="vertical">Vertical gradient</SelectItem>
                <SelectItem value="horizontal">Horizontal gradient</SelectItem>
                <SelectItem value="diagonal">Diagonal gradient</SelectItem>
                <SelectItem value="radial">Radial gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Colors */}
          {isGradient ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Gradient presets</Label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENT_PRESETS.map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...style,
                          gradientType: g.type,
                          gradientColor1: g.c1,
                          gradientColor2: g.c2,
                        })
                      }
                      className="h-8 w-8 rounded-full border-2 border-transparent transition hover:scale-110"
                      style={{
                        background:
                          g.type === 'radial'
                            ? `radial-gradient(circle, ${g.c1}, ${g.c2})`
                            : `linear-gradient(${
                                g.type === 'vertical'
                                  ? 'to bottom'
                                  : g.type === 'horizontal'
                                  ? 'to right'
                                  : '45deg'
                              }, ${g.c1}, ${g.c2})`,
                      }}
                      title={g.label}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color 1</Label>
                  <Input
                    type="color"
                    value={style.gradientColor1 || '#0ea5e9'}
                    onChange={(e) => onChange({ ...style, gradientColor1: e.target.value })}
                    className="h-9 w-full cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color 2</Label>
                  <Input
                    type="color"
                    value={style.gradientColor2 || '#1e3a8a'}
                    onChange={(e) => onChange({ ...style, gradientColor2: e.target.value })}
                    className="h-9 w-full cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Foreground</Label>
                <div className="flex flex-wrap gap-1">
                  {FG_PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChange({ ...style, fgColor: c })}
                      className={`h-7 w-7 rounded-full border-2 transition ${
                        (style.fgColor || '#000000') === c
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent'
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
                  {BG_PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChange({ ...style, bgColor: c })}
                      className={`h-7 w-7 rounded-full border-2 transition ${
                        (style.bgColor || '#ffffff') === c
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent'
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
          )}

          {/* Dot pattern */}
          <div className="space-y-2">
            <Label>Dot pattern</Label>
            <Select
              value={style.dotsType || 'square'}
              onValueChange={(v) => onChange({ ...style, dotsType: v as DotType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOT_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Corner styles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Corner square</Label>
              <Select
                value={style.cornerSquareType || 'square'}
                onValueChange={(v) =>
                  onChange({ ...style, cornerSquareType: v as CornerSquareType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORNER_SQUARE_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Corner dot</Label>
              <Select
                value={style.cornerDotType || 'square'}
                onValueChange={(v) => onChange({ ...style, cornerDotType: v as CornerDotType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORNER_DOT_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
