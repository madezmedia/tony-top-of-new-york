-- Seeder for Blogging System (News Items)
-- T.O.N.Y. Series Official Updates

INSERT INTO public.posts (slug, title, excerpt, content, published)
VALUES 
(
    'casting-call-winston-salem-nc', 
    'Casting Call: Winston Salem, NC', 
    'The search for new faces continues! T.O.N.Y. is heading to North Carolina for a major casting expansion this Spring.',
    '## Join the Legacy\n\nWe are excited to announce a major casting call in Winston Salem, North Carolina. T.O.N.Y. (Top of New York) is expanding its horizons and seeking raw talent to join our cinematic universe.\n\n### Details\n- **Location:** Winston Salem, NC\n- **Roles:** Lead and Supporting roles available.\n- **Aesthetic:** Gritty, Urbano, Noir.\n\nKeep an eye on this space for specific dates and venue information.',
    true
),
(
    'new-episodes-in-production', 
    'New Episodes in Production', 
    'The saga continues. Production has officially resumed for the next chapters of the Cortez family legacy.',
    '## Back on Set\n\nThe cameras are rolling once again. The production team is hard at work in the heart of the Bronx, bringing you deeper into the complex world of Michael Cortez and the Beaumont empire.\n\nExpect higher stakes, deeper betrayals, and the same raw energy that defined the premiere episode.\n\n**Coming Spring 2026.**',
    true
),
(
    'roku-app-and-website-launch', 
    'Roku App & Website Launch', 
    'Experience T.O.N.Y. like never before. Our official Roku channel and all-new web platform are now live and streaming.',
    '## The Network is Live\n\nWe are proud to announce the dual launch of the official T.O.N.Y. Roku Channel and our revamped web platform. \n\n### Streaming Features\n- **4K Uncensored Access**: High-quality streaming for all season pass holders.\n- **Cross-Platform Sync**: Start on Roku, finish on your phone.\n- **Direct Support**: Your purchase directly supports the production of future episodes.\n\n[Watch Now](/watch) to start your journey.',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    published = EXCLUDED.published,
    updated_at = timezone('utc'::text, now());
