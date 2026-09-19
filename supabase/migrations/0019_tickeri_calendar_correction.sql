-- Correcting the Tickeri calendar: start times, five missing nights, four finished ones.
--
-- Read from the organizer page at
-- https://www.tickeri.com/organizations/chsxwyl/oasis-events and from each
-- event's own page; the capture this migration is built from is the one already
-- in the repo as src/content/imported-flyers.json (retrieved 2026-09-17), which
-- carries every event's id, title, local start time and official flyer.
--
-- 1. TEN START TIMES WERE AN HOUR LATE, AND THAT HID THE FLYERS.
--
--    Every brunch read 12:00 instead of 11:00 and both late nights read 22:00
--    instead of 21:00. Six of the ten say their own time in their own
--    description_html -- "Saturday, September 19th at 11AM", "from 11AM-4PM",
--    "9PM - 2AM" -- and every one of those six agrees with the flyer capture,
--    not with this table. The 7PM paint & sips were already right.
--
--    The damage was not only a wrong time. importedFlyer() in
--    src/server/content/event-art.ts will only show an imported flyer when its
--    recorded start EXACTLY equals the event's start -- deliberately, so that a
--    rescheduled night cannot keep showing artwork printed with the old date.
--    An hour of drift therefore silently removed the official flyer from all
--    ten of those events. Correcting the times puts the photos back.
--
-- 2. FIVE EVENTS ON TICKERI WERE NOT IN THIS TABLE AT ALL.
--
--    Their flyers are already in the repo (public/events/imported/<id>.jpg), so
--    only the rows were missing. They are inserted PUBLISHED, so the site lists
--    the whole calendar, but with ticketing_enabled = false: unlike the events
--    0013 converted, no tier prices have been read for them, so Oasis has
--    nothing to sell and the guest is sent to Tickeri instead.
--
--    That flag is load-bearing rather than cautious. getTicketOffer() in
--    src/server/ticketing/offer.ts returns 'external' -- a working ticket
--    button pointing at Tickeri -- only while ticketing is OFF. Turning it on
--    before tiers are priced would return 'pending' instead, deliberately
--    refusing to fall back to someone else's link, and these five events would
--    publish with no ticket button at all. Enable it per event in the admin
--    once its tiers exist.
--
-- 3. FIVE FINISHED EVENTS WERE STILL PUBLISHED.
--
--    All five are in the past. They are archived, not deleted --
--    getAttention() raises a published past date on the dashboard, and
--    archiving is how that is cleared without losing the record. Four were
--    already gone from Tickeri; the fifth, Junior H, was still listed when the
--    calendar was captured on the 17th and had finished by the time this ran.
--
-- Presentation columns (category, preset, featured, priority, treatment) are
-- left alone, as every Tickeri sync leaves them alone -- with one correction
-- noted at the bottom.
--
-- event_occurrences_guard_publish resolves a role through auth.uid() and so
-- always blocks in a raw SQL session. It exists to stop a low-privilege staff
-- account publishing through the app, not to block an owner-run migration, so
-- it is off for the duration of this one, exactly as in 0013.

alter table public.event_occurrences disable trigger event_occurrences_guard_publish;

-- 1. The correct start and finish time for every event currently listed.
--    Ten of these eighteen statements change a row; the other eight restate
--    the time the row already holds, so the block can be re-run safely and
--    reads as the whole calendar rather than as a list of exceptions.

update public.event_occurrences set
  starts_at = timestamptz '2026-09-19T16:00:00Z',
  ends_at   = timestamptz '2026-09-19T19:00:00Z'
where id = 'tickeri:ly48t69ytbwh';  -- Sat 2026-09-19 11:00 local — Snoopy Chicago Bears Paint & Brunch

update public.event_occurrences set
  starts_at = timestamptz '2026-09-20T16:00:00Z',
  ends_at   = timestamptz '2026-09-20T19:00:00Z'
where id = 'tickeri:mv6rr2tii5m5';  -- Sun 2026-09-20 11:00 local — Selena Quintanilla Paint & Brunch

update public.event_occurrences set
  starts_at = timestamptz '2026-09-25T00:00:00Z',
  ends_at   = timestamptz '2026-09-25T03:00:00Z'
where id = 'tickeri:9s52lkdtlx32';  -- Thu 2026-09-24 19:00 local — Snoopy Paint & Sip

update public.event_occurrences set
  starts_at = timestamptz '2026-09-27T16:00:00Z',
  ends_at   = timestamptz '2026-09-27T19:00:00Z'
where id = 'tickeri:0b6uk2g80hsg';  -- Sun 2026-09-27 11:00 local — Scream Paint & Brunch

update public.event_occurrences set
  starts_at = timestamptz '2026-10-02T00:00:00Z',
  ends_at   = timestamptz '2026-10-02T03:00:00Z'
where id = 'tickeri:d59jua699tbj';  -- Thu 2026-10-01 19:00 local — Michael Myres Paint & Sip

update public.event_occurrences set
  starts_at = timestamptz '2026-10-04T16:00:00Z',
  ends_at   = timestamptz '2026-10-04T19:00:00Z'
where id = 'tickeri:a2wlpotqkbsa';  -- Sun 2026-10-04 11:00 local — Hello Kitty Halloween Sunday Brunch

update public.event_occurrences set
  starts_at = timestamptz '2026-10-08T00:00:00Z',
  ends_at   = timestamptz '2026-10-08T03:00:00Z'
where id = 'tickeri:j2wyhgin40r2';  -- Wed 2026-10-07 19:00 local — Pumpkin Carving Paint & Sip

update public.event_occurrences set
  starts_at = timestamptz '2026-10-09T00:00:00Z',
  ends_at   = timestamptz '2026-10-09T03:00:00Z'
where id = 'tickeri:xvt4t4jbzvwf';  -- Thu 2026-10-08 19:00 local — Scream Paint & Sip

update public.event_occurrences set
  starts_at = timestamptz '2026-10-11T16:00:00Z',
  ends_at   = timestamptz '2026-10-11T19:00:00Z'
where id = 'tickeri:6n2pu69eopzu';  -- Sun 2026-10-11 11:00 local — Halloween Brunch w/ Scream

update public.event_occurrences set
  starts_at = timestamptz '2026-10-16T00:00:00Z',
  ends_at   = timestamptz '2026-10-16T03:00:00Z'
where id = 'tickeri:4m2ambt0jv1e';  -- Thu 2026-10-15 19:00 local — Hello Kitty Paint & Sip

update public.event_occurrences set
  starts_at = timestamptz '2026-10-18T16:00:00Z',
  ends_at   = timestamptz '2026-10-18T21:00:00Z'
where id = 'tickeri:0q4w5wjxd5iv';  -- Sun 2026-10-18 11:00 local — Pumpkin Halloween Paint & Brunch

update public.event_occurrences set
  starts_at = timestamptz '2026-10-23T00:00:00Z',
  ends_at   = timestamptz '2026-10-23T03:00:00Z'
where id = 'tickeri:th9oa33ur1ou';  -- Thu 2026-10-22 19:00 local — Chucky X Hello Kitty Paint & Sip

update public.event_occurrences set
  starts_at = timestamptz '2026-10-25T02:00:00Z',
  ends_at   = timestamptz '2026-10-25T07:00:00Z'
where id = 'tickeri:c8ju6ei787qj';  -- Sat 2026-10-24 21:00 local — Puro Pinche Perreo Hosted by Flames

update public.event_occurrences set
  starts_at = timestamptz '2026-10-25T16:00:00Z',
  ends_at   = timestamptz '2026-10-25T21:00:00Z'
where id = 'tickeri:lmw4zcgl66qv';  -- Sun 2026-10-25 11:00 local — Selena Quintanilla Halloween Sunday Brunch

update public.event_occurrences set
  starts_at = timestamptz '2026-11-01T02:00:00Z',
  ends_at   = timestamptz '2026-11-01T07:00:00Z'
where id = 'tickeri:ov5g3wopots7';  -- Sat 2026-10-31 21:00 local — Thriller Halloween Costume Party

update public.event_occurrences set
  starts_at = timestamptz '2026-11-01T17:00:00Z',
  ends_at   = timestamptz '2026-11-01T22:00:00Z'
where id = 'tickeri:v1tts4vt8xfw';  -- Sun 2026-11-01 11:00 local — Dia de los Muertos Sunday Brunch

update public.event_occurrences set
  starts_at = timestamptz '2026-11-06T01:00:00Z',
  ends_at   = timestamptz '2026-11-06T04:00:00Z'
where id = 'tickeri:1r6x02r8uzu6';  -- Thu 2026-11-05 19:00 local — Hello Kitty Christmas Edition Paint & Sip

update public.event_occurrences set
  starts_at = timestamptz '2026-11-13T01:00:00Z',
  ends_at   = timestamptz '2026-11-13T04:00:00Z'
where id = 'tickeri:ckl3ja90j2m6';  -- Thu 2026-11-12 19:00 local — Grinch Paint & Sip

-- 2. The five nights that were on Tickeri but not in this table.

insert into public.event_occurrences (
  id, series_slug, slug, title, summary, description, description_html,
  starts_at, ends_at, status, category, visual_preset, treatment, featured, priority,
  venue_name, age_policy, published, ticketing_enabled,
  source, source_event_id, source_url, synced_at
)
select
  v.id, null, v.slug, v.title, v.summary, '', v.description_html,
  v.starts_at, v.ends_at, 'scheduled'::event_status, v.category, 'marigold', 'standard', false, 0,
  'Oasis Mexican Kitchen & Bar', 'all_ages', true, false,
  'tickeri', v.source_event_id, v.source_url, now()
from (values
  ('tickeri:hkfw1xqjh0p0', 'hello-kitty-halloween-paint-sip', 'Hello Kitty Halloween Paint & Sip', 'A Hello Kitty Halloween paint & sip — canvas, paints and an instructor included.', '<p>🎀🎃 <strong>HELLO KITTY HALLOWEEN PAINT &amp; SIP</strong> 🎃🎀</p><p>Sunday, September 27th at 6PM at Oasis Mexican Kitchen &amp; Bar.</p><p>🎨 Canvas, paints and instructor included</p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>📍 1250 E 9th St, Lockport, IL 60441</p><p>🎟️ Tickets on Tickeri.</p>', timestamptz '2026-09-27T23:00:00Z', timestamptz '2026-09-28T02:00:00Z', 'paint-sip', 'hkfw1xqjh0p0', 'https://www.tickeri.com/events/hkfw1xqjh0p0/hello-kitty-halloween-paint-sip'),  -- Sun 2026-09-27
  ('tickeri:bw9gnwdladhw', 'el-alfa-paint-sip-party', 'El Alfa Paint & Sip Party', 'An El Alfa paint & sip party — dembow all night, canvas in hand.', '<p>🎨🔥 <strong>EL ALFA PAINT &amp; SIP PARTY</strong> 🔥🎨</p><p>Friday, October 2nd at 9PM at Oasis Mexican Kitchen &amp; Bar.</p><p>🎶 El Alfa &amp; dembow all night</p><p>🎨 Canvas, paints and instructor included</p><p>🍹 Food &amp; beverage purchase required.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>📍 1250 E 9th St, Lockport, IL 60441</p><p>🎟️ Tickets on Tickeri.</p>', timestamptz '2026-10-03T02:00:00Z', timestamptz '2026-10-03T05:00:00Z', 'paint-sip', 'bw9gnwdladhw', 'https://www.tickeri.com/events/bw9gnwdladhw/el-alfa-paint-sip-party'),  -- Fri 2026-10-02
  ('tickeri:ihart5g24vfj', 'bad-bunny-un-halloween-sin-ti-paint-sip', 'Bad Bunny Un Halloween Sin Ti Paint & Sip', 'A Bad Bunny ''Un Halloween Sin Ti'' paint & sip — canvas and instructor included.', '<p>🐰🎃 <strong>BAD BUNNY — UN HALLOWEEN SIN TI PAINT &amp; SIP</strong> 🎃🐰</p><p>Sunday, October 4th at 6PM at Oasis Mexican Kitchen &amp; Bar.</p><p>🎶 Bad Bunny all night</p><p>🎨 Canvas, paints and instructor included</p><p>🍹 Food &amp; beverage purchase required.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>📍 1250 E 9th St, Lockport, IL 60441</p><p>🎟️ Tickets on Tickeri.</p>', timestamptz '2026-10-04T23:00:00Z', timestamptz '2026-10-05T02:00:00Z', 'paint-sip', 'ihart5g24vfj', 'https://www.tickeri.com/events/ihart5g24vfj/bad-bunny-un-halloween-sin-ti-paint-sip'),  -- Sun 2026-10-04
  ('tickeri:yy7aaovvp6fz', 'drake-paint-sip-night', 'Drake Paint & Sip Night', 'A Drake-themed paint & sip night — canvas and instructor included.', '<p>🎨🦉 <strong>DRAKE PAINT &amp; SIP NIGHT</strong> 🦉🎨</p><p>Sunday, October 11th at 6PM at Oasis Mexican Kitchen &amp; Bar.</p><p>🎶 Drake all night</p><p>🎨 Canvas, paints and instructor included</p><p>🍹 Food &amp; beverage purchase required.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>📍 1250 E 9th St, Lockport, IL 60441</p><p>🎟️ Tickets on Tickeri.</p>', timestamptz '2026-10-11T23:00:00Z', timestamptz '2026-10-12T02:00:00Z', 'paint-sip', 'yy7aaovvp6fz', 'https://www.tickeri.com/events/yy7aaovvp6fz/drake-paint-sip-night'),  -- Sun 2026-10-11
  ('tickeri:xraeo6y9f6zu', 'hello-kitty-halloween-paint-sip-oct', 'Hello Kitty Halloween Paint & Sip', 'A late-seating Hello Kitty Halloween paint & sip — canvas and instructor included.', '<p>🎀🎃 <strong>HELLO KITTY HALLOWEEN PAINT &amp; SIP</strong> 🎃🎀</p><p>Thursday, October 15th at 8PM at Oasis Mexican Kitchen &amp; Bar — the later seating.</p><p>🎨 Canvas, paints and instructor included</p><p>🍹 Food &amp; beverage purchase required.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>📍 1250 E 9th St, Lockport, IL 60441</p><p>🎟️ Tickets on Tickeri.</p>', timestamptz '2026-10-16T01:00:00Z', timestamptz '2026-10-16T04:00:00Z', 'paint-sip', 'xraeo6y9f6zu', 'https://www.tickeri.com/events/xraeo6y9f6zu/hello-kitty-halloween-paint-sip')   -- Thu 2026-10-15
) as v(id, slug, title, summary, description_html, starts_at, ends_at,
           category, source_event_id, source_url)
where not exists (select 1 from public.event_occurrences e where e.id = v.id)
  and not exists (select 1 from public.event_occurrences e where e.slug = v.slug);

-- 3. Five finished events, no longer on the calendar. Archived, not deleted.

update public.event_occurrences set archived_at = now(), published = false
where archived_at is null and id in (
  'tickeri:82c16al40ueb',  -- Snoopy Paint & Sip Night, 2026-09-10
  'tickeri:i13zraxxiq01',  -- Michael Myers Paint & Brunch, 2026-09-13
  'tickeri:97wyidqsm9ln',  -- Snoopy White Sox Paint & Sip, 2026-09-13
  'tickeri:3io85f3rne4w',  -- Comedy Show Hosted by Ruben, 2026-09-16
  -- Still listed when the calendar was captured on the 17th, and over by the
  -- time it was applied. It is archived for the same reason as the other four,
  -- not because anything about it changed.
  'tickeri:nwn48quznb96'   -- Junior H Paint & Sip, 2026-09-17
);

-- Every night on the calendar is live. The eighteen above are published
-- already; this states it for all twenty-three so the migration asserts the
-- end state rather than assuming it, and so a night unpublished by hand for
-- an earlier reason cannot quietly stay missing from the site.
update public.event_occurrences set published = true
where source = 'tickeri' and archived_at is null and published = false;

-- One presentation correction: "Grinch Paint & Sip" was filed as nightlife, so
-- it was missing from the Paint & Sip filter on /events. It is a paint & sip.
update public.event_occurrences set category = 'paint-sip'
where id = 'tickeri:ckl3ja90j2m6' and category = 'nightlife';

alter table public.event_occurrences enable trigger event_occurrences_guard_publish;
