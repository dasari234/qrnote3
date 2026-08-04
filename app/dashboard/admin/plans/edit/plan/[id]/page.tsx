import { prisma } from '@/lib/prisma';
import { updatePlanAction } from '@/lib/admin/billing-actions';
import Link from 'next/link';

export default async function EditPlanPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const plan = await prisma.plan.findFirst({ where: { id, deletedAt: null } });
  if (!plan) return <div>Plan not found</div>;

  const priceRupees = (plan.price / 100).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Plan</h1>
        <Link href="/dashboard/admin/plans" className="btn btn-outline">Back</Link>
      </div>

      <div className="border rounded p-4">
        <form action={updatePlanAction} className="space-y-3">
          <input type="hidden" name="id" value={plan.id} />
          <div>
            <label className="block text-sm">Name</label>
            <input name="name" defaultValue={plan.name} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="block text-sm">Price (₹)</label>
            <input name="price" type="number" step="0.01" defaultValue={priceRupees} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="block text-sm">Currency</label>
            <input name="currency" defaultValue={plan.currency} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <input name="description" defaultValue={plan.description || ''} className="input input-bordered w-full" />
          </div>

          <div>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
