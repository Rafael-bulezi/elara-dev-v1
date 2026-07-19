const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const projectRef = url.replace(/^https:\/\/([^/]+).*$/, '$1');
const connectionString = `postgresql://postgres:${key}@db.${projectRef}:5432/postgres`;

const sqlFile = process.argv[2] || path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

const client = new Client({ connectionString });

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
