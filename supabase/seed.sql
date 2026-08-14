-- GENERATED FILE — do not edit by hand.
-- Produced by `npm run content:seed` from src/content/*.ts
--
-- Re-running is safe: every statement is an upsert keyed on the primary key,
-- so seeding a database that the owner has already edited will overwrite the
-- seeded rows and leave anything they added alone.

begin;

-- Site settings -------------------------------------------------------
insert into public.site_settings (id, payload) values ('default', '{"phone":{"value":"(815) 545-7556","provisional":true,"note":"CONTENT-QUESTIONS.md §1 — Toast publishes (815) 524-4188 instead."},"altPhone":{"value":"(815) 524-4188","provisional":true,"note":"CONTENT-QUESTIONS.md §1 — recorded, not published, pending owner confirmation."},"hours":{"value":[{"day":0,"ranges":[{"openMinutes":600,"closeMinutes":1260}]},{"day":1,"ranges":[{"openMinutes":600,"closeMinutes":1320}]},{"day":2,"ranges":[{"openMinutes":600,"closeMinutes":1320}]},{"day":3,"ranges":[{"openMinutes":600,"closeMinutes":1320}]},{"day":4,"ranges":[{"openMinutes":600,"closeMinutes":1320}]},{"day":5,"ranges":[{"openMinutes":600,"closeMinutes":1500}]},{"day":6,"ranges":[{"openMinutes":600,"closeMinutes":1500}]}],"provisional":true,"note":"CONTENT-QUESTIONS.md §2 — Toast shows an 11am open every day plus a Mon/Wed midday closure."},"reservationUrl":"https://tables.toasttab.com/restaurants/43040713-bf74-449f-bd19-00594dd956fa/findTime","orderUrl":"https://oasismexicanlockport.toast.site/order","socials":[{"platform":"facebook","handle":"OasisMexicanKitchenandBar","url":"https://www.facebook.com/OasisMexicanKitchenandBar/"},{"platform":"instagram","handle":"@oasismexbar","url":"https://www.instagram.com/oasismexbar/"}]}'::jsonb)
  on conflict (id) do update set payload = excluded.payload;

-- Announcements -------------------------------------------------------
-- Ships DISABLED: the restaurant references promotions but publishes no terms.
-- See docs/CONTENT-QUESTIONS.md §12.
insert into public.announcements (id, message, href, link_label, starts_at, ends_at, enabled, tone)
  values (gen_random_uuid(), 'Lunch deal — details to be confirmed by the restaurant.', null, null, null, null, false, 'default')
  on conflict do nothing;

-- Menus ---------------------------------------------------------------
insert into public.menus (slug, title, note, empty_state, sort) values ('food', 'Food', null, null, 0)
  on conflict (slug) do update set title = excluded.title, note = excluded.note, empty_state = excluded.empty_state, sort = excluded.sort;
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('food:starters', 'food', 'Starters', null, 0)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:oasis-wings', 'food:starters', 'Oasis Wings', '8 wings of your choice of sauce, with ranch.', 1800, null, 'Sauce', '{}', true, false, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'food:oasis-wings';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:oasis-wings', 'Mole', null, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:oasis-wings', 'Mango Habanero', null, 1);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:oasis-wings', 'Buffalo', null, 2);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:oasis-wings', 'BBQ', null, 3);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:queso-dip', 'food:starters', 'Queso Dip', 'Queso dip with chorizo & chips: messy, cheesy, and absolutely necessary.', 900, null, null, '{}', true, false, 1)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:crispy-shrimps', 'food:starters', 'Crispy Shrimps', 'Golden-fried shrimp served over a fresh spring mix salad.', 1600, null, null, '{}', true, false, 2)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:street-corn', 'food:starters', 'Street Corn', 'Four grilled mini corn cobs with creamy mayo, topped with Cotija cheese and Tajín.', 1000, null, null, array['vegetarian']::text[], true, false, 3)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:quesadilla', 'food:starters', 'Quesadilla', 'Melted cheese in a warm tortilla, served with a side salad of lettuce, tomato & sour cream.', null, 'Ask your server', 'Add', array['vegetarian']::text[], true, false, 4)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'food:quesadilla';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:quesadilla', 'Add meat', 400, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:quesadilla', 'Upgrade to dinner', 200, 1);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:loaded-nachos', 'food:starters', 'Loaded Nachos', 'Crispy chips topped with nacho cheese, mozzarella, beans, lettuce, tomato, guacamole, sour cream, and jalapeño.', null, 'Ask your server', 'Add', array['vegetarian']::text[], true, false, 5)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'food:loaded-nachos';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:loaded-nachos', 'Meat', 400, 0);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:oasis-fries', 'food:starters', 'Oasis Fries', 'Fries smothered in nacho cheese, jalapeño, mozzarella, guacamole & sour cream.', null, 'Ask your server', 'Add', array['vegetarian']::text[], true, false, 6)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'food:oasis-fries';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:oasis-fries', 'Meat', 400, 0);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:guacamole', 'food:starters', 'Guacamole', 'A blend of fresh onion, jalapeño, tomato, cilantro, and lime, served with tortilla chips.', 1200, null, null, array['vegetarian', 'vegan']::text[], true, false, 7)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:caesar-salad', 'food:starters', 'Caesar Salad', 'Crisp romaine tossed in creamy Caesar dressing, topped with seasoned croutons and fresh grated Parmesan.', null, 'Ask your server', 'Add 8oz', array['vegetarian']::text[], true, false, 8)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'food:caesar-salad';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:caesar-salad', 'Chicken', 400, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:caesar-salad', 'Shrimp', 600, 1);
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('food:entrees', 'food', 'Entrees', null, 1)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:taco-dinner', 'food:entrees', 'Taco Dinner', 'Three street tacos with your choice of meat and toppings, served with rice and beans.', null, 'Ask your server', 'Choice of meat', '{}', true, false, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'food:taco-dinner';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Steak', null, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Tinga', null, 1);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Grilled Chicken', null, 2);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Ground Beef', null, 3);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Pastor', null, 4);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Birria', null, 5);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Carnitas', null, 6);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Veggie — grilled peppers, onions, tomato', null, 7);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Sour Cream', 50, 8);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Guacamole', 50, 9);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-dinner', 'Avocado Slices', 50, 10);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:taco-salad', 'food:entrees', 'Taco Salad', 'Crisp lettuce layered with seasoned beans, shredded cheese, fresh tomato, and sour cream, topped with your choice of meat and served in a golden crispy tortilla bowl.', null, 'Ask your server', 'Add', '{}', true, false, 1)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'food:taco-salad';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:taco-salad', 'Upgrade to Fajita Salad', 200, 0);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:birria-ramen', 'food:entrees', 'Birria Ramen', 'A fusion of ramen noodles with flavorful birria, cilantro, onion and cheese.', 1600, null, null, '{}', true, true, 2)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:bizza', 'food:entrees', 'Our Famous Bizza', 'Our unique birria pizza creation, topped with cilantro and onion. Comes with a side of consommé.', 2000, null, null, '{}', true, true, 3)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:burrito-dinner', 'food:entrees', 'Burrito Dinner', 'A hearty burrito filled with rice, beans, lettuce, cheese, tomato, sour cream and your choice of meat.', 1400, null, null, '{}', true, false, 4)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:enchiladas-dinner', 'food:entrees', 'Enchiladas Dinner', 'Stuffed with your choice of meat, smothered in green, poblano, mole or red sauce.', 1600, null, 'Sauce', '{}', true, false, 5)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'food:enchiladas-dinner';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:enchiladas-dinner', 'Green', null, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:enchiladas-dinner', 'Poblano', null, 1);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:enchiladas-dinner', 'Mole', null, 2);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:enchiladas-dinner', 'Red', null, 3);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:poblano-pasta', 'food:entrees', 'Poblano Pasta', 'Grilled chicken in a rich poblano sauce finished with ricotta salata. Shrimp substitution available.', 2000, null, null, '{}', true, false, 6)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:oasis-alfredo', 'food:entrees', 'Oasis Alfredo Pasta', 'Creamy alfredo pasta tossed with a hint of Mexican spice, topped with grilled chicken and fresh Parmesan. Shrimp substitution available.', null, 'Ask your server', null, '{}', true, false, 7)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:fajitas', 'food:entrees', 'Fajitas', 'Sizzling skillet of grilled bell peppers and onions with your choice of protein. Comes with rice, beans, lettuce, tomato, guacamole, sour cream and warm tortillas.', null, 'Ask your server', 'Choice of protein', '{}', true, false, 8)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'food:fajitas';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:fajitas', 'Steak', null, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:fajitas', 'Chicken', null, 1);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:fajitas', 'Shrimp', null, 2);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('food:fajitas', 'Combo', 400, 3);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:carne-asada', 'food:entrees', 'Carne Asada', 'Tender skirt steak served with rice and refried beans, grilled jalapeño and onions, with warm tortillas, sour cream, guacamole, lettuce and tomato.', 3400, null, null, '{}', true, false, 9)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:tampiquena', 'food:entrees', 'Tampiqueña Dinner', 'Tender skirt steak served with a mole cheese enchilada topped with sour cream and sesame seeds. Served with rice, refried beans, grilled jalapeño and onions, with warm tortillas, sour cream, guacamole, lettuce and tomato.', 3600, null, null, '{}', true, false, 10)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:mexican-rib-eye', 'food:entrees', 'Mexican Rib Eye', '16oz premium ribeye, flame-grilled and topped with herb butter. Served with street corn, rice, refried beans, grilled jalapeño and onions, with warm tortillas.', 4000, null, null, '{}', false, false, 11)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:torta', 'food:entrees', 'Torta', 'Traditional Mexican sandwich on toasted telera bread with refried beans, lettuce, tomato, sour cream, avocado, mayo and melted cheese with your choice of meat.', 1400, null, null, '{}', true, false, 12)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('food:specialty-tacos', 'food', 'Specialty Tacos', null, 2)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:quesabirrias', 'food:specialty-tacos', 'Our Famous Quesabirrias', 'Three cheesy, crispy tacos filled with slow-braised birria beef and melted cheese, served with a side of rich consommé for dipping.', 1600, null, null, '{}', true, true, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:tinga-tacos', 'food:specialty-tacos', 'Tinga Tacos', 'Two spicy shredded chicken tacos with tomato and sour cream, topped with lettuce and queso fresco.', 1600, null, null, array['spicy']::text[], true, false, 1)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:arrachera-tacos', 'food:specialty-tacos', 'Arrachera Tacos', 'Two tender, juicy skirt steak tacos seasoned and seared just like the taquerías in Mexico. Served on tortillas with onion, cilantro and salsa.', 1600, null, null, '{}', true, false, 2)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:carnitas-tacos', 'food:specialty-tacos', 'Carnitas Tacos', 'Two slow-cooked tacos topped with pickled red onions, cilantro and a squeeze of lime.', 1600, null, null, '{}', true, false, 3)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:shrimp-tacos', 'food:specialty-tacos', 'Shrimp Tacos', 'Two crispy shrimp tacos with fresh turnip slaw, chipotle aioli and tangy lime.', 1600, null, null, '{}', true, false, 4)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:fish-tacos', 'food:specialty-tacos', 'Fish Tacos', 'Two crispy battered fish tacos with fresh turnip slaw, chipotle aioli and tangy lime.', 1600, null, null, '{}', true, false, 5)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('food:sides', 'food', 'Sides', null, 3)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:los-esquites', 'food:sides', 'Los Esquites', 'Corn kernels with mayo, chili powder, Cotija cheese and lime.', 600, null, null, array['vegetarian']::text[], true, false, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:side-rice', 'food:sides', 'Rice', null, 300, null, null, array['vegetarian']::text[], true, false, 1)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:side-beans', 'food:sides', 'Beans', null, 300, null, null, array['vegetarian']::text[], true, false, 2)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:side-fries', 'food:sides', 'Fries', null, 600, null, null, array['vegetarian']::text[], true, false, 3)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('food:side-salad', 'food:sides', 'Salad', null, 500, null, null, array['vegetarian']::text[], true, false, 4)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;

insert into public.menus (slug, title, note, empty_state, sort) values ('cocktails', 'Cocktails & Bar', null, null, 1)
  on conflict (slug) do update set title = excluded.title, note = excluded.note, empty_state = excluded.empty_state, sort = excluded.sort;
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('cocktails:classic-cocktails', 'cocktails', 'Classic Cocktails', null, 0)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:margarita', 'cocktails:classic-cocktails', 'Margarita', 'Cazadores tequila, triple sec and fresh lime juice, served over ice or frozen.', null, 'Ask your server', 'Flavors', '{}', true, true, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'cocktails:margarita';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita', 'Lime', null, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita', 'Mango', null, 1);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita', 'Strawberry', null, 2);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita', 'Cucumber', null, 3);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita', 'Pineapple', null, 4);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita', 'Spicy', null, 5);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:blood-orange-paloma', 'cocktails:classic-cocktails', 'Blood Orange Paloma', 'Tequila, fresh lime, grapefruit soda and blood orange for a bright citrus finish, with a Tajín rim.', 1200, null, null, '{}', true, false, 1)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:cafe-de-horchata', 'cocktails:classic-cocktails', 'Café de Horchata', 'A smooth blend of bold coffee and creamy horchata, delivering a rich martini-style sip.', 1200, null, null, '{}', true, false, 2)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:cantarito', 'cocktails:classic-cocktails', 'Cantarito', 'Tequila, fresh citrus juices and grapefruit soda served with a bold chili-lime rim.', 1200, null, null, '{}', true, false, 3)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:mangonada', 'cocktails:classic-cocktails', 'Mangonada', 'Fresh mango purée, lime and tequila layered with chamoy and a Tajín rim — sweet, tangy and vibrant.', 1400, null, null, '{}', true, true, 4)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:mojito', 'cocktails:classic-cocktails', 'Mojito', 'Fresh mint, lime juice, sugar, rum and soda water — crisp, light and refreshing.', 1300, null, null, '{}', true, false, 5)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:oasis-old-fashioned', 'cocktails:classic-cocktails', 'Oasis Old Fashioned', 'House bourbon served over a large ice cube with orange peel — smooth, smoky and subtly sweet.', 1400, null, null, '{}', true, false, 6)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:pina-colada', 'cocktails:classic-cocktails', 'Piña Colada', 'Creamy coconut, pineapple juice and white rum blended smooth and topped with pineapple. Also available frozen.', 1200, null, null, '{}', true, false, 7)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:espresso-martini', 'cocktails:classic-cocktails', 'Espresso Martini', 'Premium vodka, fresh espresso and coffee liqueur finished with a silky foam top.', 1400, null, null, '{}', true, false, 8)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:sangria', 'cocktails:classic-cocktails', 'Sangria', 'Red wine, fresh citrus and seasonal fruit with a splash of liqueur — lightly sweet, smooth and refreshing.', 1100, null, null, '{}', true, false, 9)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('cocktails:shareables', 'cocktails', 'Fiesta Shareables', 'Built for the table.', 1)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:margarita-tower', 'cocktails:shareables', 'Margarita Tower', 'An oversized cocktail served in our signature tower — bold, refreshing and made to share with the table.', null, 'Ask your server', 'Flavors', '{}', true, true, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'cocktails:margarita-tower';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita-tower', 'Lime', null, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita-tower', 'Strawberry', null, 1);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita-tower', 'Mango', null, 2);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita-tower', 'Pineapple', null, 3);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:margarita-tower', 'Peach', null, 4);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:pitchers', 'cocktails:shareables', 'Pitchers', 'Your favorite margarita served in a generous, shareable pitcher. Sangria pitcher $38.', null, 'Ask your server', 'Flavors', '{}', true, false, 1)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'cocktails:pitchers';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:pitchers', 'Lime', null, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:pitchers', 'Strawberry', null, 1);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:pitchers', 'Mango', null, 2);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:pitchers', 'Jalapeño', null, 3);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:pitchers', 'Pineapple', null, 4);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:pitchers', 'Peach', null, 5);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:pitchers', 'Cucumber', null, 6);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:jumbo-cantarito', 'cocktails:shareables', 'Jumbo Cantarito', 'A jumbo-sized mix of premium tequila, fresh lime, orange and grapefruit juices topped with sparkling citrus soda and a Tajín rim — bright, refreshing and built for sharing.', 9900, null, null, '{}', true, false, 2)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('cocktails:celebrations', 'cocktails', 'Celebrations', 'Ask your server when you book — the team sets it up.', 2)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:birthday-celebration', 'cocktails:celebrations', 'Birthday Celebration', 'A signature birthday dessert, the staff birthday song and your choice of song, a high-energy LED show from our team, and a confetti popper.', null, 'Ask your server', 'Add champagne', '{}', true, true, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'cocktails:birthday-celebration';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:birthday-celebration', 'Moët mini bottle', 3500, 0);
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:birthday-celebration', 'Moët 750ml', 15000, 1);
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('cocktails:beer-seltzers', 'cocktails', 'Beer & Seltzers', 'Seltzer flavors vary based on availability.', 3)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-corona', 'cocktails:beer-seltzers', 'Corona', null, null, 'Ask your server', null, '{}', true, false, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-modelo-especial', 'cocktails:beer-seltzers', 'Modelo Especial', null, null, 'Ask your server', null, '{}', true, false, 1)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-modelo-negra', 'cocktails:beer-seltzers', 'Modelo Negra', null, null, 'Ask your server', null, '{}', true, false, 2)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-dos-equis', 'cocktails:beer-seltzers', 'Dos Equis', null, null, 'Ask your server', null, '{}', true, false, 3)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-pacifico', 'cocktails:beer-seltzers', 'Pacifico', null, null, 'Ask your server', null, '{}', true, false, 4)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-victoria', 'cocktails:beer-seltzers', 'Victoria', null, null, 'Ask your server', null, '{}', true, false, 5)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-heineken', 'cocktails:beer-seltzers', 'Heineken', null, null, 'Ask your server', null, '{}', true, false, 6)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-stella', 'cocktails:beer-seltzers', 'Stella Artois', null, null, 'Ask your server', null, '{}', true, false, 7)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-bud-light', 'cocktails:beer-seltzers', 'Bud Light', null, null, 'Ask your server', null, '{}', true, false, 8)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-miller-lite', 'cocktails:beer-seltzers', 'Miller Lite', null, null, 'Ask your server', null, '{}', true, false, 9)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-coors-light', 'cocktails:beer-seltzers', 'Coors Light', null, null, 'Ask your server', null, '{}', true, false, 10)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-busch-light', 'cocktails:beer-seltzers', 'Busch Light', null, null, 'Ask your server', null, '{}', true, false, 11)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-ultra', 'cocktails:beer-seltzers', 'Michelob Ultra', null, null, 'Ask your server', null, '{}', true, false, 12)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:seltzer-high-noon', 'cocktails:beer-seltzers', 'High Noon', null, null, 'Ask your server', null, '{}', true, false, 13)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:seltzer-white-claw', 'cocktails:beer-seltzers', 'White Claw', null, null, 'Ask your server', null, '{}', true, false, 14)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:beer-na-corona', 'cocktails:beer-seltzers', 'Corona Non-Alcoholic (21+)', null, null, 'Ask your server', null, '{}', true, false, 15)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:cider-angry-orchard', 'cocktails:beer-seltzers', 'Angry Orchard', null, null, 'Ask your server', null, '{}', true, false, 16)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:craft-blue-moon', 'cocktails:beer-seltzers', 'Blue Moon', null, null, 'Ask your server', null, '{}', true, false, 17)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('cocktails:wine', 'cocktails', 'Wine', null, 4)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:wine-cabernet', 'cocktails:wine', 'Cabernet', null, null, 'Ask your server', null, '{}', true, false, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:wine-pinot-noir', 'cocktails:wine', 'Pinot Noir', null, null, 'Ask your server', null, '{}', true, false, 1)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:wine-merlot', 'cocktails:wine', 'Merlot', null, null, 'Ask your server', null, '{}', true, false, 2)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:wine-chardonnay', 'cocktails:wine', 'Chardonnay', null, null, 'Ask your server', null, '{}', true, false, 3)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:wine-sauvignon-blanc', 'cocktails:wine', 'Sauvignon Blanc', null, null, 'Ask your server', null, '{}', true, false, 4)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:wine-pinot-grigio', 'cocktails:wine', 'Pinot Grigio', null, null, 'Ask your server', null, '{}', true, false, 5)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:wine-moscato', 'cocktails:wine', 'Moscato', null, null, 'Ask your server', null, '{}', true, false, 6)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_categories (id, menu_slug, name, note, sort) values ('cocktails:beverages', 'cocktails', 'Non-Alcoholic', null, 5)
  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-pepsi', 'cocktails:beverages', 'Pepsi', null, null, 'Ask your server', null, '{}', true, false, 0)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-diet-pepsi', 'cocktails:beverages', 'Diet Pepsi', null, null, 'Ask your server', null, '{}', true, false, 1)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-sprite', 'cocktails:beverages', 'Sprite', null, null, 'Ask your server', null, '{}', true, false, 2)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-dr-pepper', 'cocktails:beverages', 'Dr. Pepper', null, null, 'Ask your server', null, '{}', true, false, 3)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-lemonade', 'cocktails:beverages', 'Lemonade', null, null, 'Ask your server', null, '{}', true, false, 4)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-brisk', 'cocktails:beverages', 'Brisk Sweet / Unsweet Iced Tea', null, null, 'Ask your server', null, '{}', true, false, 5)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-jarritos', 'cocktails:beverages', 'Jarritos', 'Flavors vary based on availability.', 400, null, null, '{}', true, false, 6)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-horchata', 'cocktails:beverages', 'Horchata', null, 400, null, null, array['vegetarian']::text[], true, false, 7)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'cocktails:na-horchata';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:na-horchata', 'Refill', 100, 0);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-jamaica', 'cocktails:beverages', 'Jamaica', null, 400, null, null, array['vegetarian', 'vegan']::text[], true, false, 8)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
delete from public.menu_modifiers where item_id = 'cocktails:na-jamaica';
insert into public.menu_modifiers (item_id, label, price_cents, sort) values ('cocktails:na-jamaica', 'Refill', 100, 0);
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-coffee', 'cocktails:beverages', 'Coffee', null, 500, null, null, '{}', true, false, 9)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;
insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)
  values ('cocktails:na-red-bull', 'cocktails:beverages', 'Red Bull', null, 400, null, null, '{}', true, false, 10)
  on conflict (id) do update set name = excluded.name, description = excluded.description,
    price_cents = excluded.price_cents, price_note = excluded.price_note,
    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,
    available = excluded.available, featured = excluded.featured, sort = excluded.sort;

insert into public.menus (slug, title, note, empty_state, sort) values ('brunch', 'Brunch', 'Served Saturday and Sunday, 10am to 3pm.', 'The full brunch menu is being finalized with the kitchen. Brunch is served every Saturday and Sunday from 10am to 3pm — call us or come in and ask what the kitchen is running this weekend.', 2)
  on conflict (slug) do update set title = excluded.title, note = excluded.note, empty_state = excluded.empty_state, sort = excluded.sort;

-- Event series -------------------------------------------------------
-- NOTE: no dates here. Occurrences are generated from cadence at read time.
insert into public.event_series (slug, title, summary, description, cadence, start_minutes, end_minutes, age_min, age_note, music_formats, venue_name, artwork_asset_id, ticket_url, price_cents, fee_cents, status, series_ends_on, sort)
  values ('oasis-fridays', 'Oasis Fridays', 'House, Top 100 and Hip-Hop. 18+, doors at 10.', 'Oasis Fridays is an 18+ Friday night party at Oasis. Expect a high-energy night of House, Top 100 and some Hip-Hop, with dancing, drinks and a nightclub atmosphere.', 'weekly:5', 1320, 1560, 18, 'Drinks 21+ with valid ID.', array['House', 'Top 100', 'Hip-Hop']::text[], 'Oasis Mexican Kitchen & Bar', 'eventFridays', 'https://www.oasismexicankitchenbar.com/event-details/oasis-fridays', 1000, 25, 'scheduled'::public.event_status, null, 0)
  on conflict (slug) do update set title = excluded.title, summary = excluded.summary,
    description = excluded.description, cadence = excluded.cadence,
    start_minutes = excluded.start_minutes, end_minutes = excluded.end_minutes,
    age_min = excluded.age_min, age_note = excluded.age_note,
    music_formats = excluded.music_formats, artwork_asset_id = excluded.artwork_asset_id,
    ticket_url = excluded.ticket_url, price_cents = excluded.price_cents,
    fee_cents = excluded.fee_cents, status = excluded.status, sort = excluded.sort;
insert into public.event_series (slug, title, summary, description, cadence, start_minutes, end_minutes, age_min, age_note, music_formats, venue_name, artwork_asset_id, ticket_url, price_cents, fee_cents, status, series_ends_on, sort)
  values ('oasis-latin-saturdays', 'Oasis Latin Saturdays', 'Reggaetón, corridos and guaracha. 18+, doors at 10.', 'Latin Saturdays at Oasis. Dance to reggaetón, corridos and guaracha in a high-energy room with great music, drinks and late-night vibes. 18+.', 'weekly:6', 1320, 1560, 18, 'Drinks 21+ with valid ID.', array['Reggaetón', 'Corridos', 'Guaracha']::text[], 'Oasis Mexican Kitchen & Bar', 'eventLatinSaturdays', 'https://www.oasismexicankitchenbar.com/event-details/oasis-latin-saturdays', 1000, 25, 'scheduled'::public.event_status, null, 1)
  on conflict (slug) do update set title = excluded.title, summary = excluded.summary,
    description = excluded.description, cadence = excluded.cadence,
    start_minutes = excluded.start_minutes, end_minutes = excluded.end_minutes,
    age_min = excluded.age_min, age_note = excluded.age_note,
    music_formats = excluded.music_formats, artwork_asset_id = excluded.artwork_asset_id,
    ticket_url = excluded.ticket_url, price_cents = excluded.price_cents,
    fee_cents = excluded.fee_cents, status = excluded.status, sort = excluded.sort;

-- Catering -----------------------------------------------------------
insert into public.catering_packages (id, name, serves_min, serves_max, price_cents, includes, sort)
  values ('fiesta-pack', 'Fiesta Pack', 15, 20, 24500, array['40 tacos — steak, chicken, pastor or mix', 'Rice & beans (half tray)', 'Chips & salsa (½ gallon)', 'Red & green salsa included']::text[], 0)
  on conflict (id) do update set name = excluded.name, serves_min = excluded.serves_min,
    serves_max = excluded.serves_max, price_cents = excluded.price_cents,
    includes = excluded.includes, sort = excluded.sort;
insert into public.catering_packages (id, name, serves_min, serves_max, price_cents, includes, sort)
  values ('tradicion-pack', 'Tradición Pack', 25, 30, 36500, array['80 tacos (two trays of 40)', 'Rice & beans (full tray)', 'Chips & salsa (1 gallon)', 'Red & green salsa included']::text[], 1)
  on conflict (id) do update set name = excluded.name, serves_min = excluded.serves_min,
    serves_max = excluded.serves_max, price_cents = excluded.price_cents,
    includes = excluded.includes, sort = excluded.sort;
insert into public.catering_packages (id, name, serves_min, serves_max, price_cents, includes, sort)
  values ('fajita-fiesta', 'Fajita Fiesta', 25, 30, 39500, array['Fajitas, full tray — steak, chicken or mix', 'Rice & beans (full tray)', 'Tortillas', 'Chips & salsa (1 gallon)', 'Red & green salsa included']::text[], 2)
  on conflict (id) do update set name = excluded.name, serves_min = excluded.serves_min,
    serves_max = excluded.serves_max, price_cents = excluded.price_cents,
    includes = excluded.includes, sort = excluded.sort;
insert into public.catering_packages (id, name, serves_min, serves_max, price_cents, includes, sort)
  values ('birria-lovers-pack', 'Birria Lovers Pack', 20, 25, 31000, array['Quesabirria tacos (40 pieces)', 'Rice & beans (full tray)', 'Chips & salsa (½ gallon)', '½ gallon consommé']::text[], 3)
  on conflict (id) do update set name = excluded.name, serves_min = excluded.serves_min,
    serves_max = excluded.serves_max, price_cents = excluded.price_cents,
    includes = excluded.includes, sort = excluded.sort;
insert into public.catering_packages (id, name, serves_min, serves_max, price_cents, includes, sort)
  values ('office-lunch-pack', 'Office Lunch Pack', 20, 25, 29500, array['Poblano pasta with chicken', '40 tacos — chicken, pastor or steak', 'Chips & salsa (½ gallon)']::text[], 4)
  on conflict (id) do update set name = excluded.name, serves_min = excluded.serves_min,
    serves_max = excluded.serves_max, price_cents = excluded.price_cents,
    includes = excluded.includes, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('tray-40-tacos', 'Tray of 40 tacos', 12000, 'Steak, chicken, pastor or mix. All toppings included — lettuce, cheese, tomato, onion, cilantro and limes. Includes 1 pint each of red & green salsa.', 0)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('tray-40-half-burritos', 'Tray of 40 half burritos', 16500, 'Includes 1 pint each of red & green salsa.', 1)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('tray-40-quesabirria', 'Tray of 40 quesabirria tacos', 13500, 'Includes 1 gallon of consommé.', 2)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('fajitas-full-tray', 'Fajitas — full tray', 16000, 'Includes 1 pint each of red & green salsa.', 3)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('fajitas-half-tray', 'Fajitas — half tray', 8500, 'Includes 1 pint each of red & green salsa.', 4)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('poblano-pasta-tray', 'Poblano pasta with chicken', 11000, 'Serves 20–25.', 5)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('rice-full-tray', 'Rice — full tray', 6000, null, 6)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('rice-half-tray', 'Rice — half tray', 3200, null, 7)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('beans-full-tray', 'Beans — full tray', 6000, null, 8)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('beans-half-tray', 'Beans — half tray', 3200, null, 9)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('chips-salsa-catering', 'Chips & salsa', 3000, 'Includes ½ gallon of salsa.', 10)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('salsa-half-gallon', '½ gallon salsa', 2000, null, 11)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;
insert into public.catering_items (id, name, price_cents, note, sort) values ('consomme-half-gallon', '½ gallon consommé', 1500, null, 12)
  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;

-- Page sections ------------------------------------------------------
insert into public.page_sections (page, key, eyebrow, heading, body, visible, variant, sort)
  values ('home', 'experience', 'What goes on here', 'A kitchen, a bar, and a room that changes character after ten.', 'Lunch and dinner every day. Brunch on the weekend. Cocktails all night. And on Friday and Saturday the dining room turns into something else entirely.', true, 'stagger', 0)
  on conflict (page, key) do update set eyebrow = excluded.eyebrow, heading = excluded.heading,
    body = excluded.body, visible = excluded.visible, variant = excluded.variant, sort = excluded.sort;
insert into public.page_sections (page, key, eyebrow, heading, body, visible, variant, sort)
  values ('home', 'signatures', 'Oasis originals', 'The three you came for.', 'Everything on the menu is worth ordering. These are the ones people drive out to Lockport for.', true, 'editorial-left', 1)
  on conflict (page, key) do update set eyebrow = excluded.eyebrow, heading = excluded.heading,
    body = excluded.body, visible = excluded.visible, variant = excluded.variant, sort = excluded.sort;
insert into public.page_sections (page, key, eyebrow, heading, body, visible, variant, sort)
  values ('home', 'bar', 'Bar & brunch', 'Margaritas by the tower. Brunch on the weekend.', 'A full bar built around tequila, plus the shareables that show up at every good table — the tower, the pitchers, the jumbo cantarito.', true, 'editorial-right', 2)
  on conflict (page, key) do update set eyebrow = excluded.eyebrow, heading = excluded.heading,
    body = excluded.body, visible = excluded.visible, variant = excluded.variant, sort = excluded.sort;
insert into public.page_sections (page, key, eyebrow, heading, body, visible, variant, sort)
  values ('home', 'after-dark', 'Oasis After Dark', 'Friday and Saturday, the lights go down.', 'Two nights a week, doors at ten, eighteen and up. House and Top 100 on Friday. Reggaetón, corridos and guaracha on Saturday.', true, 'band', 3)
  on conflict (page, key) do update set eyebrow = excluded.eyebrow, heading = excluded.heading,
    body = excluded.body, visible = excluded.visible, variant = excluded.variant, sort = excluded.sort;
insert into public.page_sections (page, key, eyebrow, heading, body, visible, variant, sort)
  values ('home', 'catering', 'Catering & celebrations', 'Feed twenty. Or throw the whole party here.', 'Trays, packages and full spreads for pickup — or bring the celebration to us and let the team handle the rest.', true, 'editorial-left', 4)
  on conflict (page, key) do update set eyebrow = excluded.eyebrow, heading = excluded.heading,
    body = excluded.body, visible = excluded.visible, variant = excluded.variant, sort = excluded.sort;
insert into public.page_sections (page, key, eyebrow, heading, body, visible, variant, sort)
  values ('home', 'gallery', 'The room', 'Come see it.', null, true, 'plain', 5)
  on conflict (page, key) do update set eyebrow = excluded.eyebrow, heading = excluded.heading,
    body = excluded.body, visible = excluded.visible, variant = excluded.variant, sort = excluded.sort;

-- Page SEO -----------------------------------------------------------
insert into public.page_seo (page, title, description, og_asset_id) values ('home', 'Oasis Mexican Kitchen & Bar — Modern Mexican in Lockport, IL', 'Modern Mexican kitchen and bar in Lockport, IL. Birria, quesabirrias, handcrafted cocktails, weekend brunch, and 18+ nightlife Friday and Saturday. Reserve a table or order online.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;
insert into public.page_seo (page, title, description, og_asset_id) values ('menu', 'Food Menu — Oasis Mexican Kitchen & Bar, Lockport IL', 'Starters, entrees, specialty tacos and sides at Oasis Mexican Kitchen & Bar in Lockport, IL. Quesabirrias, the Bizza, birria ramen, fajitas, carne asada and more.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;
insert into public.page_seo (page, title, description, og_asset_id) values ('cocktails', 'Cocktails & Bar — Oasis Mexican Kitchen & Bar, Lockport IL', 'Margaritas, palomas, cantaritos, margarita towers and pitchers, plus a full beer and wine list at Oasis in Lockport, IL.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;
insert into public.page_seo (page, title, description, og_asset_id) values ('brunch', 'Weekend Brunch — Oasis Mexican Kitchen & Bar, Lockport IL', 'Brunch served Saturday and Sunday, 10am to 3pm, at Oasis Mexican Kitchen & Bar in Lockport, IL.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;
insert into public.page_seo (page, title, description, og_asset_id) values ('events', 'Events & Nightlife — Oasis Mexican Kitchen & Bar, Lockport IL', 'Oasis Fridays and Oasis Latin Saturdays. 18+, doors at 10pm, $10 general admission. House, Top 100, reggaetón, corridos and guaracha in Lockport, IL.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;
insert into public.page_seo (page, title, description, og_asset_id) values ('catering', 'Catering — Oasis Mexican Kitchen & Bar, Lockport IL', 'Taco trays, fajita trays, quesabirria trays and party packages serving 15–30 from Oasis Mexican Kitchen & Bar in Lockport, IL.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;
insert into public.page_seo (page, title, description, og_asset_id) values ('privateEvents', 'Private Events & Celebrations — Oasis Mexican Kitchen & Bar', 'Host your birthday, quinceañera or team celebration at Oasis Mexican Kitchen & Bar in Lockport, IL. Send an inquiry and our team will follow up.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;
insert into public.page_seo (page, title, description, og_asset_id) values ('visit', 'Visit — Oasis Mexican Kitchen & Bar, 1250 E. 9th St., Lockport IL', 'Hours, address, directions and phone for Oasis Mexican Kitchen & Bar at 1250 E. 9th St., Lockport, IL 60441.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;
insert into public.page_seo (page, title, description, og_asset_id) values ('careers', 'Join Our Team — Oasis Mexican Kitchen & Bar, Lockport IL', 'Now hiring at Oasis Mexican Kitchen & Bar in Lockport, IL. Flexible shifts, staff meals, and a crew that feels like familia.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;
insert into public.page_seo (page, title, description, og_asset_id) values ('privacy', 'Privacy — Oasis Mexican Kitchen & Bar', 'How Oasis Mexican Kitchen & Bar handles information submitted through this website.', null)
  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;

-- Media assets -------------------------------------------------------
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('brandLogo', '/media/brand/oasis-logo.png', 'Oasis Mexican Kitchen & Bar', 1200, 483, '1200:483', '50% 50%', null, 'brand')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('brandGrain', '/media/brand/paper-grain.png', null, 160, 160, '1:1', '50% 50%', null, 'final')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('heroVideo', '/media/video/hero-loop.mp4', null, 720, 1280, '9:16', '50% 50%', '/media/home/hero-poster.jpg', 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('heroPoster', '/media/home/hero-poster.jpg', null, 720, 1280, '9:16', '50% 50%', null, 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('backBar', '/media/home/back-bar.jpg', 'The back bar at Oasis, stocked with tequila, whiskey and vodka under warm light', 1069, 1600, '1069:1600', '50% 45%', null, 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('exteriorSign', '/media/home/exterior-sign.jpg', 'The Oasis Mexican Restaurant sign on the building exterior', 720, 540, '4:3', '50% 50%', null, 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('diningRoom', '/media/home/dining-room.jpg', 'The Oasis dining room full at service, under rattan pendant lights, with the greenery wall behind', 1143, 1728, '1143:1728', '50% 55%', null, 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('plateTorta', '/media/menu/plate-torta.jpg', 'A torta served with rice, refried beans and salsa', 720, 900, '4:5', '50% 50%', null, 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('roomAtmosphere', '/media/home/room-atmosphere.jpg', 'The Oasis dining room, with the greenery wall and rattan pendant lights', 720, 480, '3:2', '50% 50%', null, 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('bartender', '/media/home/gallery-02.jpg', 'A bartender holding a freshly made margarita', 720, 720, '1:1', '50% 40%', null, 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('cocktailPair', '/media/menu/cocktail-pair.jpg', 'A margarita with a Tajín rim being finished at the bar', 720, 900, '4:5', '50% 50%', null, 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('brunchTable', null, 'A brunch table at Oasis', 1200, 1500, '4:5', '50% 45%', null, 'placeholder')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('nightlifeCrowd', null, 'A busy night on the floor at Oasis', 1800, 1200, '3:2', '50% 40%', null, 'placeholder')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('eventFridays', null, 'Oasis Fridays', 1200, 1500, '4:5', '50% 45%', null, 'placeholder')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('eventLatinSaturdays', null, 'Oasis Latin Saturdays', 1200, 1500, '4:5', '50% 45%', null, 'placeholder')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('cateringSpread', null, 'Catering trays laid out for a party', 1800, 1200, '3:2', '50% 50%', null, 'placeholder')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('cateringTray', null, 'A full tray of tacos ready for pickup', 1200, 1200, '1:1', '50% 50%', null, 'placeholder')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('privateEvents', null, 'A celebration table set up at Oasis', 1800, 1200, '3:2', '50% 42%', null, 'placeholder')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('birthdayCelebration', null, 'The Oasis team bringing out a birthday dessert', 1200, 1500, '4:5', '50% 40%', null, 'placeholder')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;
insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)
  values ('teamEnergy', '/media/careers/team-energy.jpg', 'A server carrying a tray of drinks through the dining room', 720, 480, '3:2', '50% 50%', null, 'temp-wix')
  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,
    width = excluded.width, height = excluded.height, ratio = excluded.ratio,
    focal = excluded.focal, poster = excluded.poster, status = excluded.status;

commit;
