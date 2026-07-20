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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new folder</DialogTitle>
              <DialogDescription>Organize your QR codes into folders</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder name</Label>
              <Input
                id="folderName"
                placeholder="e.g. Summer Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
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
              className="flex items-center justify-between rounded-lg border p-4"
            >
              {editingId === folder.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(folder.id)}
                    className="h-8"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleRename(folder.id)} disabled={pending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-semibold">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {folder._count?.qrCodes ?? 0} QR codes
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingId(folder.id);
                        setEditName(folder.name);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(folder.id, folder.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
