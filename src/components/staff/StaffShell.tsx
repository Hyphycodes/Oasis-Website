import Link from 'next/link';
import type { ReactNode } from 'react';
import { signOut } from '@/server/actions/team';
import { SaveStatusProvider } from '@/components/admin/SaveStatus';
import type { StaffContext } from '@/server/staff/session';
import { contextCan } from '@/server/staff/session';
import { StaffIcon } from './icons';
import { StaffBottomBar, StaffTopNav, type StaffMoreItem, type StaffNavItem } from './StaffNav';

/**
 * The frame of the employee app.
 *
 * One header — the wordmark, the location, notifications, sign out — and the
 * bottom bar. A screen's own title is rendered by the screen, so the frame
 * never has to know what it is holding.
 */
export function StaffShell({ context, unread = 0, children, wide = false }: { context: StaffContext; unread?: number; children: ReactNode; wide?: boolean }) {
  const items: StaffNavItem[] = [
    { href: '/staff', label: 'Home', icon: 'home', also: ['/staff/notifications', '/staff/announcements'] },
    { href: '/staff/schedule', label: 'Schedule', icon: 'schedule', also: ['/staff/time-off', '/staff/availability'] },
    { href: '/staff/tasks', label: 'Tasks', icon: 'tasks', also: ['/staff/checklists'] },
    { href: '/staff/training', label: 'Training', icon: 'training' },
    { href: '/staff/profile', label: 'Profile', icon: 'profile', also: ['/staff/documents', '/staff/onboarding'] },
  ];
  const more: StaffMoreItem[] = [];
  if (contextCan(context, 'schedule.view_team')) {
    more.push({ href: '/staff/operations', label: 'Operations', hint: 'Today, at a glance', icon: 'operations' });
    more.push({ href: '/staff/team', label: 'Team', hint: 'Directory and onboarding', icon: 'team' });
    more.push({ href: '/staff/operations/schedule', label: 'Build schedule', hint: 'Shifts, week by week', icon: 'calendar' });
    more.push({ href: '/staff/events', label: 'Events', hint: 'Staff each night', icon: 'events' });
    more.push({ href: '/staff/contractors', label: 'Contractors', hint: 'DJs, painters, bookings', icon: 'contractors' });
    more.push({ href: '/staff/operations/documents', label: 'Documents', hint: 'Missing and expiring', icon: 'documents' });
    more.push({ href: '/staff/operations/training', label: 'Academy', hint: 'Modules and who is cleared', icon: 'training' });
    more.push({ href: '/staff/announcements/manage', label: 'Announcements', hint: 'Post and see who read', icon: 'announcements' });
    more.push({ href: '/staff/incidents', label: 'Incidents', hint: 'Manager-only log', icon: 'incidents' });
    more.push({ href: '/staff/search', label: 'Search', hint: 'People, phones, events', icon: 'search' });
  }
  if (contextCan(context, 'locations.manage')) more.push({ href: '/staff/locations', label: 'Locations', hint: 'Lockport, and the next one', icon: 'locations' });

  return (
    <SaveStatusProvider>
      <div className="min-h-dvh bg-ivory pb-24 lg:pb-8">
        <header className="sticky top-0 z-40 border-b border-night-text/10 bg-teal">
          <div className={`mx-auto flex items-center gap-x-5 px-4 py-2.5 sm:px-6 ${wide ? 'max-w-[1280px]' : 'max-w-[960px]'}`}>
            <Link href="/staff" className="display shrink-0 text-[1.375rem] leading-none text-night-text transition-opacity hover:opacity-80">
              Oasis
              <span className="ml-1.5 font-sans text-[0.75rem] font-medium normal-case tracking-[0.12em] text-night-text/55">staff</span>
            </Link>
            <StaffTopNav items={items} more={more} />
            <div className="ml-auto flex items-center gap-2 text-[0.8125rem]">
              <span className="hidden truncate text-night-text/55 sm:block">{context.location.shortName}</span>
              <Link href="/staff/notifications" aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'} className="relative inline-flex size-10 items-center justify-center rounded-full text-night-text/80 hover:bg-night-text/10">
                <StaffIcon name="bell" className="size-[20px]" />
                {unread > 0 ? <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-coral px-1 text-center text-[0.625rem] font-bold leading-4 text-on-orange">{unread > 9 ? '9+' : unread}</span> : null}
              </Link>
              {context.isManager ? (
                <Link href="/admin" className="hidden min-h-10 items-center text-night-text/60 underline-offset-4 hover:text-night-text hover:underline sm:inline-flex">
                  Admin
                </Link>
              ) : null}
              {context.staff.source !== 'open' ? (
                <form action={signOut}>
                  <button type="submit" className="inline-flex min-h-10 items-center text-night-text/55 underline-offset-4 hover:text-night-text hover:underline">
                    Sign out
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </header>
        <main className={`mx-auto px-4 py-5 sm:px-6 sm:py-7 ${wide ? 'max-w-[1280px]' : 'max-w-[960px]'}`}>{children}</main>
        <StaffBottomBar items={items} more={more} />
      </div>
    </SaveStatusProvider>
  );
}
