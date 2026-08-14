'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { primaryNav, secondaryNav } from './nav';

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function MobileDrawer({
  reservationUrl,
  orderUrl,
}: {
  reservationUrl: string;
  orderUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to where it came from, not to the top of the document.
    triggerRef.current?.focus();
  }, []);

  // Route change closes the drawer — otherwise back/forward leaves it stranded open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        className="inline-flex size-11 items-center justify-center rounded-(--radius-md) text-brown lg:hidden"
      >
        <span className="sr-only">Open menu</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 bg-espresso/50"
          />
          <div
            id="mobile-drawer"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-cream shadow-none"
          >
            <div className="flex items-center justify-between border-b border-brown/15 px-5 py-4">
              <span className="eyebrow text-brown-soft">Menu</span>
              <button
                type="button"
                onClick={close}
                className="inline-flex size-11 items-center justify-center rounded-(--radius-md) text-brown"
              >
                <span className="sr-only">Close menu</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-5 py-6" aria-label="Primary">
              <ul className="space-y-1">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block py-2.5 text-[1.5rem] font-semibold tracking-[-0.02em] [font-variation-settings:'wdth'_104]"
                    >
                      {item.label}
                    </Link>
                    {item.children ? (
                      <ul className="mb-2 ml-1 space-y-0.5 border-l border-brown/15 pl-4">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block py-1.5 text-[0.9375rem] text-brown-soft"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
                {secondaryNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block py-2.5 text-[0.9375rem] text-brown-soft">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="grid gap-2 border-t border-brown/15 px-5 py-5">
              <a
                href={reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-(--radius-md) bg-orange px-5 py-3 font-semibold text-on-orange"
              >
                Reserve a table
                <span className="sr-only">(opens Toast in a new tab)</span>
              </a>
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-(--radius-md) border border-brown/25 px-5 py-3 font-semibold text-brown"
              >
                Order online
                <span className="sr-only">(opens Toast in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
