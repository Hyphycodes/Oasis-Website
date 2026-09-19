'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { StaffIcon, type StaffIconName } from './icons';

/**
 * Five things a thumb can reach, and a "More" for a manager.
 *
 * On a phone the five are a bottom bar. On a desktop the same five sit in
 * the header. The manager's screens — team, operations, events, contractors,
 * documents, incidents — live behind one More button, so the bar an
 * employee sees is the bar a manager sees, plus one.
 */

export interface StaffNavItem {
  href: string;
  label: string;
  icon: StaffIconName;
  /** Other paths that count as inside this tab. */
  also?: string[];
  badge?: number;
}

export interface StaffMoreItem {
  href: string;
  label: string;
  hint?: string;
  icon: StaffIconName;
}

function inside(pathname: string, item: { href: string; also?: string[] }): boolean {
  const roots = [item.href, ...(item.also ?? [])];
  if (item.href === '/staff') return pathname === '/staff' || roots.slice(1).some((root) => pathname.startsWith(root));
  return roots.some((root) => pathname === root || pathname.startsWith(`${root}/`) || pathname.startsWith(`${root}?`));
}

export function StaffBottomBar({ items, more }: { items: StaffNavItem[]; more: StaffMoreItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (panel.current && !panel.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const moreActive = more.some((item) => inside(pathname, item));

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-hidden="true" />
      ) : null}
      <nav
        aria-label="Staff app"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-night-text/12 bg-teal/95 backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {open ? (
          <div ref={panel} className="mx-auto max-w-[640px] border-b border-night-text/12 px-2 pb-2 pt-3">
            <p className="px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-night-text/55">Manage</p>
            <ul className="grid grid-cols-2 gap-1">
              {more.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex min-h-12 items-center gap-2.5 rounded-(--radius-sm) px-3 text-[0.9375rem] font-semibold ${inside(pathname, item) ? 'bg-night-text/10 text-amber' : 'text-night-text/85'}`}
                  >
                    <StaffIcon name={item.icon} className="size-[20px] shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate">{item.label}</span>
                      {item.hint ? <span className="block truncate text-[0.75rem] font-normal text-night-text/55">{item.hint}</span> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <ul className="mx-auto flex max-w-[640px] items-stretch justify-around">
          {items.map((item) => {
            const active = inside(pathname, item) && !open;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-[3.75rem] flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold ${active ? 'text-amber' : 'text-night-text/70'}`}
                >
                  <StaffIcon name={item.icon} className="size-[24px]" />
                  {item.label}
                  {item.badge ? (
                    <span className="absolute left-1/2 top-2 ml-1.5 min-w-4 rounded-full bg-coral px-1 text-center text-[0.625rem] font-bold leading-4 text-on-orange">{item.badge > 9 ? '9+' : item.badge}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
          {more.length > 0 ? (
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className={`flex min-h-[3.75rem] w-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold ${open || moreActive ? 'text-amber' : 'text-night-text/70'}`}
              >
                <StaffIcon name="more" className="size-[24px]" />
                More
              </button>
            </li>
          ) : null}
        </ul>
      </nav>
    </>
  );
}

export function StaffTopNav({ items, more }: { items: StaffNavItem[]; more: StaffMoreItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLLIElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (panel.current && !panel.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const moreActive = more.some((item) => inside(pathname, item));

  return (
    <nav aria-label="Staff app" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = inside(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative inline-flex min-h-11 items-center gap-1.5 px-3 text-[0.9375rem] font-semibold transition-colors ${active ? 'text-night-text' : 'text-night-text/70 hover:text-night-text'}`}
              >
                {item.label}
                {item.badge ? <span className="min-w-4 rounded-full bg-coral px-1 text-center text-[0.625rem] font-bold leading-4 text-on-orange">{item.badge}</span> : null}
                {active ? <span aria-hidden="true" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-amber" /> : null}
              </Link>
            </li>
          );
        })}
        {more.length > 0 ? (
          <li ref={panel} className="relative">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className={`relative inline-flex min-h-11 items-center gap-1 px-3 text-[0.9375rem] font-semibold transition-colors ${open || moreActive ? 'text-night-text' : 'text-night-text/70 hover:text-night-text'}`}
            >
              Manage
              <StaffIcon name="chevron" className={`size-[14px] transition-transform ${open ? '-rotate-90' : 'rotate-90'}`} />
              {moreActive ? <span aria-hidden="true" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-amber" /> : null}
            </button>
            {open ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-[26rem] max-w-[90vw] rounded-(--radius-md) border border-night-text/12 bg-teal p-2 shadow-xl">
                <ul className="grid grid-cols-2 gap-1">
                  {more.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex min-h-12 items-center gap-2.5 rounded-(--radius-sm) px-3 text-[0.9375rem] font-semibold ${inside(pathname, item) ? 'bg-night-text/10 text-amber' : 'text-night-text/85 hover:bg-night-text/8'}`}
                      >
                        <StaffIcon name={item.icon} className="size-[18px] shrink-0" />
                        <span className="min-w-0">
                          <span className="block truncate">{item.label}</span>
                          {item.hint ? <span className="block truncate text-[0.75rem] font-normal text-night-text/55">{item.hint}</span> : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
