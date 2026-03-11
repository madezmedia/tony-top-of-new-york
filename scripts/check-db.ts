import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users, error: usersError } = await supabase.from('users').select('*').limit(5);
  console.log('Users (limited):', users);
  if (usersError) console.error(usersError);
  
  const { data: films, error: filmsError } = await supabase.from('films').select('*');
  console.log('Films:', films);
  if (filmsError) console.error(filmsError);

  const { data: pending, error: pendingError } = await supabase.from('pending_orders').select('*');
  console.log('Pending Orders:', pending);
  if (pendingError) console.error(pendingError);

  const { data: ents, error: entsError } = await supabase.from('entitlements').select('*');
  console.log('Entitlements:', ents);
  if (entsError) console.error(entsError);
}

check();
