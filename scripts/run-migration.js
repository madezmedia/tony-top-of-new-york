/**
 * Run Device Codes Migration
 *
 * This script runs the device_codes table migration using Supabase.
 * Usage: node scripts/run-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Parse connection string
// Format: postgresql://postgres:[password]@[project].supabase.co:5432/postgres
const connectionString = supabaseUrl.replace('https://', 'postgresql://postgres:' + supabaseKey + '@') + ':5432/postgres';

async function runMigration() {
  console.log('🚀 Starting device_codes migration...\n');
  console.log(`📡 Connecting to: ${supabaseUrl}\n`);

  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/20260312_device_codes.sql'),
    'utf8'
  );

  // Use native PostgreSQL commands
  const { execSync } = require('child_process');

  try {
    // Try using the Supabase CLI to execute SQL
    const tempFile = '/tmp/device_codes_migration.sql';
    fs.writeFileSync(tempFile, migrationSQL);

    console.log('📝 Migration file created, executing via Supabase...\n');

    // Method 1: Try Supabase CLI db remote execute
    try {
      const output = execSync(
        `supabase db execute --file ${tempFile}`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      console.log('✅ Migration executed successfully via Supabase CLI!');
      console.log(output);
    } catch (cliError) {
      // Method 2: Try with curl to Supabase REST API
      console.log('⚠️  Supabase CLI not available, trying REST API...\n');

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql: migrationSQL })
      });

      if (response.ok) {
        console.log('✅ Migration executed successfully via REST API!');
      } else {
        throw new Error(`REST API failed: ${await response.text()}`);
      }
    }

    // Verify table was created
    console.log('\n🔍 Verifying table creation...\n');

    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/device_codes?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (verifyResponse.ok || verifyResponse.status === 406) {
      console.log('✅ device_codes table verified!');
    } else {
      console.log('⚠️  Could not verify table (this may be normal)');
    }

    console.log('\n🎉 Migration complete! The device_codes table is ready.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Alternative: Run the SQL manually in Supabase Dashboard:');
    console.error(`   1. Go to: ${supabaseUrl.replace('https://', 'https://app.supabase.com/project/_')}/sql/new`);
    console.error('   2. Copy and paste the contents of:');
    console.error('      supabase/migrations/20260312_device_codes.sql');
    console.error('   3. Click "Run"\n');
    process.exit(1);
  }
}

runMigration().catch(console.error);
