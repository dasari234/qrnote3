'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTag, deleteTag } from '@/lib/qr/folder-actions';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

const TAG_COLORS = [
  '#6b7280',
  '#1e40af',
  '#059669',
  '#dc2626',
  '#d97706',
  '#7c3aed',
  '#0f766e',
  '#be185d',
];

interface TagManagerProps {
  workspaceId: string;
  tags: { id: string; name: string; color: string; _count?: { qrCodes: number } }[];
}

export function TagManager({ workspaceId, tags: initialTags }: TagManagerProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [pending, start] = useTransition();

  const handleCreate = () => {
    if (!name.trim()) return;
    start(async () => {
      try {
        await createTag({ workspaceId, name: name.trim(), color });
        toast.success('Tag created');
        setName('');
        router.refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    start(async () => {
      try {
        await deleteTag(id);
        toast.success('Tag deleted');
        router.refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <div className="space-y-6 text-foreground">
      {/* Input panel container wrapper */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end bg-muted/20 dark:bg-muted/10 p-4 rounded-xl border border-border transition-colors">
        <div className="flex-1 space-y-2">
          <Label htmlFor="tagName" className="text-foreground font-medium">Tag name</Label>
          <Input
            id="tagName"
            placeholder="e.g. Marketing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="bg-background text-foreground border-input placeholder:text-muted-foreground/50 focus-visible:ring-ring transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Color</Label>
          <div className="flex flex-wrap gap-1.5 h-10 items-center">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                // Fix: Modified swatch ring borders to remain crisp and distinct on pure dark backgrounds
                className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${color === c
                    ? 'border-primary ring-2 ring-primary/40 scale-105'
                    : 'border-background dark:border-muted-foreground/30 hover:border-muted-foreground'
                  }`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <Button onClick={handleCreate} disabled={pending || !name.trim()} className="w-full sm:w-auto shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {initialTags.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground font-medium">
          No tags yet. Create one to label your QR codes.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {initialTags.map((tag) => (
            <div
              key={tag.id}
              // Fix: Added explicit dark fallback layer parameters to prevent dark tags from fading into dark views
              className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 transition-all text-foreground hover:border-muted-foreground/30 dark:bg-muted/20"
              style={{
                borderColor: `${tag.color}40`,
              }}
            >
              <span
                className="inline-block h-3 w-3 rounded-full flex-shrink-0 shadow-sm border border-black/10 dark:border-white/10"
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-sm font-semibold leading-none">{tag.name}</span>
              {tag._count && (
                <span className="text-xs text-muted-foreground font-mono font-medium">({tag._count.qrCodes})</span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(tag.id, tag.name)}
                className="ml-1 text-muted-foreground hover:text-destructive transition-colors focus:outline-none focus:ring-1 focus:ring-ring rounded-full p-0.5"
                aria-label={`Delete tag ${tag.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
