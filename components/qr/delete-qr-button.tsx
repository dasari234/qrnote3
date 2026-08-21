'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { deleteQrCode } from '@/lib/qr/actions';
import { Loader2, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';

export function DeleteQrButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteQrCode(id);
        setIsOpen(false);
      } catch (error) {
        alert('Failed to delete QR code');
      }
    });
  };

  return (
    // The wrapping div stops click bubbles from triggering the parent card Link
    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </DialogTrigger>

        <DialogContent
          className="sm:max-w-md"
          // Crucial: stops modal background clicks or drag dismissals from bubbling to Next.js Links
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Delete this QR code?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The QR code will be permanently
              removed and its traffic redirects will stop.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleConfirmDelete}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete QR Code'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
