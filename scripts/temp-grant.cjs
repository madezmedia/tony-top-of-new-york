const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) {
       val = val.slice(1, -1);
    }
    env[match[1].trim()] = val.trim();
  }
});

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const userId = '391c1cea-53f0-4935-aa2e-162bb86d26a6';
  const filmId = 'b4c45a12-7a21-4cab-ad63-246668cb4980';
  const squareOrderId = '0iBJSkdUpJNyFGIUMXVqiJ2hsCQZY';

  console.log('Granting entitlement manually...');

  const { data, error } = await supabase.from('entitlements').upsert({
    user_id: userId,
    film_id: filmId,
    active: true,
    purchased_at: new Date().toISOString(),
    square_payment_id: squareOrderId
  }, {
    onConflict: 'user_id,film_id'
  });

  if (error) {
    console.error('Error inserting entitlement:', error);
  } else {
    console.log('Success! Entitlement granted.');
    
    // Clean up the pending order to prevent duplicates if any
    const { error: delError } = await supabase.from('pending_orders').delete().match({ user_id: userId, film_id: filmId });
    if (delError) {
       console.error('Error deleting pending order:', delError);
    } else {
       console.log('Cleaned up pending order.');
    }
  }
}

main();
