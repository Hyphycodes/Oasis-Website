import { Asset } from '@/components/media/Asset';
import { Frame } from '@/components/primitives/Band';
import { getSiteSettings } from '@/content/resolve';
import { ThemePhotoGuest } from '@/components/theme/ThemeWorld';

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

/**
 * Real venue photography and verified accounts; no simulated social feed.
 *
 * The heading used to be set at up to 3.75rem — poster scale, two lines deep on
 * a phone, shouting louder than the section above it that actually sells a
 * table. And the three accounts were stacked one per row, each spelling out its
 * platform, its handle and an arrow, which made a short list of links look like
 * a fourth content block. Both are quieter now: the heading matches every other
 * section on the page, and the accounts sit on one wrapping row of chips.
 */
export async function SocialScene() {
  const settings = await getSiteSettings();

  return (
    <section
      className="o-band overflow-hidden bg-espresso py-10 text-night-text sm:py-14"
      aria-labelledby="social-scene-heading"
    >
      <Frame wide>
        <div className="max-w-2xl">
          <p className="eyebrow text-amber">Your local escape</p>
          <h2
            id="social-scene-heading"
            className="display mt-3 text-[clamp(1.75rem,3vw,2.375rem)] leading-[1.08]"
          >
            Good food. Better company.
          </h2>
          <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-night-soft">
            The pours, the people, the nights you had to be there for.
          </p>
        </div>

        <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <ThemePhotoGuest name="scream" />
          <Asset id="bartender" className="aspect-[4/5] w-full" sizes="(min-width: 640px) 23vw, 46vw" />
          <Asset
            id="dishQuesabirria"
            className="aspect-[4/5] w-full sm:mt-8"
            sizes="(min-width: 640px) 23vw, 46vw"
          />
          <Asset id="roomCrowd" className="aspect-[4/5] w-full" sizes="(min-width: 640px) 23vw, 46vw" />
          <Asset
            id="cocktailPair"
            className="aspect-[4/5] w-full sm:mt-8"
            sizes="(min-width: 640px) 23vw, 46vw"
          />
        </div>

        {/* One row of chips. Naming the platform AND the handle AND an arrow
            said the same thing three times, so each chip carries one label: the
            @handle where there is one, and the platform where the "handle" is
            just the restaurant's own name again, as Facebook's is. */}
        <nav aria-label="Oasis on social" className="mt-7 flex flex-wrap gap-2.5">
          {settings.socials.map((social) => {
            const platform = PLATFORM_LABEL[social.platform] ?? social.platform;
            const label = social.handle.startsWith('@') ? social.handle : platform;
            return (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-night-text/25 px-5 text-[0.9375rem] font-semibold transition-colors hover:border-amber hover:text-amber"
              >
                {label}
                <span className="sr-only">
                  {label === platform ? '' : ` on ${platform}`} (opens in a new tab)
                </span>
              </a>
            );
          })}
        </nav>
      </Frame>
    </section>
  );
}
