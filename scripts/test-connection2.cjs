const { Client } = require('pg');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = url.replace(/^https:\/\/([^/]+).*$/, '$1');
const projectId = ref.replace('.supabase.co', '');

const configs = [
  { host: 'aws-0-eu-west-1.pooler.supabase.com', port: 5432, user: 'postgres' },
  { host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectId}` },
  { host: 'aws-0-eu-west-1.pooler.supabase.com', port: 5432, user: `postgres.${projectId}` },
  { host: 'db.kggwqsvyfbpiixdlchdc.supabase.co', port: 5432, user: 'postgres' },
  { host: 'db.kggwqsvyfbpiixdlchdc.supabase.co', port: 5432, user: `postgres.${projectId}` },
];

async function tryConnect(config) {
  const client = new Client({
    ...config,
    password: key,
    database: 'postgres',
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log('SUCCESS:', config.host, config.port, config.user, '->', res.rows[0].version.split(' ').slice(0, 3).join(' '));
    await client.end();
    return true;
  } catch (err) {
    console.log('FAIL:', config.host, config.port, config.user, '->', err.message);
    try { await client.end(); } catch {}
    return false;
  }
}

(async () => {
  for (const c of configs) {
    if (await tryConnect(c)) break;
  }
})();
