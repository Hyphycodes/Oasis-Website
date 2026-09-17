import Link from 'next/link';
import { Asset } from '@/components/media/Asset';
import { Frame } from '@/components/primitives/Band';
import { Reveal } from '@/components/primitives/Reveal';
import { ThemePhotoGuest, ThemeWorld } from '@/components/theme/ThemeWorld';

/**
 * Birthdays and celebrations — the second thing worth booking.
 *
 * This slot used to be a social gallery: four photographs, a poster-scale
 * headline and three account links. It sold nothing. A birthday, a quinceañera
 * or a work party is a whole room's worth of covers booked weeks ahead, it is
 * the thing Oasis is genuinely good at, and it had no presence on the homepage
 * at all beyond a line of small print at the very bottom.
 *
 * The accounts moved to the footer, where a row of logos is enough.
 *
 * Deliberately warm rather than formal: what the restaurant actually does on a
 * birthday is dessert, the staff song, the LED show and a confetti popper, so
 * the section says that in those words and lets the seasonal companions play
 * along the edges.
 *
 * Selena and Junior H — ThemeWorld's "music" scene, already the pairing
 * private-events/page.tsx uses for the same reason — close the section below
 * the grid rather than standing between it and Offerings. That is what moved
 * them off the menu cards: they now read as this section's own flourish, not
 * a corridor between two unrelated ones.
 */
export function Celebrations() {
  return (
    <section
      className="o-band relative isolate bg-espresso on-dark py-(--spacing-band-sm)"
      aria-labelledby="celebrations-heading"
    >
      <Frame wide>
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-6">
            <div className="relative">
              {/* Two companions, because this is the one section on the page
                  that is explicitly about making a fuss. */}
              <ThemePhotoGuest name="pumpkin" />
              <Asset
                id="roomCrowd"
                className="aspect-[4/3] w-full"
                sizes="(min-width: 1024px) 46vw, 100vw"
              />
            </div>
          </Reveal>

          <Reveal delay={70} className="lg:col-span-6">
            <p className="eyebrow text-amber">Birthdays & celebrations</p>
            <h2
              id="celebrations-heading"
              className="display mt-3 text-[clamp(1.75rem,3vw,2.375rem)] leading-[1.08] text-night-text"
            >
              We will make a scene about it.
            </h2>
            {/* Every claim here is one the restaurant already publishes: the
                dessert, the song, the lights and the popper come from the
                approved celebrations copy. Capacities, minimums and room-hire
                terms are deliberately absent — they are not published anywhere,
                they depend on the date, and the inquiry form is what settles
                them. See src/app/(site)/private-events/page.tsx. */}
            <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-night-soft">
              Birthdays, quinceañeras and anything else worth making noise about — dessert, the
              staff song, the LED show and a confetti popper. Send us your date and the team will
              come back to you.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/private-events"
                className="inline-flex min-h-12 items-center justify-center rounded-(--radius-md) bg-coral px-6 text-[0.9375rem] font-semibold tracking-[0.02em] text-on-orange transition-colors hover:bg-coral-deep"
              >
                Plan a celebration
              </Link>
              <Link
                href="/catering"
                className="inline-flex min-h-12 items-center justify-center rounded-(--radius-md) border border-night-text/35 px-6 text-[0.9375rem] font-semibold text-night-text transition-colors hover:border-amber hover:text-amber"
              >
                Catering packages
              </Link>
            </div>
          </Reveal>
        </div>
      </Frame>
      <ThemeWorld scene="music" />
    </section>
  );
}
