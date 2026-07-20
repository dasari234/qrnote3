import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { QrEditForm } from '@/components/qr/qr-edit-form';
import { PerQrAnalytics } from '@/components/qr/qr-analytics';

export default async function QrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; 
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const qr = await prisma.qrCode.findUnique({
    where: { id: id },
    include: { tags: true, folder: true },
  });

  if (!qr) notFound();

  // Verify the user has access to this QR's workspace
  const workspace = await prisma.workspace.findUnique({
    where: { id: qr.workspaceId },
    include: {
      org: { include: { members: { where: { userId: user.id } } } },
    },
  });
  if (!workspace || workspace.org.members.length === 0) notFound();

  const [folders, tags] = await Promise.all([
    prisma.folder.findMany({
      where: { workspaceId: qr.workspaceId },
      select: { id: true, name: true },
    }),
    prisma.tag.findMany({
      where: { workspaceId: qr.workspaceId },
      select: { id: true, name: true, color: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <QrEditForm
        qr={qr}
        folders={folders}
        tags={tags}
        selectedTagIds={qr.tags.map((t) => t.id)}
      />
      <PerQrAnalytics qrId={qr.id} totalScans={qr.scanCount} />
    </div>
  );
}
