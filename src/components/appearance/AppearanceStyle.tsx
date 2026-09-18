import { cssFor, resolveLook, type Appearance } from '@/lib/appearance/presets';

/**
 * The look, as CSS, in the head.
 *
 * Emitted by the root layout on the server, so the first paint is already the
 * right colours — no client-side flash, no rebuild, no redeploy. The
 * unlayered `:root` rule beats the defaults Tailwind declares inside
 * `@layer theme`; the admin gets the same variables under its own attribute
 * when it follows the site.
 */
export function AppearanceStyle({ appearance }: { appearance: Appearance }) {
  const look = resolveLook(appearance);
  const css = [
    cssFor(':root', look.vars),
    appearance.adminFollowsSite ? cssFor("[data-admin-look='site']", look.vars) : '',
  ].join('');
  return <style id="oasis-appearance" data-preset={look.preset}>{css}</style>;
}
