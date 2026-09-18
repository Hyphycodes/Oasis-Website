import MagicLink from '../../templates/MagicLink';
import { brand } from '../../fixtures';

/** Preview: account/magic-link. Run `npm run email:dev` and open it in the sidebar. */
export default function MagicLinkPreview() {
  return <MagicLink brand={brand} name="Alex Rivera" email="alex@example.com" actionUrl="https://oasis-website-mu.vercel.app/auth/callback?code=preview" expiresInMinutes={60} />;
}
