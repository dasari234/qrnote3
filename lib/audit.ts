import { prisma } from '@/lib/prisma';

export async function logAudit(actorId: string | null, action: 'create' | 'update' | 'delete', entityType: string, entityId: string | null, changes?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        entityType,
        entityId: entityId || null,
        changes: changes ? changes : undefined,
      },
    });
  } catch (e) {
    // Do not block main flow on audit failures
    console.error('audit log failed', e);
  }
}
