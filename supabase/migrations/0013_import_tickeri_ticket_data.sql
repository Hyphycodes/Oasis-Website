-- Backfill: switch every currently-external (Tickeri) upcoming event to Oasis
-- ticketing, using prices, ticket names and descriptions read live from each
-- event's own Tickeri page (its __NEXT_DATA__ event node, not the thinner
-- JSON-LD) on 2026-09-18. External ticketing remains fully supported as a
-- per-event choice; this migration only flips the events that were, until
-- now, sold exclusively through Tickeri.
--
-- Two status corrections are included because Tickeri's live data had moved
-- on from what this table recorded: "Michael Myres Paint & Sip" is back on
-- sale (was marked sold-out), and "Snoopy Paint & Sip" (Sep 24) has actually
-- sold out (was marked scheduled). Two titles are corrected because the
-- restaurant re-themed those nights on Tickeri after our last sync: the
-- Sep 19 event is now "Snoopy Chicago Bears Paint & Brunch", and the Oct 18
-- event is now "Pumpkin Halloween Paint & Brunch".
--
-- UPDATEs are naturally no-ops if a row doesn't exist. The ticket_tiers
-- insert is guarded the same way, plus a not-exists check on (event_id,
-- name) so re-running this migration never creates duplicate tiers.
--
-- event_occurrences_guard_publish blocks a change to a published row's
-- live columns unless the acting role reads as owner/admin via can_publish()
-- — which resolves through auth.uid(), so it has no one to check against in
-- a raw SQL session (the SQL Editor, or a migration runner) and always
-- blocks there. That guard exists to stop a low-privilege staff account from
-- silently publishing changes through the app; it is not meant to block an
-- intentional, owner-run data migration like this one, so it is switched off
-- for the duration of this statement only.

alter table public.event_occurrences disable trigger event_occurrences_guard_publish;

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>Join us at Oasis Mexican Kitchen &amp; Bar for a Snoopy Chicago Bears paint &amp; Brunch🎨</p><p>Saturday, September 19th at 11AM - kid friendly | 🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>Your ticket includes:</p><p>🎨 Paint &amp; canvas</p><p>🖌️ Brushes</p><p>🥂 Themed mimosa</p><p>📸 Photo station</p><p>🌮 Chips &amp; salsa</p><p>💗 No art skills needed!</p><p>Only $10! Your ticket also comes with your reservation. Full menu available during the event.</p><p>📍 1250 E 9th St, Lockport, IL 60441</p><p>Come paint, sip, eat &amp; enjoy the vibes! 💕</p>',
  age_policy = 'all_ages',
  title = 'Snoopy Chicago Bears Paint & Brunch',
  summary = 'A Snoopy Chicago Bears paint & brunch — canvas, mimosa and a photo station.'
where id = 'tickeri:ly48t69ytbwh';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🍁🌹 <strong>SELENA PAINT &amp; BRUNCH</strong> 🌹🍁</p><p>Fall leaves, cozy vibes &amp; Selena classics 🎨✨</p><p>Come sip, paint, brunch &amp; celebrate the Queen of Tejano with us this fall! 💃🏽🍂</p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>🎨 Selena-inspired painting<br />🍁 Cozy fall vibes<br />🎶 Selena music<br />🥂 Brunch + good times<br />💵 <strong>OASIS — ONLY $10! FAMILY EVENT | KID FRIENDLY</strong></p><p>Bring your amigas &amp; let’s make some fall memories! 🌹🍂</p>',
  age_policy = 'all_ages',
  summary = 'Fall Selena-inspired paint & brunch — cozy vibes and Tejano classics.'
where id = 'tickeri:mv6rr2tii5m5';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🎨 SNOOPY PAINT &amp; SIP ! 🐶🍂 HALLOWEEN POP UP BEGINS!</p><p>Due to high demand, we’re bringing it back—bigger and better! ALL AGES EVENT!!!</p><p>📅 Thursday, September 24th<br />⏰ 7PM Start<br />🎨 Instructor and painting supplies included<br />🎶 Music, drinks, photo opportunities &amp; great vibes!</p><p>No experience needed—just come ready to paint, sip and have fun! Tickets are limited, so grab yours now!</p>',
  age_policy = 'all_ages',
  summary = 'Halloween pop-up paint & sip — sold out, join the waitlist.',
  status = 'sold-out'::event_status
where id = 'tickeri:9s52lkdtlx32';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🎨🔪 CALL ME: Paint &amp; Brunch 💕 + HALLOWEEN POP-UP!</p><p>Join us Sunday, September 27th at 11AM for a spooky-cute Paint &amp; Brunch at Oasis! 👻🎨 Canvas, paint &amp; brushes</p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>👩‍🎨 Instructor</p><p>🥂 Mimosa</p><p>🌮 Chips &amp; salsa</p><p>📸 Photo station</p><p>No art skills needed! Your ticket comes with your reservation.</p><p>📍 Oasis Mexican Kitchen &amp; Bar</p><p>1250 E 9th St, Lockport, IL 60441</p>',
  age_policy = 'all_ages',
  summary = 'A spooky-cute paint & brunch with mimosas, chips & salsa.'
where id = 'tickeri:0b6uk2g80hsg';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🎃🔪 <strong>Michael Myers Paint &amp; Sip</strong> 🔪🎃</p><p>Get spooky and creative with us for a <strong>Michael Myers–themed Paint &amp; Sip!</strong> 🖌️👻 No experience needed—just bring your friends, your favorite drink, and your Halloween spirit!</p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>📅 <strong>October 1st THURSDAY | KID FRIENDLY</strong><br />⏰ <strong>7:00 PM</strong></p><p>Come paint, sip, and create something terrifyingly fun! 🎨🖤</p>',
  age_policy = 'all_ages',
  summary = 'A Michael Myers–themed paint & sip — no experience needed.',
  status = 'scheduled'::event_status
where id = 'tickeri:d59jua699tbj';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🎃🖤 Hello Kitty HALLOWEEN BRUNCH 🖤🎃</p><p>BICHOTA SEASON gets spooky 👻🔥 Come brunch with us for a Halloween party filled with Music, Halloween Decorated Experience, mimosas, delicious food &amp; nonstop vibes 💗🥂</p><p>🥂 Mimosas</p><p>🍳 Brunch Favorites</p><p>🎃 Halloween Vibes</p><p>📸 Come dressed for the occasion!</p><p>Grab your crew &amp; get ready to brunch, sing and VIBE. 🔥</p>',
  age_policy = 'all_ages',
  summary = 'Hello Kitty Halloween brunch — mimosas, music and Halloween vibes.'
where id = 'tickeri:a2wlpotqkbsa';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🎃🍂 <strong>PUMPKIN CARVING CLASS</strong> 🍂🎃</p><p>Get ready for a night of <strong>pumpkin carving, cozy fall vibes &amp; spooky fun!</strong> 👻✨</p><p>Choose your design, grab your tools, and create your very own pumpkin masterpiece! 🎃🖤 OCTOBER 7TH! KID FRIENDLY | FAMILY EVENT!</p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>🍁 All skill levels welcome<br />🎃 Pumpkin + carving supplies included<br />👻 Spooky fall atmosphere<br />🥂 Drinks, music &amp; good vibes</p><p>Bring your friends, get creative &amp; let’s <strong>carve up some fall fun!</strong> 🍂🎃</p>',
  age_policy = 'all_ages',
  summary = 'Pumpkin carving night — tools and a pumpkin included, all skill levels.'
where id = 'tickeri:j2wyhgin40r2';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>https://www.tickeri.com/organizations/chsxwyl/oasis-events</p><p>SCREAM NIGHT Paint &amp; Sip 🔪🩸</p><p>October 8th at OASIS 👻 ALL AGES -</p><p>Halloween season starts here.</p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>🎶 Music • Drinks • Food • Halloween vibes</p><p>🎟️ Tickets available on TICKERI</p><p>Come dressed to kill. 🔪</p>',
  age_policy = 'all_ages'
where id = 'tickeri:xvt4t4jbzvwf';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>Halloween Brunch W/ SCREAM 🎃🔥 FULLY DECORATED RESTAURANT EXPERIENCE<br />Sunday, October 11th—mimosas, delicious food, a live DJ, and vibes all brunch long! Costumes encouraged. 👻🥂🎶</p><p>KID FRIENDLY - SCREAM IMPERSONATOR AVAILABLE TO TAKE PICTURES WITH</p><p>📍 Oasis Mexican Kitchen &amp; Bar<br />1250 E. 9th St., Lockport, IL</p>',
  age_policy = 'all_ages',
  summary = 'Halloween brunch with a live DJ and a Scream impersonator for photos.'
where id = 'tickeri:6n2pu69eopzu';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🎃 Hello Kitty <strong>Halloween Paint &amp; Sip!</strong> 🎨</p><p>Join us <strong>Thursday, October 15</strong> at <strong>Oasis Mexican Restaurant &amp; Bar</strong> for a spooky <strong>SAW-themed Paint &amp; Sip!</strong> 👻</p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>👨‍👩‍👧‍👦 <strong>ALL AGES &amp; FAMILY FRIENDLY!</strong><br />🎨 Paint your own cute SAW-inspired masterpiece<br />🎃 Fully decorated Halloween atmosphere<br />🌮 Food &amp; drinks available<br />📸 Come dressed up and take spooky photos!</p><p><strong>Paint something scary… if you dare!</strong> 🎨</p>',
  age_policy = 'all_ages',
  summary = 'A spooky SAW-themed Hello Kitty paint & sip — all ages, family friendly.'
where id = 'tickeri:4m2ambt0jv1e';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🎃 PUMPKIN HALLOWEEN PAINT &amp; BRUNCH 🎃<br />Come dressed to impress and enjoy delicious food, mimosas, a live DJ, and halloween vibes all brunch long! 👻🥂🎶 11AM-4PM!</p><p>LIVE DJ &amp; MORE! FULLY DECORATED RESTAURANT FOR HOLIDAYS + THEMED COCKTAILS!</p>',
  age_policy = 'all_ages',
  title = 'Pumpkin Halloween Paint & Brunch',
  summary = 'Halloween brunch with a live DJ, mimosas and themed cocktails, 11am–4pm.'
where id = 'tickeri:0q4w5wjxd5iv';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p><strong>CHUCKY X HELLO KITTY PAINT &amp; SIP</strong> 🎨🥂</p><p><strong>THURSDAY, OCTOBER 22ND</strong><br /><strong>7PM | HALLOWEEN POP-UP BAR</strong></p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>Paint Chucky 🔪 | ALL AGES EVENT | KID FRIENDLY<br />Sip &amp; vibe 🍹<br />Instructor included 🎨<br /><strong>No skills needed!</strong></p><p>📍 <strong>OASIS MEXICAN KITCHEN &amp; BAR</strong></p><p>🎟️ Limited spots available — RSVP now!</p>',
  age_policy = 'all_ages',
  summary = 'Paint Chucky at this Halloween pop-up bar — instructor included.'
where id = 'tickeri:th9oa33ur1ou';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🔥 PURO PINCHE PERREO 🔥</p><p>Hosted by FLAMES at Oasis Latin Saturdays! Get ready for a nonstop night of Reggaeton, Corridos, Guaracha, and the hottest Latin hits. Bring your crew, hit the dance floor, and perrea with us all night long!</p><p>📍 Oasis Mexican Kitchen &amp; Bar<br />🎤 Hosted by FLAMES<br />🎶 Reggaeton • Corridos • Guaracha • Latin Hits<br />🔞 18+ Event</p>',
  age_policy = '18+',
  summary = 'Reggaeton, corridos and guaracha all night with host FLAMES. 18+.'
where id = 'tickeri:c8ju6ei787qj';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>💜🎃 SELENA QUINTANILLA HALLOWEEN BRUNCH 🎃💜</p><p>Join us Sunday, October 25th from 11AM–4PM at Oasis Mexican Kitchen &amp; Bar for a Selena-inspired Sunday Funday Halloween Brunch!</p><p>🎶 Selena hits + Live DJ all day</p><p>🥂 99¢ Mimosas</p><p>🍾 $20 Mimosa Pitchers</p><p>🍽️ Delicious brunch &amp; Mexican favorites</p><p>🎃 Halloween vibes all afternoon</p><p>📍 Oasis Mexican Kitchen &amp; Bar</p><p>1250 E. Ninth St, Lockport, IL</p><p>$5 RESERVATION FEE: Your $5 reservation fee will be discounted from your final bill upon arrival. This fee is collected to confirm attendance and help prevent no-shows.</p>',
  age_policy = 'all_ages',
  summary = 'Selena-inspired Halloween brunch — live DJ, mimosas and brunch favorites.'
where id = 'tickeri:lmw4zcgl66qv';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p><strong>THE BIGGEST HALLOWEEN COSTUME PARTY AT OASIS DISCO AFTER HOURS. Dress to shock, bring your best zombie shuffle, and prepare for a night that''s out of this world! LATIN SATURDAYS! JUST GOT SPICY AND HAUNTED! 🧟‍♀️🎃</strong></p><p><strong>📍 Oasis | 1250 E 9TH ST LOCKPORT IL</strong><br /><strong>📅 9PM – 2AM</strong><br /><strong>🔞 Ladies 18+ / Men 21+</strong></p>',
  age_policy = '18+',
  summary = 'Oasis''s biggest Halloween costume party — Latin Saturdays after hours.'
where id = 'tickeri:ov5g3wopots7';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>💀🌹 DÍA DE LOS MUERTOS BRUNCH AT OASIS 🌹💀</p><p>Join us Sunday, November 1st from 11AM–4PM for a special Día de los Muertos Brunch at Oasis Mexican Kitchen &amp; Bar! FACE PAINTING SERVICE WILL BE AVAILABLE!</p><p>Enjoy delicious brunch favorites, drinks, music &amp; Día de los Muertos vibes all afternoon.</p><p>🥂 $20 Mimosa Pitchers</p><p>🍹 $40 Margarita Towers</p><p>📍 1250 E. Ninth St, Lockport, IL</p><p>RESERVATIONS REQUIRED — $5 RESERVATION FEE</p><p>Your $5 reservation fee will be discounted from your final bill upon arrival. This fee helps us confirm attendance and prevent no-shows so we can properly accommodate all reservations.</p>',
  age_policy = 'all_ages',
  summary = 'Día de los Muertos brunch with face painting, mimosas and margarita towers.'
where id = 'tickeri:v1tts4vt8xfw';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🎄🎨 Hello Kitty Christmas Paint &amp; Sip! 🎀✨</p><p>Kick off the holiday season with us Thursday, November 5th at 7PM! ❤️💚 Paint, sip, enjoy the DJ, chips &amp; salsa, photo ops &amp; more!</p><p>🎟️ Reservation required</p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>📍 Oasis Mexican Kitchen &amp; Bar — Lockport, IL</p><p>No art skills needed 🎄🖌️💕</p>',
  age_policy = 'all_ages',
  summary = 'Kick off the holidays — Hello Kitty Christmas paint & sip with a DJ.'
where id = 'tickeri:1r6x02r8uzu6';

update public.event_occurrences set
  ticketing_enabled = true,
  description_html = '<p>🎄 <strong>GRINCH PAINT &amp; SIP</strong> 🎨🥂</p><p><strong>7PM | CHRISTMAS POP-UP BAR</strong></p><p>🍹 Food &amp; beverage purchase required.</p><p>🌮 Full food &amp; cocktail menu available throughout the event.</p><p>💳 20% gratuity will be added to all Paint &amp; Sip guest checks.</p><p>Paint The Grinch 🎄 <br />Sip &amp; vibe 🍹<br />Instructor included 🎨<br /><strong>No skills needed!</strong></p><p>📍 <strong>OASIS MEXICAN KITCHEN &amp; BAR</strong></p><p>🎟️ Limited spots available — RSVP now!</p>',
  age_policy = 'all_ages',
  summary = 'Paint the Grinch at this Christmas pop-up bar — instructor included.'
where id = 'tickeri:ckl3ja90j2m6';

alter table public.event_occurrences enable trigger event_occurrences_guard_publish;

insert into public.ticket_tiers (event_id, name, description, price_cents, capacity, seats_per_ticket, min_per_order, max_per_order, sort_order, is_active)
select v.event_id, v.name, v.description, v.price_cents, v.capacity, v.seats_per_ticket, v.min_per_order, v.max_per_order, v.sort_order, v.is_active
from (values
  ('tickeri:ly48t69ytbwh', 'General Admission', null::text, 1000, null::int, 1, 0, 5, 0, true),
  ('tickeri:mv6rr2tii5m5', 'General Admission', null, 1000, null, 1, 0, 5, 0, true),
  -- Genuinely sold out on Tickeri right now: capacity 0 on the tier itself
  -- (event_occurrences.capacity must be NULL or positive, so "sold out"
  -- belongs on the tier, not the event).
  ('tickeri:9s52lkdtlx32', 'General Admission', null, 1000, 0, 1, 0, 10, 0, true),
  ('tickeri:0b6uk2g80hsg', 'General Admission', null, 1000, null, 1, 0, 5, 0, true),
  ('tickeri:d59jua699tbj', 'General Admission', null, 2500, null, 1, 0, 5, 0, true),
  ('tickeri:a2wlpotqkbsa', 'General Admission', null, 1000, null, 1, 0, 4, 0, true),
  ('tickeri:j2wyhgin40r2', 'General Admission', null, 3500, null, 1, 0, 5, 0, true),
  ('tickeri:xvt4t4jbzvwf', 'GENERAL ADMISSION', null, 2000, null, 1, 0, 5, 0, true),
  ('tickeri:6n2pu69eopzu', 'GENERAL ADMISSION', null, 1000, null, 1, 0, 4, 0, true),
  ('tickeri:4m2ambt0jv1e', 'General Admission', null, 1000, null, 1, 0, 5, 0, true),
  ('tickeri:0q4w5wjxd5iv', 'General Admission', null, 1000, null, 1, 0, 4, 0, true),
  ('tickeri:th9oa33ur1ou', 'General Admission', null, 2000, null, 1, 0, 4, 0, true),
  ('tickeri:c8ju6ei787qj', 'EARLY BIRD General Admission', null, 1000, null, 1, 0, 5, 0, true),
  ('tickeri:c8ju6ei787qj', 'General Admission', null, 2000, null, 1, 0, 5, 1, true),
  ('tickeri:c8ju6ei787qj', 'TIER 3 General Admission', null, 3000, null, 1, 0, 5, 2, true),
  ('tickeri:lmw4zcgl66qv', 'RESERVATION FEE (DISCOUNTED FROM BILL)', 'Discounted from your final bill when you arrive.', 500, null, 1, 0, 4, 0, true),
  ('tickeri:ov5g3wopots7', 'General Admission', null, 2000, null, 1, 0, 4, 0, true),
  ('tickeri:v1tts4vt8xfw', 'RESERVATION FEE (DISCOUNTED FROM BILL)', 'Discounted from your final bill when you arrive.', 500, null, 1, 0, 4, 0, true),
  ('tickeri:1r6x02r8uzu6', 'General Admission', null, 3000, null, 1, 0, 5, 0, true),
  ('tickeri:ckl3ja90j2m6', 'General Admission', null, 2000, null, 1, 0, 4, 0, true)
) as v(event_id, name, description, price_cents, capacity, seats_per_ticket, min_per_order, max_per_order, sort_order, is_active)
where exists (select 1 from public.event_occurrences e where e.id = v.event_id)
  and not exists (select 1 from public.ticket_tiers t where t.event_id = v.event_id and t.name = v.name);
