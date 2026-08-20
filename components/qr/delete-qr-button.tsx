'use client';

import { Button } from '@/components/ui/button';
import { deleteQrCode } from '@/lib/qr/actions';
import { Loader2, Trash2 } from 'lucide-react';
import { useTransition } from 'react';

export function DeleteQrButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop click from triggering the parent <Link>
    e.stopPropagation();

    if (confirm('Are you sure you want to delete this QR code?')) {
      startTransition(async () => {
        try {
          await deleteQrCode(id);
        } catch (error) {
          alert('Failed to delete QR code');
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15"
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
