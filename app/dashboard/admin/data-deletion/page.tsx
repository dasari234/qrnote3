import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { adminApproveDeletion, adminRejectDeletion } from '@/lib/admin/data-actions';

export default async function AdminDataDeletionPage() {
  const requests = await prisma.dataDeletionRequest.findMany({ orderBy: { requestedAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Deletion Requests</h1>
        <Link href="/dashboard/admin" className="btn btn-outline">Admin</Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((r) => (
          <div key={r.id} className="border rounded p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{r.requesterEmail}</div>
                <div className="text-sm text-muted-foreground">Requested at: {new Date(r.requestedAt).toLocaleString()}</div>
                <div className="text-sm">Status: {r.status}</div>
                {r.note && <div className="mt-2 text-sm">Note: {r.note}</div>}
              </div>
              <div className="flex flex-col gap-2">
                {r.status === 'pending' ? (
                  <>
                    <form action={adminApproveDeletion} method="post">
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="btn btn-sm btn-primary">Approve & Delete</button>
                    </form>
                    <form action={adminRejectDeletion} method="post">
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="btn btn-sm btn-outline">Reject</button>
                    </form>
                  </>
                ) : (
                  <div className="text-sm">Processed at: {r.processedAt ? new Date(r.processedAt).toLocaleString() : '—'}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
