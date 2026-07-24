'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createFolder, renameFolder, deleteFolder } from '@/lib/qr/folder-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FolderPlus, Trash2, Pencil } from 'lucide-react';

interface FolderManagerProps {
  workspaceId: string;
  folders: { id: string; name: string; _count?: { qrCodes: number } }[];
}

export function FolderManager({ workspaceId, folders: initialFolders }: FolderManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [pending, start] = useTransition();

  const handleCreate = () => {
    if (!name.trim()) return;
    start(async () => {
      try {
        await createFolder({ workspaceId, name: name.trim() });
        toast.success('Folder created');
        setName('');
        setOpen(false);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    start(async () => {
      try {
        await renameFolder(id, editName.trim());
        toast.success('Folder renamed');
        setEditingId(null);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete folder "${name}"? QR codes inside will be unfiled, not deleted.`)) return;
    start(async () => {
      try {
        await deleteFolder(id);
        toast.success('Folder deleted');
        router.refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card text-card-foreground border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create new folder</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Organize your QR codes into folders
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="folderName" className="text-foreground">Folder name</Label>
              <Input
                id="folderName"
                placeholder="e.g. Summer Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="bg-background text-foreground border-input placeholder:text-muted-foreground/60 focus-visible:ring-ring"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setOpen(false)} className="hover:bg-accent hover:text-accent-foreground">
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={pending || !name.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {initialFolders.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No folders yet. Create one to organize your QR codes.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {initialFolders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card/50 dark:bg-muted/10 p-4 transition-all hover:border-muted-foreground/20 hover:shadow-sm"
            >
              {editingId === folder.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(folder.id)}
                    className="h-8 bg-background text-foreground border-input focus-visible:ring-ring"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleRename(folder.id)} disabled={pending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="hover:bg-accent hover:text-accent-foreground">
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      📁 {folder._count?.qrCodes ?? 0} QR codes
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                      onClick={() => {
                        setEditingId(folder.id);
                        setEditName(folder.name);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Rename folder</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(folder.id, folder.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete folder</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
