import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventPoster } from '@/components/media/EventPoster';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink, ExternalButtonLink, ExternalTextLink } from '@/components/primitives/Button';
import { Display, Eyebrow } from '@/components/primitives/Type';
import { site } from '@/content/site';
import {
  addToCalendarUrl,
  getAllSeries,
  getSeries,
  getSeriesOccurrences,
  STATUS_LABEL,
} from '@/lib/events';
import {
  formatEventDateLong,
  formatPrice,
  formatTimeRange,
} from '@/lib/format';
import { buildMetadata, eventJsonLd, JsonLd } from '@/lib/seo';

export const revalidate = 300;

export function generateStaticParams() {
  return getAllSeries().map((series) => ({ slug: series.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = getSeries(slug);
  if (!series) return {};

  return buildMetadata({
    title: `${series.title} — ${site.name}, Lockport IL`,
    description: series.description.slice(0, 300),
    path: `/events/${series.slug}`,
  });
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = getSeries(slug);
  if (!series) notFound();

  const now = new Date();
  const occurrences = getSeriesOccurrences(slug, now, 10);
  const next = occurrences[0];

  return (
    <>
      <Band surface="espresso" size="sm" topRule>
        <Frame wide>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Eyebrow tone="night">Oasis After Dark</Eyebrow>
              <Display as="h1" size="lg" className="mt-4 text-night-text">
                {series.title}
              </Display>
              <p className="measure mt-6 text-[length:var(--text-body-lg)] leading-relaxed text-night-soft">
                {series.description}
              </p>

              <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-night-text/15 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="eyebrow text-night-text/50">Next date</dt>
                  <dd className="tabular mt-1.5 text-night-text">
                    {next ? formatEventDateLong(next.startsAt) : 'To be announced'}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-night-text/50">Time</dt>
                  <dd className="tabular mt-1.5 text-night-text">
                    {next ? formatTimeRange(next.startsAt, next.endsAt) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-night-text/50">Age</dt>
                  <dd className="mt-1.5 text-night-text">
                    {series.ageMin ? `${series.ageMin}+` : 'All ages'}
                    {series.ageNote ? (
                      <span className="block text-[0.875rem] text-night-soft">{series.ageNote}</span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-night-text/50">Entry</dt>
                  <dd className="tabular mt-1.5 text-night-text">
                    {series.priceCents != null ? formatPrice(series.priceCents) : 'Ask at the door'}
                    {series.feeCents ? (
                      <span className="block text-[0.875rem] text-night-soft">
                        plus {formatPrice(series.feeCents)} ticket service fee
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="eyebrow text-night-text/50">Music</dt>
                  <dd className="mt-1.5 text-night-text">{series.musicFormats.join(' · ')}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {/* The NEXT night's own ticket page, not a series-level link —
                    a date-less slug resolves to the wrong event entirely. */}
                {next?.ticketUrl && next.status !== 'sold-out' ? (
                  <ExternalButtonLink
                    href={next.ticketUrl}
                    destination={`${series.title} tickets`}
                    size="lg"
                  >
                    Tickets — {formatEventDateLong(next.startsAt)}
                  </ExternalButtonLink>
                ) : (
                  <p className="rounded-(--radius-md) border border-danger px-4 py-3 text-[0.9375rem] font-semibold text-danger">
                    {STATUS_LABEL[next?.status ?? 'scheduled'] || 'Tickets at the door'}
                  </p>
                )}
                {next ? (
                  <ExternalTextLink
                    href={addToCalendarUrl(next)}
                    destination="Google Calendar"
                    className="text-night-text"
                  >
                    Add to calendar
                  </ExternalTextLink>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <EventPoster
                series={series}
                className="aspect-4/5 w-full rounded-(--radius-lg)"
              />
              <p className="mt-3 text-[0.8125rem] text-night-soft">
                {series.venueName}, {site.street}, {site.locality}, {site.region}{' '}
                {site.postalCode}
              </p>
            </div>
          </div>
        </Frame>
      </Band>

      <Band surface="cream">
        <Frame>
          <h2 className="display text-[clamp(1.5rem,2.4vw,1.875rem)] text-brown">
            Upcoming dates
          </h2>
          {/* Dates come from generated occurrences. Nothing here is read from the
              flyer artwork, which is why this list cannot go stale. */}
          <ul className="mt-8 border-t border-brown/15">
            {occurrences.map((occurrence) => {
              const statusLabel = STATUS_LABEL[occurrence.status] ?? '';
              return (
                <li
                  key={occurrence.id}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-brown/15 py-4"
                >
                  <p className="tabular font-medium text-brown">
                    {formatEventDateLong(occurrence.startsAt)}
                  </p>
                  <p className="tabular text-[0.9375rem] text-brown-soft">
                    {formatTimeRange(occurrence.startsAt, occurrence.endsAt)}
                  </p>
                  {statusLabel ? (
                    <p className="text-[0.875rem] font-semibold text-danger">{statusLabel}</p>
                  ) : (
                    <span className="flex items-center gap-4">
                      <span className="tabular text-[0.9375rem] font-semibold text-brown">
                        {occurrence.priceCents != null ? formatPrice(occurrence.priceCents) : ''}
                      </span>
                      {occurrence.ticketUrl ? (
                        <ExternalTextLink
                          href={occurrence.ticketUrl}
                          destination={`${series.title} tickets`}
                          className="text-clay"
                        >
                          Tickets
                        </ExternalTextLink>
                      ) : null}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/events" variant="secondary">
              All events
            </ButtonLink>
            <ExternalButtonLink href={site.reservationUrl} destination="Toast reservations">
              Reserve a table first
            </ExternalButtonLink>
          </div>
        </Frame>
      </Band>

      {next ? <JsonLd data={eventJsonLd(next)} /> : null}
    </>
  );
}
