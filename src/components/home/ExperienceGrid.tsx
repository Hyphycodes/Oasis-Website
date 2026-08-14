import Link from 'next/link';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { Reveal } from '@/components/primitives/Reveal';
import { Display, Eyebrow, Lead } from '@/components/primitives/Type';
import type { PageSection } from '@/content/types';

/**
 * The anti-three-card grid.
 *
 * Three destinations, deliberately unequal: different cell heights, different
 * aspect ratios, and a vertical offset on the middle cell. An equal-width
 * feature-card row is the single most recognizable template layout, so the
 * information is the same and the composition is not.
 */
interface CellSpec {
  href: string;
  assetId: 'plateTorta' | 'cocktailPair' | 'roomAtmosphere';
  label: string;
  copy: string;
  ratio: string;
}

const CELLS: CellSpec[] = [
  {
    href: '/menu',
    assetId: 'plateTorta',
    label: 'Eat',
    copy: 'Birria, quesabirrias, fajitas, and the Bizza — plus everything else the kitchen is known for.',
    ratio: 'aspect-4/5 lg:aspect-2/3',
  },
  {
    href: '/menu/cocktails',
    assetId: 'cocktailPair',
    label: 'Drink',
    copy: 'Tequila-forward classics, towers and pitchers built for the whole table.',
    ratio: 'aspect-3/2',
  },
  {
    href: '/events',
    assetId: 'roomAtmosphere',
    label: 'Stay out',
    copy: 'Friday and Saturday the room turns into a club. Doors at ten, 18+.',
    ratio: 'aspect-3/2',
  },
];

function Cell({ cell, sizes }: { cell: CellSpec; sizes: string }) {
  return (
    <Link href={cell.href} className="group block">
      <Asset id={cell.assetId} className={`${cell.ratio} w-full`} sizes={sizes} />
      <h3 className="mt-5 text-[length:var(--text-heading)] font-semibold tracking-[-0.015em] text-brown transition-colors group-hover:text-clay">
        {cell.label}
      </h3>
      <p className="measure mt-2 text-[0.9375rem] leading-relaxed text-brown-soft">{cell.copy}</p>
    </Link>
  );
}

export function ExperienceGrid({ section }: { section: PageSection }) {
  if (!section.visible) return null;

  return (
    <Band surface="cream">
      <Frame wide>
        <Reveal>
          <div className="max-w-3xl">
            {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
            <Display as="h2" size="lg" className="mt-4 max-w-[20ch] text-brown">
              {section.heading}
            </Display>
            {section.body ? <Lead className="mt-5">{section.body}</Lead> : null}
          </div>
        </Reveal>

        {/* One tall cell on the left, two stacked on the right, offset down —
            unequal by construction, so it cannot read as a three-card row. */}
        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-12">
          <Reveal className="lg:col-span-5">
            <Cell cell={CELLS[0]!} sizes="(min-width: 1024px) 42vw, 100vw" />
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:mt-14 lg:grid-cols-1 lg:gap-12">
            <Reveal delay={80}>
              <Cell cell={CELLS[1]!} sizes="(min-width: 1024px) 48vw, (min-width: 640px) 50vw, 100vw" />
            </Reveal>
            <Reveal delay={160}>
              <Cell cell={CELLS[2]!} sizes="(min-width: 1024px) 48vw, (min-width: 640px) 50vw, 100vw" />
            </Reveal>
          </div>
        </div>
      </Frame>
    </Band>
  );
}
