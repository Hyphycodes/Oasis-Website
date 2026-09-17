import Link from 'next/link';
import { eventHref } from '@/components/events/EventBits';
import { Frame } from '@/components/primitives/Band';
import type { ResolvedEvent } from '@/content/types';
import { formatEventDate, formatEventTime } from '@/lib/format';

/**
 * What is on next — the first thing under the hero.
 *
 * Oasis is a restaurant people already know how to have dinner at. The events
 * are the reason to come on a particular night, and they were three sections
 * down the page. This is a single line that names the next one, dates it, and
 * gives one way in: small enough that it does not fight the headline above it,
 * loud enough that nobody scrolls past the fact that something is on.
 *
 * It renders nothing when there is nothing upcoming, which is the honest state
 * — an empty "what's on" strip advertises that there is nothing on.
 */
export function NextUp({ event }: { event: ResolvedEvent | null }) {
  if (!event) return null;

  const soldOut = event.status === 'sold-out';
  const href = eventHref(event);

  return (
    <section
      aria-labelledby="next-up-label"
      className="o-band relative isolate border-y border-amber/25 bg-espresso on-dark"
      style={{ '--e-accent': 'var(--color-amber)' } as React.CSSProperties}
    >
      <Frame wide>
        {/* Stacked on a phone, one line from `sm`. Inline everywhere, the title
            and the date wrapped around the button into a three-line tangle. */}
        <div className="next-up-row flex flex-col gap-2.5 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
          <p id="next-up-label" className="eyebrow shrink-0 text-amber">
            {/* A live dot, the way a listings page marks tonight. */}
            <span
              aria-hidden="true"
              className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-amber align-middle"
            />
            On next
          </p>

          <p className="min-w-0 flex-1 text-[0.9375rem] leading-snug">
            <Link
              href={href}
              className="font-semibold text-night-text underline-offset-4 hover:text-amber hover:underline"
            >
              {event.title}
            </Link>
            <span className="tabular ml-2 whitespace-nowrap text-night-soft">
              {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
            </span>
          </p>

          {/* One action, and it is the one that earns money on an event night:
              tickets where there are tickets, the event itself where there are
              not, because the weekly nights are free and have nothing to sell. */}
          {event.ticketUrl && !soldOut ? (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-(--radius-md) bg-coral px-5 text-[0.875rem] font-semibold text-on-orange transition-colors hover:bg-coral-deep"
            >
              Get tickets
              <span className="sr-only">
                {' '}
                for {event.title} (opens the ticket page in a new tab)
              </span>
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-(--radius-md) border border-night-text/35 px-5 text-[0.875rem] font-semibold text-night-text transition-colors hover:border-amber hover:text-amber"
            >
              {soldOut ? 'Details' : 'See the night'}
            </Link>
          )}
        </div>
      </Frame>
    </section>
  );
}
