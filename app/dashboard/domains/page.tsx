import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function DomainsPage() {
  const domains = await prisma.customDomain.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Custom Domains</h1>
        <Link href="/dashboard/billing" className="btn btn-outline">Billing</Link>
      </div>

      <div className="space-y-4">
        {domains.map((d) => (
          <div key={d.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{d.domain}</div>
              <div className="text-sm text-muted-foreground">Verified: {d.verified ? 'Yes' : 'No'}</div>
            </div>
            <div>
              {!d.verified && <div className="text-sm">Add TXT: qrnote-verification={d.verificationToken}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
