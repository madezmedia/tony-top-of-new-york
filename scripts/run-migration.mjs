/**
 * Run Device Codes Migration
 *
 * Direct PostgreSQL connection to run the migration
 */

import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Convert Supabase URL to PostgreSQL connection string
// From: https://xxxxx.supabase.co
// To: postgresql://postgres:[REF]:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('❌ Invalid Supabase URL format');
  process.exit(1);
}

const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🚀 Starting device_codes migration...\n');
    console.log(`📡 Connecting to Supabase project: ${projectRef}\n`);

    await client.connect();
    console.log('✅ Connected to database\n');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/20260312_device_codes.sql'),
      'utf8'
    );

    // Execute the migration
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully!\n');

    // Verify table exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'device_codes'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('✅ device_codes table verified!\n');

      // Show table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'device_codes'
        ORDER BY ordinal_position;
      `);

      console.log('📋 Table structure:');
      console.table(columns.rows);
    }

    console.log('\n🎉 Migration complete! Ready for Roku device authentication.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }

    console.log('\n💡 You can also run this manually in Supabase Dashboard:');
    console.log(`   1. Go to: https://app.supabase.com/project/${projectRef}/sql/new`);
    console.log('   2. Copy and paste the contents of:');
    console.log('      supabase/migrations/20260312_device_codes.sql');
    console.log('   3. Click "Run"\n');

    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
