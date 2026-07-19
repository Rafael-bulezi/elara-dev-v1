const { Client } = require('pg');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = url.replace(/^https:\/\/([^/]+).*$/, '$1');
const projectId = ref.replace('.supabase.co', '');

const hosts = [
  { host: `db.${ref}`, user: 'postgres' },
  { host: `${projectId}.pooler.supabase.com`, user: `postgres.${projectId}` },
  { host: 'aws-0-us-east-1.pooler.supabase.com', user: `postgres.${projectId}` },
  { host: 'aws-0-eu-west-1.pooler.supabase.com', user: `postgres.${projectId}` },
  { host: 'aws-0-eu-west-2.pooler.supabase.com', user: `postgres.${projectId}` },
  { host: 'aws-0-eu-central-1.pooler.supabase.com', user: `postgres.${projectId}` },
  { host: 'aws-0-ap-southeast-1.pooler.supabase.com', user: `postgres.${projectId}` },
  { host: 'aws-0-sa-east-1.pooler.supabase.com', user: `postgres.${projectId}` },
];

async function tryConnect({ host, user }) {
  const client = new Client({
    host,
    port: 5432,
    user,
    password: key,
    database: 'postgres',
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log('SUCCESS:', host, user, '->', res.rows[0].version.split(' ').slice(0, 3).join(' '));
    await client.end();
    return true;
  } catch (err) {
    console.log('FAIL:', host, user, '->', err.message);
    try { await client.end(); } catch {}
    return false;
  }
}

(async () => {
  for (const h of hosts) {
    if (await tryConnect(h)) break;
  }
})();
