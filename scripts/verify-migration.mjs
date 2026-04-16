/**
 * Verify device_codes table exists
 *
 * Run this after executing the migration to verify everything worked
 */

import dotenv from 'dotenv';
import pg from 'pg';
const { Client } = pg;

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Add VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local');
  process.exit(1);
}

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function verify() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'device_codes'
      );
    `);

    if (result.rows[0].exists) {
      console.log('✅ device_codes table exists!\n');

      // Show table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'device_codes'
        ORDER BY ordinal_position;
      `);

      console.log('📋 Table structure:');
      console.table(columns.rows);

      // Check RLS policies
      const policies = await client.query(`
        SELECT policyname, permissive, roles, cmd, qual
        FROM pg_policies
        WHERE tablename = 'device_codes';
      `);

      if (policies.rows.length > 0) {
        console.log('\n🔒 RLS Policies:');
        console.table(policies.rows);
      }

      console.log('\n🎉 Migration successful! Ready for Roku auth.\n');
      console.log('📖 Next steps:');
      console.log('   1. Deploy API endpoints to Vercel');
      console.log('   2. Test with: curl -X POST https://www.topofnewyork.com/api/device-code -d \'{"device_id":"test"}\'\n');

    } else {
      console.log('❌ device_codes table not found');
      console.log('\n💡 Run the migration first:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Open: supabase/migrations/20260312_device_codes.sql');
      console.log('   3. Click "Run"\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verify();
