/**
 * Whether the admin requires signing in.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  RIGHT NOW THE ADMIN IS OPEN. Anyone who can reach /admin can edit and    │
 * │  publish the website. There is no password on it.                        │
 * │                                                                          │
 * │  That is deliberate for now, so the admin can be used and shown without   │
 * │  setting up accounts first. It is safe while the site is only running on  │
 * │  this machine. It is NOT safe on a public URL: a published address plus   │
 * │  an open admin means a stranger can change the menu.                      │
 * │                                                                          │
 * │  TO TURN SIGN-IN BACK ON, either:                                         │
 * │    • set OPEN_ADMIN below to false, or                                    │
 * │    • set ADMIN_REQUIRE_SIGN_IN=true in the environment (no code change,   │
 * │      which is what you want on a hosting provider).                       │
 * │                                                                          │
 * │  Everything needed for sign-in is still here and still works — accounts,  │
 * │  roles, Row Level Security, the publish guard. Only the gate is off.      │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
const OPEN_ADMIN = true;

/**
 * True when the admin is open to anyone.
 *
 * The environment variable wins over the constant, so a deployment can require
 * sign-in without editing code — and so turning it on in production cannot be
 * undone by someone redeploying an older commit.
 */
export function isAdminOpen(): boolean {
  if (process.env.ADMIN_REQUIRE_SIGN_IN?.trim() === 'true') return false;
  return OPEN_ADMIN;
}
