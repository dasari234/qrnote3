import { prisma } from '@/lib/prisma';
import { createPlanAction, deletePlanAction, createCouponAction, deleteCouponAction } from '@/lib/admin/billing-actions';
import Link from 'next/link';
import DeleteConfirm from '@/components/admin/DeleteConfirm';

export default async function AdminPlansPage() {
  const [plans, coupons] = await Promise.all([
    prisma.plan.findMany({ where: { deletedAt: null }, orderBy: { price: 'asc' } }),
    prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing (Admin)</h1>
        <Link href="/dashboard/admin" className="btn btn-outline">Admin</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold">Create Plan</h2>
          <form action={createPlanAction} className="mt-3 space-y-2">
            <div>
              <label className="block text-sm">Name</label>
              <input name="name" className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm">Price (₹)</label>
              <input name="price" type="number" step="0.01" placeholder="e.g., 149.99" className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm">Currency</label>
              <input name="currency" defaultValue="INR" className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm">Description</label>
              <input name="description" className="input input-bordered w-full" />
            </div>
            <div>
              <button type="submit" className="btn btn-primary mt-2">Create Plan</button>
            </div>
          </form>
        </div>

        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold">Create Coupon</h2>
          <form action={createCouponAction} className="mt-3 space-y-2">
            <div>
              <label className="block text-sm">Code</label>
              <input name="code" className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm">Type</label>
              <select name="type" className="select select-bordered w-full">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Amount (percentage or paise)</label>
              <input name="amount" type="number" className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm">Usage Limit</label>
              <input name="usageLimit" type="number" className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm">Valid From</label>
              <input name="validFrom" type="date" className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm">Valid Until</label>
              <input name="validUntil" type="date" className="input input-bordered w-full" />
            </div>
            <div>
              <button type="submit" className="btn btn-primary mt-2">Create Coupon</button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h3 className="text-lg font-medium">Plans</h3>
          <div className="mt-3 space-y-2">
            {plans.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">₹{(p.price/100).toFixed(2)} • {p.currency}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/admin/plans/edit/plan/${p.id}`} className="btn btn-sm">Edit</Link>
                  <form id={`delete-plan-${p.id}`} action={deletePlanAction} method="post">
                    <input type="hidden" name="id" value={p.id} />
                    <DeleteConfirm formId={`delete-plan-${p.id}`} itemName={p.name} itemType="plan" />
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded p-4">
          <h3 className="text-lg font-medium">Coupons</h3>
          <div className="mt-3 space-y-2">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-semibold">{c.code}</div>
                  <div className="text-sm text-muted-foreground">{c.type} • {c.type === 'percentage' ? `${c.amount}%` : `₹${(c.amount/100).toFixed(2)}`}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/admin/plans/edit/coupon/${c.id}`} className="btn btn-sm">Edit</Link>
                  <form id={`delete-coupon-${c.id}`} action={deleteCouponAction} method="post">
                    <input type="hidden" name="id" value={c.id} />
                    <DeleteConfirm formId={`delete-coupon-${c.id}`} itemName={c.code} itemType="coupon" />
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
