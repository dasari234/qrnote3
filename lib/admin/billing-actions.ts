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
  // Price is entered in rupees on the form (e.g., 149.99). Convert to paise.
  const priceRaw = String(formData.get('price') || '0');
  const currency = String(formData.get('currency') || 'INR');
  const description = String(formData.get('description') || '');

  if (!name) throw new Error('Name is required');

  // Normalize comma separators and parse float
  const normalized = priceRaw.replace(/[,\s]/g, '');
  const priceFloat = parseFloat(normalized);
  if (Number.isNaN(priceFloat) || priceFloat < 0) throw new Error('Invalid price');

  const pricePaise = Math.round(priceFloat * 100);

  await prisma.plan.create({ data: { name, price: pricePaise, currency, description } });
}

export async function updatePlanAction(formData: FormData) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '');
  const priceRaw = String(formData.get('price') || '0');
  const currency = String(formData.get('currency') || 'INR');
  const description = String(formData.get('description') || '');

  if (!id) throw new Error('Plan id is required');
  if (!name) throw new Error('Name is required');

  const normalized = priceRaw.replace(/[,\s]/g, '');
  const priceFloat = parseFloat(normalized);
  if (Number.isNaN(priceFloat) || priceFloat < 0) throw new Error('Invalid price');

  const pricePaise = Math.round(priceFloat * 100);

  await prisma.plan.update({ where: { id }, data: { name, price: pricePaise, currency, description } });
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

export async function updateCouponAction(formData: FormData) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const id = String(formData.get('id') || '');
  const code = String(formData.get('code') || '').toUpperCase();
  const type = String(formData.get('type') || 'percentage');
  const amount = Number(formData.get('amount') || 0);
  const usageLimit = formData.get('usageLimit') ? Number(formData.get('usageLimit')) : null;
  const validFrom = formData.get('validFrom') ? new Date(String(formData.get('validFrom'))) : null;
  const validUntil = formData.get('validUntil') ? new Date(String(formData.get('validUntil'))) : null;
  const active = formData.get('active') === 'on' || formData.get('active') === 'true' ? true : false;

  if (!id) throw new Error('Coupon id required');
  if (!code || !type) throw new Error('code and type required');

  await prisma.coupon.update({
    where: { id },
    data: { code, type, amount: Math.floor(amount), usageLimit, validFrom, validUntil, active },
  });
}

export async function deleteCouponAction(formData: FormData) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const id = String(formData.get('id') || '');
  if (!id) throw new Error('id required');
  await prisma.coupon.delete({ where: { id } });
}
