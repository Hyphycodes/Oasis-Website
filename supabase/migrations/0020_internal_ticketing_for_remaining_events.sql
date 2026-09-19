-- The last five events move from "pay at the door" to selling on this website.
--
-- After 0019 every event on the calendar was published, but five of them --
-- the ones 0019 added, which 0013 never saw -- had ticketing_enabled = false
-- AND no ticket_url. That combination resolves to a `door` offer in
-- getTicketOffer(), so their tiles read "Pay at the door" and their ticket box
-- offered nothing to press. Those five are:
--
--   hkfw1xqjh0p0  Hello Kitty Halloween Paint & Sip   Sun 27 Sep, 6pm
--   bw9gnwdladhw  El Alfa Paint & Sip Party           Fri  2 Oct, 9pm
--   ihart5g24vfj  Bad Bunny Un Halloween Sin Ti       Sun  4 Oct, 6pm
--   yy7aaovvp6fz  Drake Paint & Sip Night             Sun 11 Oct, 6pm
--   xraeo6y9f6zu  Hello Kitty Halloween Paint & Sip   Thu 15 Oct, 8pm (late seating)
--
-- Every event on the calendar now sells through Oasis. No public surface
-- offers an outbound ticket link any more: getTicketOffer() only returns an
-- `external` offer when ticketing is OFF, and after this migration it is on
-- everywhere. Their ticket_url stays NULL, so there is no outside link left to
-- fall back to even if ticketing were switched off again -- it would read
-- "pay at the door" rather than sending a guest to another site.
--
-- THE PRICES BELOW ARE A PLACEHOLDER AND NEED CONFIRMING.
--
-- tickeri.com is refused by this environment's egress proxy, so the real tier
-- prices for these five could not be read the way 0013 read the other
-- eighteen. Guesswork is not something to hide inside a migration: each
-- one is set to $20, the most common Paint & Sip price already on this
-- calendar (Scream, Chucky X Hello Kitty and Grinch are all $20), and each
-- event carries an admin-only `note` saying so. Correct them in
-- Admin -> Events -> the event -> Tickets before the site takes real money.
--
-- The guard is disabled for the same reason as 0013 and 0019: it resolves a
-- role through auth.uid() and so always blocks in a raw SQL session.

alter table public.event_occurrences disable trigger event_occurrences_guard_publish;

update public.event_occurrences set
  ticketing_enabled = true,
  note = 'Ticket price is a $20 placeholder — Tickeri was unreachable when this was set up. Confirm the real price before launch.'
where id in (
  'tickeri:hkfw1xqjh0p0',
  'tickeri:bw9gnwdladhw',
  'tickeri:ihart5g24vfj',
  'tickeri:yy7aaovvp6fz',
  'tickeri:xraeo6y9f6zu'
);

alter table public.event_occurrences enable trigger event_occurrences_guard_publish;

-- One General Admission tier each, shaped like the tiers 0013 created: no
-- capacity of its own (the event cap bounds it), one seat per ticket, at most
-- five to an order. Guarded on (event_id, name) so re-running never doubles
-- them up, and on the event existing at all.
insert into public.ticket_tiers (event_id, name, description, price_cents, capacity, seats_per_ticket, min_per_order, max_per_order, sort_order, is_active)
select v.event_id, v.name, v.description, v.price_cents, v.capacity, v.seats_per_ticket, v.min_per_order, v.max_per_order, v.sort_order, v.is_active
from (values
  ('tickeri:hkfw1xqjh0p0', 'General Admission', null::text, 2000, null::int, 1, 0, 5, 0, true),
  ('tickeri:bw9gnwdladhw', 'General Admission', null, 2000, null, 1, 0, 5, 0, true),
  ('tickeri:ihart5g24vfj', 'General Admission', null, 2000, null, 1, 0, 5, 0, true),
  ('tickeri:yy7aaovvp6fz', 'General Admission', null, 2000, null, 1, 0, 5, 0, true),
  ('tickeri:xraeo6y9f6zu', 'General Admission', null, 2000, null, 1, 0, 5, 0, true)
) as v(event_id, name, description, price_cents, capacity, seats_per_ticket, min_per_order, max_per_order, sort_order, is_active)
where exists (select 1 from public.event_occurrences e where e.id = v.event_id)
  and not exists (select 1 from public.ticket_tiers t where t.event_id = v.event_id and t.name = v.name);
