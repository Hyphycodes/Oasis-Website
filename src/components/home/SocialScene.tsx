import { Asset } from '@/components/media/Asset';
import { Frame } from '@/components/primitives/Band';
import { getSiteSettings } from '@/content/resolve';

/** Real venue photography and verified accounts; no simulated social feed. */
export async function SocialScene() {
  const settings = await getSiteSettings();
  return <section className="overflow-hidden bg-espresso py-10 text-night-text sm:py-14" aria-labelledby="social-scene-heading">
    <Frame wide>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="eyebrow text-amber">Your local escape</p><h2 id="social-scene-heading" className="display mt-3 text-[clamp(2rem,5vw,3.75rem)] leading-none">Good food. Better company.</h2></div>
        <p className="max-w-xs text-[0.9375rem] leading-relaxed text-night-soft">The pours, the people, the nights you had to be there for. Find us on social.</p>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Asset id="bartender" className="aspect-[4/5] w-full" sizes="(min-width: 640px) 24vw, 46vw" rounded={false} />
        <Asset id="dishQuesabirria" className="aspect-[4/5] w-full sm:mt-8" sizes="(min-width: 640px) 24vw, 46vw" rounded={false} />
        <Asset id="roomCrowd" className="aspect-[4/5] w-full" sizes="(min-width: 640px) 24vw, 46vw" rounded={false} />
        <Asset id="cocktailPair" className="aspect-[4/5] w-full sm:mt-8" sizes="(min-width: 640px) 24vw, 46vw" rounded={false} />
      </div>
      <nav aria-label="Oasis on social" className="mt-7 flex flex-wrap gap-x-7 gap-y-2 border-t border-night-text/20 pt-4">
        {settings.socials.map(social => <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 flex-wrap items-center gap-x-2 text-[0.9375rem] font-semibold text-night-text underline-offset-4 hover:text-amber hover:underline">
          <span>{({instagram:'Instagram',facebook:'Facebook',tiktok:'TikTok',youtube:'YouTube'})[social.platform]}</span><span className="text-night-soft">{social.platform === 'facebook' ? 'Oasis Mexican Kitchen & Bar' : social.handle}</span><span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
        </a>)}
      </nav>
    </Frame>
  </section>;
}
