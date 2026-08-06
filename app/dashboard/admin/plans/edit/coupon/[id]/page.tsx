import { prisma } from '@/lib/prisma';
import { updateCouponAction } from '@/lib/admin/billing-actions';
import Link from 'next/link';

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return <div>Coupon not found</div>;

  // For fixed coupons we show paise as stored (admin UI expects paise for fixed)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Coupon</h1>
        <Link href="/dashboard/admin/plans" className="btn btn-outline">Back</Link>
      </div>

      <div className="border rounded p-4">
        <form action={updateCouponAction} className="space-y-3">
          <input type="hidden" name="id" value={coupon.id} />
          <div>
            <label className="block text-sm">Code</label>
            <input name="code" defaultValue={coupon.code} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="block text-sm">Type</label>
            <select name="type" defaultValue={coupon.type} className="select select-bordered w-full">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Amount (percentage or paise)</label>
            <input name="amount" type="number" defaultValue={coupon.amount} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="block text-sm">Usage Limit</label>
            <input name="usageLimit" type="number" defaultValue={coupon.usageLimit ?? ''} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="block text-sm">Valid From</label>
            <input name="validFrom" type="date" defaultValue={coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0,10) : ''} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="block text-sm">Valid Until</label>
            <input name="validUntil" type="date" defaultValue={coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0,10) : ''} className="input input-bordered w-full" />
          </div>
          <div className="flex items-center gap-2">
            <input id="active" name="active" type="checkbox" defaultChecked={coupon.active} />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>

          <div>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
