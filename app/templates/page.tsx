import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Link href="/templates/create" className="btn">Create</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="border rounded p-4">
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-muted-foreground">{t.description}</div>
            <div className="mt-3">
              <Link href={`/templates/${t.id}`} className="btn btn-sm btn-outline">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
