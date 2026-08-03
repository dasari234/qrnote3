import { prisma } from '@/lib/prisma';

export default async function ApiKeysPage() {
  // Client-side could fetch via /api/apikeys/list
  const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">API Keys</h1>
      <div className="space-y-2">
        {keys.map(k => (
          <div key={k.id} className="border rounded p-3">
            <div className="font-medium">{k.description || '—'}</div>
            <div className="text-sm text-muted-foreground">Created: {new Date(k.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
