const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsmeowfjstnwjsvqawqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzbWVvd2Zqc3Rud2pzdnFhd3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc0MzI5NCwiZXhwIjoyMDg4MzE5Mjk0fQ.eLKkrqYJDcAS6tz_STV6tyWiT--nb9Dqpt7gFL9hjEs'
);

async function run() {
  const { data, error } = await supabase
    .from('films')
    .upsert({
      slug: 'tony-top-of-new-york',
      title: 'T.O.N.Y. - Top of New York',
      price_cents: 499,
      mux_playback_id: 'GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko',
      trailer_url: 'https://www.youtube.com/embed/F1wtn1g_SZI'
    }, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Film upserted:', JSON.stringify(data, null, 2));
  }

  const { data: films } = await supabase.from('films').select('*');
  console.log('All films:', JSON.stringify(films, null, 2));
}
run();
