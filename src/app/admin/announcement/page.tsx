import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { getAnnouncements } from '@/content/resolve';
import { getStaff } from '@/lib/supabase/auth';
import { AnnouncementEditor } from './AnnouncementEditor';

export const dynamic = 'force-dynamic';

export default async function AnnouncementPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const announcements = await getAnnouncements();
  const current = announcements[0] ?? null;

  return (
    <AdminShell
      role={staff.role}
      name={staff.name}
      email={staff.user.email ?? ''}
      title="Announcement bar"
      description="The thin strip across the very top of every page. Use it for a special, an event, or a temporary notice — and switch it off when it is over."
    >
      <AnnouncementEditor announcement={current} />
    </AdminShell>
  );
}
