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
  const email = 'madezmediapartners@gmail.com';

  console.log('Granting admin access...');

  const { data, error } = await supabase.from('admins').upsert({
    email: email
  }, {
    onConflict: 'email'
  });

  if (error) {
    console.error('Error inserting admin:', error);
  } else {
    console.log(`Success! Given admin access to: ${email}`);
  }
}

main();
