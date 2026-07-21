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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="tagName">Tag name</Label>
          <Input
            id="tagName"
            placeholder="e.g. Marketing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-1">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full border-2 transition ${
                  color === c ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <Button onClick={handleCreate} disabled={pending || !name.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {initialTags.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No tags yet. Create one to label your QR codes.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {initialTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5"
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-sm font-medium">{tag.name}</span>
              {tag._count && (
                <span className="text-xs text-muted-foreground">({tag._count.qrCodes})</span>
              )}
              <button
                onClick={() => handleDelete(tag.id, tag.name)}
                className="ml-1 text-muted-foreground hover:text-destructive"
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
