import { prisma } from '@/lib/prisma';

export default async function TemplateDetail({ params }: { params: { id: string } }) {
  const t = await prisma.template.findUnique({ where: { id: params.id } });
  if (!t) return <div>Template not found</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <div className="text-sm text-muted-foreground">{t.description}</div>
      <pre className="mt-3 overflow-auto">{JSON.stringify(t.content, null, 2)}</pre>
    </div>
  );
}
