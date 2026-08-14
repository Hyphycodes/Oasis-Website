import type { EventSeries } from '@/content/types';
import { formatPrice } from '@/lib/format';

/**
 * Typographic event poster.
 *
 * The restaurant's own flyers have dates printed into the pixels, so they cannot
 * be used — the date would go stale the moment the night passed. Rather than
 * showing an empty placeholder where artwork should be, this composes a real
 * poster out of facts the site already knows to be true: the night, the music,
 * the age limit, the door time and the price.
 *
 * Everything here is data. Nothing is invented, and nothing is a stand-in for
 * missing artwork — this IS the artwork until the restaurant supplies undated
 * flyers, and it is designed to be good enough to keep.
 */
export function EventPoster({
  series,
  className = '',
  compact = false,
}: {
  series: EventSeries;
  className?: string;
  compact?: boolean;
}) {
  // Two nights, two treatments — so the posters read as a set, not a template.
  const isFriday = series.cadence.kind === 'weekly' && series.cadence.weekday === 5;

  const words = series.title.replace(/^Oasis\s+/i, '').split(' ');
  const doorHour = Math.floor(series.startMinutes / 60);
  const door = `${doorHour % 12 === 0 ? 12 : doorHour % 12}${doorHour >= 12 ? 'PM' : 'AM'}`;

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden bg-obsidian p-5 sm:p-6 ${className}`}
      // Decorative composition of information already stated in the surrounding
      // markup, so it is hidden rather than read out twice.
      aria-hidden="true"
    >
      {/* Angled band — the only place the electric accent appears at scale. */}
      <div
        className={`pointer-events-none absolute inset-x-[-20%] h-[42%] ${
          isFriday ? 'bg-neon/12 top-[18%] -rotate-6' : 'bg-orange/15 top-[26%] rotate-6'
        }`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="eyebrow text-neon">Oasis</span>
        <span className="eyebrow text-night-soft">
          {series.ageMin ? `${series.ageMin}+` : 'All ages'}
        </span>
      </div>

      <div className="relative py-4">
        <p
          className={`display-poster text-night-text ${
            compact ? 'text-[clamp(2rem,9vw,3rem)]' : 'text-[clamp(2.5rem,7vw,4.5rem)]'
          }`}
        >
          {words.map((word) => (
            <span key={word} className="block">
              {word}
            </span>
          ))}
        </p>
      </div>

      <div className="relative">
        <div className="h-px w-full bg-night-text/25" />
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-night-soft">
            {series.musicFormats.join(' · ')}
          </p>
          <p className="tabular text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-neon">
            Doors {door}
            {series.priceCents != null ? ` · ${formatPrice(series.priceCents)}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
