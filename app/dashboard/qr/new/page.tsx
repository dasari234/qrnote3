import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { QrCreateForm } from '@/components/qr/qr-create-form';

export default async function NewQrPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?redirect=/dashboard/qr/new');

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { orgId: true },
  });
  const orgIds = memberships.map((m) => m.orgId);

  const workspaces = await prisma.workspace.findMany({
    where: { orgId: { in: orgIds } },
    select: { id: true, name: true },
  });
  const wsIds = workspaces.map((w) => w.id);

  const workspace = workspaces[0];
  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold">No workspace available</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account needs a workspace before you can create QR codes.
        </p>
      </div>
    );
  }

  const [folders, tags] = await Promise.all([
    prisma.folder.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true },
    }),
    prisma.tag.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true, color: true },
    }),
  ]);

  return (
    <QrCreateForm
      workspaceId={workspace.id}
      folders={folders}
      tags={tags}
    />
  );
}
