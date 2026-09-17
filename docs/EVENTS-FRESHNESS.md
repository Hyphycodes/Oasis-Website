# Why a finished night cannot be advertised as the next one

The live-site audit on **August 15, 2026** found the homepage and the Events page both still calling
**Friday, August 14** the next Friday. That is the single most damaging class of bug on a
restaurant website: a guest turns up for something that already happened.

There are two independent ways it can occur, and both are closed.

## 1. The selector could be wrong

One function answers "what is on" for every surface: `nextEvent` in
[`src/lib/events.ts`](../src/lib/events.ts). The homepage, `/events`, the series pages and the
admin all call it, so they cannot disagree with each other.

An occurrence is eligible only if **all** of these hold:

- it is published;
- it is not archived;
- its **end** timestamp is later than now — not its start;
- it is not cancelled or postponed;
- its series is neither paused nor archived;
- it has a name.

Two consequences worth stating out loud:

- **A night in progress stays the answer until it ends.** At 1am on Saturday, Friday's night is
  still "what's on" — which is exactly when somebody is checking their phone. The same rule applies
  on every surface.
- **A cancelled night is still listed** for two weeks, so a ticket-holder finds out, but it is never
  returned as the next event.

`src/lib/events.test.ts` asserts each rule separately, including the audit's exact case: at 9am on
August 15, 2026, `nextEvent` must return August 21 and never August 14. A final test sweeps a year
of weekly instants and asserts that nothing returned has already ended.

## 2. A correct answer could be served from a stale cache

As of September 17, 2026, the public site layout and sitemap use request-time rendering.
This includes the homepage, events index and every event detail route. Event selectors use the
request clock; they no longer wait for a five-minute ISR window to expire. Publishing through
admin also invalidates affected paths. Tests cover midnight, DST, cancellations and postponements.

## 3. The dashboard says so if it ever happens anyway

`getAttention` scans the stored occurrence overrides for a published date in the past and raises it
on the dashboard, linked to the record. The selector already hides it from guests; the warning is
there so somebody tidies it up rather than leaving a growing pile of history marked "published".
