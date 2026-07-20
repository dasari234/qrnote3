import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { FolderManager } from '@/components/qr/folder-manager';
import { TagManager } from '@/components/qr/tag-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder as FolderIcon, Tag } from 'lucide-react';

export default async function FoldersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { orgId: true },
  });
  const orgIds = memberships.map((m) => m.orgId);

  const workspaces = await prisma.workspace.findMany({
    where: { orgId: { in: orgIds } },
    select: { id: true },
  });
  const wsIds = workspaces.map((w) => w.id);
  const workspaceId = wsIds[0] || '';

  const [folders, tags] = await Promise.all([
    wsIds.length > 0
      ? prisma.folder.findMany({
          where: { workspaceId: { in: wsIds } },
          include: { _count: { select: { qrCodes: true } } },
          orderBy: { createdAt: 'desc' },
        })
      : [],
    wsIds.length > 0
      ? prisma.tag.findMany({
          where: { workspaceId: { in: wsIds } },
          include: { _count: { select: { qrCodes: true } } },
          orderBy: { createdAt: 'desc' },
        })
      : [],
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Folders & Tags</h1>
        <p className="text-sm text-muted-foreground">
          Organize and label your QR codes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderIcon className="h-5 w-5" /> Folders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FolderManager workspaceId={workspaceId} folders={folders} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5" /> Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagManager workspaceId={workspaceId} tags={tags} />
        </CardContent>
      </Card>
    </div>
  );
}
