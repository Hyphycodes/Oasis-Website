import { afterEach, describe, expect, it } from 'vitest';
import { isAdminOpen } from './admin-access';

/**
 * The gate.
 *
 * Two things are worth locking down: that the environment variable can turn
 * sign-in back on without a code change, and that only the exact string `true`
 * does it — a typo must not silently leave the admin open on a public address.
 */
const original = process.env.ADMIN_REQUIRE_SIGN_IN;

afterEach(() => {
  if (original === undefined) delete process.env.ADMIN_REQUIRE_SIGN_IN;
  else process.env.ADMIN_REQUIRE_SIGN_IN = original;
});

describe('isAdminOpen', () => {
  it('is open by default, which is the current project setting', () => {
    delete process.env.ADMIN_REQUIRE_SIGN_IN;
    expect(isAdminOpen()).toBe(true);
  });

  it('closes when the environment asks for sign-in', () => {
    process.env.ADMIN_REQUIRE_SIGN_IN = 'true';
    expect(isAdminOpen()).toBe(false);
  });

  it('tolerates the whitespace a hosting UI adds', () => {
    process.env.ADMIN_REQUIRE_SIGN_IN = ' true ';
    expect(isAdminOpen()).toBe(false);
  });

  it('does not close on anything other than "true"', () => {
    // A half-recognised value must not read as "sign-in is on" when it is not.
    for (const value of ['TRUE', '1', 'yes', 'false', '']) {
      process.env.ADMIN_REQUIRE_SIGN_IN = value;
      expect(isAdminOpen(), value).toBe(true);
    }
  });
});
