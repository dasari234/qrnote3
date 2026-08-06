// Updated Prisma additions for coupons, plan trial & workspace billing are in a separate migration; this file is not the schema.
// lib/entitlements.ts — helper to check feature flags / plan entitlements
import { prisma } from '@/lib/prisma';

export async function planHasFeature(planId: string, featureKey: string): Promise<boolean> {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return false;
  // featureFlags stored as JSON object { featureKey: true }
  const flags: any = (plan as any).featureFlags || {};
  return !!flags[featureKey];
}

export async function workspaceHasSeats(workspaceId: string, seatsNeeded: number): Promise<boolean> {
  const billing = await prisma.workspaceBilling.findUnique({ where: { workspaceId } });
  if (!billing) return false;
  return billing.seats >= seatsNeeded;
}
