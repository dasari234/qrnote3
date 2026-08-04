'use server';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireSuperAdmin } from '@/lib/rbac';

async function getAuthUserId(): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated.');
  return user.id;
}

export async function createPlanAction(formData: FormData) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const name = String(formData.get('name') || '');
  const price = Number(formData.get('price') || 0);
  const currency = String(formData.get('currency') || 'INR');
  const description = String(formData.get('description') || '');

  if (!name || !price) throw new Error('Name and price are required');

  await prisma.plan.create({ data: { name, price: Math.floor(price), currency, description } });
}

export async function deletePlanAction(formData: FormData) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const id = String(formData.get('id') || '');
  if (!id) throw new Error('id required');

  await prisma.plan.delete({ where: { id } });
}

export async function createCouponAction(formData: FormData) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const code = String(formData.get('code') || '').toUpperCase();
  const type = String(formData.get('type') || 'percentage');
  const amount = Number(formData.get('amount') || 0);
  const usageLimit = formData.get('usageLimit') ? Number(formData.get('usageLimit')) : null;
  const validFrom = formData.get('validFrom') ? new Date(String(formData.get('validFrom'))) : null;
  const validUntil = formData.get('validUntil') ? new Date(String(formData.get('validUntil'))) : null;

  if (!code || !type) throw new Error('code and type required');

  await prisma.coupon.create({
    data: { code, type, amount: Math.floor(amount), usageLimit, validFrom, validUntil, active: true },
  });
}

export async function deleteCouponAction(formData: FormData) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const id = String(formData.get('id') || '');
  if (!id) throw new Error('id required');
  await prisma.coupon.delete({ where: { id } });
}
