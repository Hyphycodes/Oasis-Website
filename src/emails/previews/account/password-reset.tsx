import PasswordReset from '../../templates/PasswordReset';
import { brand } from '../../fixtures';

/** Preview: account/password-reset. Run `npm run email:dev` and open it in the sidebar. */
export default function PasswordResetPreview() {
  return <PasswordReset brand={brand} name="Alex Rivera" email="alex@example.com" actionUrl="https://oasis-website-mu.vercel.app/auth/callback?code=preview" expiresInMinutes={60} />;
}
