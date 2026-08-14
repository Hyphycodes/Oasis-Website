import { redirect } from 'next/navigation';
import { AdminShell, Card, Warning } from '@/components/admin/AdminShell';
import { assets } from '@/content/assets';
import { getStaff } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

const STATUS_COPY: Record<string, string> = {
  brand: 'Brand file',
  final: 'Done',
  'temp-wix': 'Temporary — from the old website',
  placeholder: 'No photo yet',
};

/**
 * Read-only by design.
 *
 * Uploading a photo is not just dropping a file — each slot has a fixed shape and
 * a focal point so it crops correctly on phones. Letting a manager upload directly
 * would break those crops. Instead this page tells them exactly what to send and
 * to whom, which is the part they can actually action.
 */
export default async function MediaPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const entries = Object.entries(assets);
  const missing = entries.filter(([, asset]) => asset.status === 'placeholder');
  const temporary = entries.filter(([, asset]) => asset.status === 'temp-wix');

  return (
    <AdminShell
      role={staff.role}
      name={staff.name}
      email={staff.user.email ?? ''}
      title="Photos"
      description="Every photo slot on the website. Send new photos to your developer and they will drop them in — the layout is already built around them, so nothing moves."
    >
      {missing.length > 0 ? (
        <div className="mb-6">
          <Warning>
            {missing.length} slots have no photo and are showing a plain Oasis panel. The most
            valuable ones to shoot first are the quesabirrias, the Bizza, and a Friday or Saturday
            night on the floor.
          </Warning>
        </div>
      ) : null}

      <div className="grid gap-6">
        <Card title={`Needs a photo (${missing.length})`}>
          <ul className="divide-y divide-brown/12">
            {missing.map(([id, asset]) => (
              <li key={id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] font-medium text-brown">
                    {asset.alt ?? 'Decorative'}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-brown-soft">
                    Used on: {asset.usage.join(', ')}
                  </p>
                </div>
                <p className="tabular shrink-0 text-[0.8125rem] text-brown-soft">
                  {asset.ratio} · at least {asset.width}×{asset.height}px
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`Temporary photos from the old site (${temporary.length})`}>
          <p className="mb-4 text-[0.875rem] text-brown-soft">
            These work, but they are copies pulled off the old Wix site rather than the original
            files. If you still have the originals from your photographer, send those.
          </p>
          <ul className="divide-y divide-brown/12">
            {temporary.map(([id, asset]) => (
              <li key={id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] font-medium text-brown">
                    {asset.alt ?? 'Decorative'}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-brown-soft">
                    Used on: {asset.usage.join(', ')}
                  </p>
                </div>
                <p className="tabular shrink-0 text-[0.8125rem] text-brown-soft">
                  {asset.width}×{asset.height}px · {STATUS_COPY[asset.status]}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AdminShell>
  );
}
