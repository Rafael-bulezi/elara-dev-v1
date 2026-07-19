const { Client } = require('pg');

const url = process.env.VITE_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
if (!url || !dbPassword) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_DB_PASSWORD');
  process.exit(1);
}
const projectId = url.replace(/^https:\/\/([^/]+).*$/, '$1').replace('.supabase.co', '');
const connectionString = `postgresql://postgres.${projectId}:${dbPassword}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

async function runQuery(sql) {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const result = await client.query(sql);
    return result;
  } finally {
    await client.end();
  }
}

const command = process.argv[2];

(async () => {
  if (command === 'reload') {
    console.log('Reloading PostgREST schema cache...');
    await runQuery("SELECT pg_notify('pgrst', 'reload schema');");
    console.log('Reload signal sent.');
  } else if (command === 'stats') {
    const result = await runQuery(`
      SELECT 
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM products) as products,
        (SELECT COUNT(*) FROM profiles) as profiles,
        (SELECT COUNT(*) FROM orders) as orders,
        (SELECT COUNT(*) FROM chats) as chats,
        (SELECT COUNT(*) FROM messages) as messages
    `);
    console.log(result.rows[0]);
  } else if (command === 'tables') {
    const result = await runQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(result.rows.map(r => r.table_name).join('\n'));
  } else {
    console.log('Usage: node db-utils.cjs [reload|stats|tables]');
  }
})();
