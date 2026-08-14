import { redirect } from 'next/navigation';
import { AdminShell, Warning } from '@/components/admin/AdminShell';
import { getSiteSettings } from '@/content/resolve';
import { getStaff } from '@/lib/supabase/auth';
import { HoursEditor } from './HoursEditor';

export const dynamic = 'force-dynamic';

export default async function HoursPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const settings = await getSiteSettings();

  return (
    <AdminShell
      role={staff.role}
      name={staff.name}
      email={staff.user.email ?? ''}
      title="Hours"
      description="These hours show in the footer of every page, on the Visit page, and in Google search results."
    >
      {settings.hours.provisional ? (
        <div className="mb-6">
          <Warning>
            These hours have not been confirmed by the restaurant yet. The website currently shows
            what the old site said (opening at 10am), but the Toast ordering page says 11am, and
            says you close 12pm–4pm on Mondays and Wednesdays. Please set the correct times and
            save — that clears this warning.
          </Warning>
        </div>
      ) : null}

      <HoursEditor hours={settings.hours.value} />
    </AdminShell>
  );
}
