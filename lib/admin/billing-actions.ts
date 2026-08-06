'use server';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireSuperAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

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

  const plan = await prisma.plan.create({ data: { name, price: pricePaise, currency, description } });

  await logAudit(actorId, 'create', 'Plan', plan.id, { name, price: pricePaise, currency, description });
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

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) throw new Error('Plan not found');

  const normalized = priceRaw.replace(/[,\s]/g, '');
  const priceFloat = parseFloat(normalized);
  if (Number.isNaN(priceFloat) || priceFloat < 0) throw new Error('Invalid price');

  const pricePaise = Math.round(priceFloat * 100);

  const updated = await prisma.plan.update({ where: { id }, data: { name, price: pricePaise, currency, description } });

  await logAudit(actorId, 'update', 'Plan', id, { before: existing, after: updated });
}

export async function deletePlanAction(formData: FormData) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const id = String(formData.get('id') || '');
  if (!id) throw new Error('id required');

  // Prevent deletion if there are any orders attached to this plan
  const ordersCount = await prisma.order.count({ where: { planId: id } });
  if (ordersCount > 0) {
    throw new Error('Cannot delete plan with existing orders. Consider disabling or soft-deleting after migrating customers.');
  }

  // Soft-delete by setting deletedAt
  const deleted = await prisma.plan.update({ where: { id }, data: { deletedAt: new Date() } });

  await logAudit(actorId, 'delete', 'Plan', id, { deletedAt: deleted.deletedAt });
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

  const coupon = await prisma.coupon.create({
    data: { code, type, amount: Math.floor(amount), usageLimit, validFrom, validUntil, active: true },
  });

  await logAudit(actorId, 'create', 'Coupon', coupon.id, { code, type, amount: Math.floor(amount), usageLimit, validFrom, validUntil, active: true });
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

  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw new Error('Coupon not found');

  const updated = await prisma.coupon.update({
    where: { id },
    data: { code, type, amount: Math.floor(amount), usageLimit, validFrom, validUntil, active },
  });

  await logAudit(actorId, 'update', 'Coupon', id, { before: existing, after: updated });
}

export async function deleteCouponAction(formData: FormData) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const id = String(formData.get('id') || '');
  if (!id) throw new Error('id required');
  const existing = await prisma.coupon.findUnique({ where: { id } });
  await prisma.coupon.delete({ where: { id } });

  await logAudit(actorId, 'delete', 'Coupon', id, { before: existing });
}
