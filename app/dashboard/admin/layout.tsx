import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireSuperAdmin } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in?redirect=/dashboard/admin');

  try {
    await requireSuperAdmin(user.id);
  } catch {
    redirect('/dashboard');
  }

  return <AdminShell>{children}</AdminShell>;
}
