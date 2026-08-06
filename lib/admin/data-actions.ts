import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function requestDataDeletion(email: string, ip: string | null, note?: string) {
  const salt = process.env.IP_HASH_SALT || '';
  const ipHash = ip ? crypto.createHash('sha256').update(ip + salt).digest('hex') : null;
  return prisma.dataDeletionRequest.create({
    data: {
      requesterEmail: email,
      requesterIpHash: ipHash,
      note,
    },
  });
}

export async function adminApproveDeletion(formData: FormData) {
  'use server';
  const { prisma } = await import('@/lib/prisma');
  const { createServerSupabaseClient } = await import('@/lib/supabase/server');
  const { requireSuperAdmin } = await import('@/lib/rbac');
  const { logAudit } = await import('@/lib/audit');

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated.');
  await requireSuperAdmin(user.id);

  const id = String(formData.get('id') || '');
  if (!id) throw new Error('id required');

  const req = await prisma.dataDeletionRequest.findUnique({ where: { id } });
  if (!req) throw new Error('Request not found');
  if (req.status !== 'pending') throw new Error('Request already processed');

  // Delete leads matching the requester email
  const deletedLeads = await prisma.customerLead.deleteMany({ where: { email: req.requesterEmail } });

  // Mark request processed
  await prisma.dataDeletionRequest.update({ where: { id }, data: { status: 'approved', processedAt: new Date(), processedBy: user.id } });

  await logAudit(user.id, 'delete', 'CustomerLead', null, { requesterEmail: req.requesterEmail, deletedCount: deletedLeads.count });
}

export async function adminRejectDeletion(formData: FormData) {
  'use server';
  const { prisma } = await import('@/lib/prisma');
  const { createServerSupabaseClient } = await import('@/lib/supabase/server');
  const { requireSuperAdmin } = await import('@/lib/rbac');

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated.');
  await requireSuperAdmin(user.id);

  const id = String(formData.get('id') || '');
  if (!id) throw new Error('id required');

  const req = await prisma.dataDeletionRequest.findUnique({ where: { id } });
  if (!req) throw new Error('Request not found');
  if (req.status !== 'pending') throw new Error('Request already processed');

  await prisma.dataDeletionRequest.update({ where: { id }, data: { status: 'rejected', processedAt: new Date(), processedBy: user.id } });
}
