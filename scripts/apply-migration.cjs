const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const url = process.env.VITE_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!url || !dbPassword) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_DB_PASSWORD');
  process.exit(1);
}

const projectRef = url.replace(/^https:\/\/([^/]+).*$/, '$1');
const projectId = projectRef.replace('.supabase.co', '');
// Supabase transaction pooler connection string (required for external connections)
const connectionString = `postgresql://postgres.${projectId}:${dbPassword}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

const sqlFile = process.argv[2] || path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');
    await client.query(sql);
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
