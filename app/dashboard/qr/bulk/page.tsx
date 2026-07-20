import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { BulkImport } from '@/components/qr/bulk-import';

export default async function BulkImportPage() {
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

  const workspaceId = workspaces[0]?.id || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bulk Import</h1>
        <p className="text-sm text-muted-foreground">
          Create multiple QR codes at once from a CSV file
        </p>
      </div>

      <BulkImport workspaceId={workspaceId} />
    </div>
  );
}
