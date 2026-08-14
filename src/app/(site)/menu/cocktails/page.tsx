import type { Metadata } from 'next';
import { Asset } from '@/components/media/Asset';
import { MenuView } from '@/components/menu/MenuView';
import { Band } from '@/components/primitives/Band';
import { ButtonLink, ExternalButtonLink } from '@/components/primitives/Button';
import { PageHeader } from '@/components/primitives/PageHeader';
import { pageCopy, seo } from '@/content/pages';
import { getMenu } from '@/content/resolve';
import { site } from '@/content/site';
import { buildMetadata, JsonLd, menuJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.cocktails!, path: '/menu/cocktails' });
export const revalidate = 3600;

export default async function CocktailsPage() {
  const menu = await getMenu('cocktails');

  return (
    <>
      {/* A different opener from /menu: this one carries an image beside the type,
          so the two menu routes do not read as the same template twice. */}
      <PageHeader
        surface="sand"
        eyebrow={pageCopy.cocktails.eyebrow}
        heading={pageCopy.cocktails.heading}
        body={pageCopy.cocktails.body}
        actions={
          <>
            <ExternalButtonLink href={site.reservationUrl} destination="Toast reservations">
              Reserve a table
            </ExternalButtonLink>
            <ButtonLink href="/menu" variant="secondary">
              Food menu
            </ButtonLink>
          </>
        }
        aside={
          <Asset id="backBar" className="aspect-4/5 w-full" sizes="(min-width: 1024px) 30vw, 100vw" />
        }
      />

      <Band surface="cream" size="flush">
        <MenuView menu={menu} />
      </Band>

      <JsonLd data={menuJsonLd(menu)} />
    </>
  );
}
