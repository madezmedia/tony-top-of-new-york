-- Seed data for database
INSERT INTO public.films (slug, title, price_cents, mux_playback_id, trailer_url)
VALUES (
    'tony-top-of-new-york',
    'T.O.N.Y. - Top of New York',
    499, -- $4.99
    'YOUR_MUX_PLAYBACK_ID_HERE', -- Replace with your Mux Video Playback ID
    'https://www.youtube.com/embed/F1wtn1g_SZI'
) ON CONFLICT (slug) DO NOTHING;
