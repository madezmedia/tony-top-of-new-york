-- Seed data for T.O.N.Y. — Top of New York
-- Upsert the main film with the real Mux public playback ID
INSERT INTO public.films (slug, title, price_cents, mux_playback_id, trailer_url)
VALUES (
    'tony-top-of-new-york',
    'T.O.N.Y. - Top of New York',
    499, -- $4.99
    'GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko',
    'https://www.youtube.com/embed/F1wtn1g_SZI'
) ON CONFLICT (slug) DO UPDATE SET
    mux_playback_id = EXCLUDED.mux_playback_id,
    title = EXCLUDED.title,
    price_cents = EXCLUDED.price_cents,
    trailer_url = EXCLUDED.trailer_url;
