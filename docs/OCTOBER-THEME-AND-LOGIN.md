# October theme and staff access

## Seasonal art

The current Halloween / Día de los Muertos theme retains the restaurant's plum canvas,
marigolds, papel picado, warm orange actions and reduced-motion support. Pink/lilac ambient
light and three small transparent character illustrations reflect the supplied Hello Kitty,
Snoopy and Scream paint-and-sip flyers. These are decorative accents; they do not replace
flyers, change event information or appear when the seasonal look is off. Edge decorations
can still be switched off in Admin → Seasonal look.

Generated with the user's connected Higgsfield account, GPT Image 2.5, September 17, 2026:

- Snoopy: `60bf5ddd-a09a-489f-b541-1be90f700ade`
- Scream: `0a64c99f-b222-4119-b9f1-563574a4800f`
- Hello Kitty: `a784e5e8-8d54-4d11-a019-c996eed5d7a0`

Original PNGs were optimized to transparent WebP, up to 480px, under
`public/themes/halloween-dotd/characters/`. Two earlier room-background concepts were
superseded by the user's clarified direction and are not shipped.

## Free house nights

Oasis Fridays and Oasis Latin Saturdays are free and need no tickets. Public and working
content normalization applies this owner policy to legacy database rows. The occurrence
resolver also suppresses old per-date ticket links and paid overrides when a series is free.
Saving those two series persists the free policy. Separately published special events keep
prices, ticket links and reservations of their own.

## Jerry's first sign-in

1. Open https://oasis-website-mu.vercel.app/admin/login.
2. Enter `jerrysanchezpro@gmail.com` and choose **Email me a sign-in link**.
3. Open the email link in the same browser that requested it. No password is needed.
4. The first verified sign-in completes owner setup. Owner elevation is restricted to that
   exact designated email, requires Supabase's verified identity, cannot replace another owner
   and cannot reactivate a disabled profile. It does not use user-editable metadata as authority.

An unverified Auth identity can be prepared before the email arrives, but it is never treated
as an owner before email verification. Invalid/expired links return to login with a recovery
message. Supabase owns token expiry and rate limits. Password login remains available for
existing password users.

## Adding staff

Owner → **Team & permissions** → **Add a staff member**. Supply their name and email, and choose
Contributor (drafts) or Manager (publishing). Share the login page; they request their own link.
Creating the account sends no email and never chooses their password. Owners can change roles
or deactivate accounts in the existing list. Public signup is disabled in Supabase.

Supabase's default email service is limited to project-team recipients and has low sending
limits. Jerry's project email can use it. Before onboarding other staff mailboxes, configure
custom SMTP in Supabase; account creation alone does not guarantee mail delivery to them.
No paid email plan or sender identity was invented or purchased.

## Supabase configuration

The existing project's site URL is `https://oasis-website-mu.vercel.app` and its exact allowed
callback is `https://oasis-website-mu.vercel.app/auth/callback`. No wildcard callback is needed.
Default email templates remain in use. Public signup is disabled; anonymous sign-in stays off
and email confirmation stays on. No secrets were copied into the repository.

References: [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
and [SMTP limits](https://supabase.com/docs/guides/auth/auth-smtp).
