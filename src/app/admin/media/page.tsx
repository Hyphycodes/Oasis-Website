import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { EmptyState, Notice } from '@/components/admin/ui';
import { getReadDb, isLocalDb } from '@/lib/db';
import { getStaff, staffCan } from '@/server/auth';
import {
  getMediaLibrary,
  MEDIA_TAGS,
  mediaProblems,
  searchMedia,
  totalPlacements,
} from '@/server/content/media';
import { canOpen } from '@/server/permissions';
import { UploadForm } from './UploadForm';

export const dynamic = 'force-dynamic';

/**
 * The photo library.
 *
 * Flat, searchable, with a deliberately small tag list. No folders: a restaurant
 * has a few hundred photographs at most, and nested folders turn "find the bar
 * shot" into an archaeology exercise. Every card says where the photo is used,
 * because that is the question people actually have.
 */
export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; show?: string }>;
}) {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const local = isLocalDb();
  if (!canOpen({ role: staff.role, sections: staff.sections }, 'media')) {
    return (
      <AdminShell staff={staff} local={local} title="Photos & videos">
        <NoAccess what="photos and videos" />
      </AdminShell>
    );
  }

  const db = getReadDb();
  const params = await searchParams;
  const library = db ? await getMediaLibrary(db) : [];

  const showArchived = params.show === 'archived';
  let visible = library.filter((entry) => Boolean(entry.archivedAt) === showArchived);
  if (params.tag) visible = visible.filter((entry) => entry.tags.includes(params.tag!));
  visible = searchMedia(visible, params.q ?? '');

  const needsAlt = library.filter(
    (entry) => entry.path && !entry.archivedAt && !entry.decorative && !entry.alt?.trim(),
  );
  const missing = library.filter((entry) => !entry.path && !entry.archivedAt);

  return (
    <AdminShell
      staff={staff}
      local={local}
      title="Photos & videos"
      description="Add a file once, then choose where it appears on the website."
    >
      {!db ? (
        <EmptyState>
          Photos and videos are not available right now. Please try again in a moment.
        </EmptyState>
      ) : (
        <>
          {needsAlt.length > 0 ? (
            <div className="mb-4">
              <Notice tone="danger">
                {needsAlt.length}{' '}
                {needsAlt.length === 1 ? 'file has no description' : 'files have no description'},
                so screen readers cannot describe them.
              </Notice>
            </div>
          ) : null}

          {missing.length > 0 ? (
            <div className="mb-4">
              <Notice tone="warning">
                {missing.length} spots are still waiting for a real photo. They show a branded
                placeholder in the meantime, so nothing looks broken.
              </Notice>
            </div>
          ) : null}

          {staffCan(staff, 'media.upload') ? (
            <div className="mb-6">
              <UploadForm />
            </div>
          ) : null}

          <form className="mb-5 flex flex-wrap items-end gap-2" role="search">
            <div className="min-w-48 flex-1">
              <label htmlFor="media-search" className="block text-[0.8125rem] font-semibold text-brown">
                Search
              </label>
              <input
                id="media-search"
                name="q"
                type="search"
                defaultValue={params.q ?? ''}
                placeholder="Search by name or description"
                className="mt-1.5 min-h-11 w-full rounded-(--radius-sm) border border-brown/25 bg-linen px-3 text-[0.9375rem] text-brown"
              />
            </div>
            <div>
              <label htmlFor="media-tag" className="block text-[0.8125rem] font-semibold text-brown">
                Tag
              </label>
              <select
                id="media-tag"
                name="tag"
                defaultValue={params.tag ?? ''}
                className="mt-1.5 min-h-11 rounded-(--radius-sm) border border-brown/25 bg-linen px-3 text-[0.9375rem] text-brown"
              >
                <option value="">All</option>
                {MEDIA_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
            >
              Filter
            </button>
            <Link
              href={showArchived ? '/admin/media' : '/admin/media?show=archived'}
              className="inline-flex min-h-11 items-center text-[0.875rem] text-clay underline underline-offset-4"
            >
              {showArchived ? 'Back to the library' : 'Show archived'}
            </Link>
          </form>

          {visible.length === 0 ? (
            <EmptyState>Nothing matches. Try a different word.</EmptyState>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((entry) => {
                const problems = mediaProblems(entry);
                return (
                  <li key={entry.assetId}>
                    <Link
                      href={`/admin/media/${entry.assetId}`}
                      className="group flex h-full flex-col overflow-hidden rounded-(--radius-md) border border-brown/20 bg-linen transition-colors hover:border-coral"
                    >
                      <span className="relative block aspect-4/3 w-full bg-ivory-deep">
                        {entry.path && entry.kind === 'video' ? (
                          <video
                            src={entry.path}
                            poster={entry.poster ?? undefined}
                            muted
                            playsInline
                            preload="metadata"
                            className="size-full object-cover"
                          />
                        ) : entry.path ? (
                          <Image
                            src={entry.path}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-[0.8125rem] text-brown-soft">
                            No file yet
                          </span>
                        )}
                      </span>
                      <span className="flex flex-1 flex-col p-3">
                        <span className="text-[0.9375rem] font-semibold text-brown group-hover:text-clay">
                          {entry.title}
                          {entry.kind === 'video' ? (
                            <span className="ml-2 rounded-full bg-teal/8 px-2 py-0.5 text-[0.6875rem] uppercase tracking-wide text-teal">
                              Video
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 text-[0.8125rem] text-brown-soft">
                          {entry.decorative
                            ? 'Decorative'
                            : (entry.alt ?? 'No description').slice(0, 60)}
                        </span>
                        <span className="mt-2 text-[0.75rem] text-brown-soft">
                          {totalPlacements(entry) === 0
                            ? 'Not used anywhere'
                            : `Used in ${totalPlacements(entry)} ${totalPlacements(entry) === 1 ? 'place' : 'places'}`}
                        </span>
                        {problems.length > 0 ? (
                          <span className="mt-2 text-[0.75rem] font-semibold text-danger">
                            {problems[0]}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

        </>
      )}
    </AdminShell>
  );
}
