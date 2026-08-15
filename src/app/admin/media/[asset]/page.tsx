import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { Card, EmptyState, Notice } from '@/components/admin/ui';
import { getReadDb, isLocalDb } from '@/lib/db';
import { getStaff, staffCan } from '@/server/auth';
import { listVersions } from '@/server/content/editorial';
import { getMedia, getMediaLibrary, mediaProblems } from '@/server/content/media';
import { canOpen } from '@/server/permissions';
import { MediaDetails } from './MediaDetails';

export const dynamic = 'force-dynamic';

export default async function MediaDetailPage({ params }: { params: Promise<{ asset: string }> }) {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const local = isLocalDb();
  if (!canOpen({ role: staff.role, sections: staff.sections }, 'media')) {
    return (
      <AdminShell staff={staff} local={local} title="Photos">
        <NoAccess what="photos" />
      </AdminShell>
    );
  }

  const { asset: assetId } = await params;
  const db = getReadDb();
  if (!db) notFound();

  const entry = await getMedia(db, assetId);
  if (!entry) notFound();

  const library = await getMediaLibrary(db);
  const alternatives = library
    .filter((other) => other.assetId !== assetId && other.path && !other.archivedAt)
    .map((other) => ({ id: other.assetId, label: other.title }));

  const problems = mediaProblems(entry);
  const versions = await listVersions(db, 'media_assets', assetId);

  return (
    <AdminShell
      staff={staff}
      local={local}
      title={entry.title}
      description={
        entry.path
          ? `${entry.width} × ${entry.height} · ${entry.kind}${entry.sizeBytes ? ` · ${(entry.sizeBytes / 1024).toFixed(0)}KB` : ''}`
          : 'No file yet — this slot shows a branded placeholder.'
      }
      actions={
        <Link
          href="/admin/media"
          className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
        >
          All photos
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-(--radius-md) border border-brown/20 bg-ivory-deep">
            {entry.path ? (
              <div className="relative aspect-square w-full">
                <Image
                  src={entry.path}
                  alt={entry.alt ?? ''}
                  fill
                  sizes="(min-width: 1024px) 22rem, 90vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center text-[0.875rem] text-brown-soft">
                No photo yet
              </div>
            )}
          </div>

          {problems.length > 0 ? (
            <Notice tone="danger">{problems.join(' ')}</Notice>
          ) : null}

          <Card title="Where it is used" tone="quiet">
            {entry.usage.length === 0 && entry.registryUsage.length === 0 ? (
              <EmptyState>Not used anywhere on the website right now.</EmptyState>
            ) : null}

            {entry.usage.length > 0 ? (
              <ul className="grid gap-2">
                {entry.usage.map((use) => (
                  <li key={`${use.href}-${use.label}`} className="text-[0.875rem]">
                    <Link href={use.href} className="font-medium text-clay underline underline-offset-4">
                      {use.label}
                    </Link>
                    <span className="text-brown-soft"> · appears on {use.route}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {entry.registryUsage.length > 0 ? (
              <div className={entry.usage.length > 0 ? 'mt-4 border-t border-brown/12 pt-3' : ''}>
                <p className="text-[0.8125rem] font-semibold text-brown">Placed by the design</p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-brown-soft">
                  {entry.registryUsage.join(', ')}. The design decides where these go and what
                  shape they are, so they cannot be moved — but you can change which photo sits in
                  the slot, below.
                </p>
              </div>
            ) : null}
          </Card>
        </div>

        <MediaDetails
          entry={entry}
          alternatives={alternatives}
          versions={versions}
          canArchive={staffCan(staff, 'content.archive')}
          canRestore={staffCan(staff, 'content.restore')}
        />
      </div>
    </AdminShell>
  );
}
