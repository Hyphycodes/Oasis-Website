import { redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { TaskLink } from '@/components/admin/ui';
import { isLocalDb } from '@/lib/db';
import { getStaff } from '@/server/auth';
import { canOpen } from '@/server/permissions';

export const dynamic = 'force-dynamic';

/**
 * Look: one place for how the website looks.
 *
 * The seasonal look and the photo library live here now. The appearance
 * controls — background, accent, presets — arrive in the next branch and
 * take over this screen.
 */
export default async function LookPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');
  const local = isLocalDb();
  const canWebsite = canOpen({ role: staff.role, sections: staff.sections }, 'website');
  const canMedia = canOpen({ role: staff.role, sections: staff.sections }, 'media');
  if (!canWebsite && !canMedia) {
    return (
      <AdminShell staff={staff} local={local} title="Look">
        <NoAccess what="the website's look" />
      </AdminShell>
    );
  }
  return (
    <AdminShell staff={staff} local={local} title="Look" description="How the website looks, in one place.">
      <div className="grid gap-3 sm:grid-cols-2">
        {canWebsite ? <TaskLink href="/admin/theme" icon="season" title="Seasonal look" hint="Dress the website for the season, or take it back to the everyday look." /> : null}
        {canMedia ? <TaskLink href="/admin/media" icon="photos" title="Photos & videos" hint="Add a file once, then choose where it appears." /> : null}
      </div>
    </AdminShell>
  );
}
