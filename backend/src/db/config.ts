import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – no type definitions available for this package
import tunnel from 'tunnel-ssh';

dotenv.config();

// -------------------------------------------------------------
// 1. Optional SSH tunnel (for production on Vercel)
// -------------------------------------------------------------
async function ensureSshTunnel() {
  const {
    SSH_HOST,
    SSH_PORT = '22',
    SSH_USERNAME,
    SSH_KEY,
    SSH_KEY_B64,
    SSH_TUNNEL_LOCAL_PORT = '3307',
    DB_PORT = '3306',
  } = process.env;

  if (!SSH_HOST) return; // nothing to do for local dev or direct DB access

  const privateKey = SSH_KEY
    ? SSH_KEY
    : SSH_KEY_B64
    ? Buffer.from(SSH_KEY_B64, 'base64').toString('utf8')
    : undefined;

  if (!privateKey) {
    throw new Error('SSH tunnel requested but no SSH_KEY / SSH_KEY_B64 provided');
  }

  const tunnelConfig: any = {
    host: SSH_HOST,
    port: Number(SSH_PORT),
    username: SSH_USERNAME,
    privateKey,
    dstHost: '127.0.0.1', // MySQL runs locally on remote host
    dstPort: Number(DB_PORT),
    localHost: '127.0.0.1',
    localPort: Number(SSH_TUNNEL_LOCAL_PORT),
    keepAlive: true,
  } as any;

  await new Promise<void>((resolve, reject) => {
    tunnel(tunnelConfig, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Rewrite connection vars for mysql2
  process.env.DB_HOST = '127.0.0.1';
  process.env.DB_PORT = SSH_TUNNEL_LOCAL_PORT;
}

await ensureSshTunnel();

// -------------------------------------------------------------
// 2. Create MySQL pool *after* tunnel is ready
// -------------------------------------------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_cms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ------------------------------------------------------------------
// Automatic table-name prefixing helper
// ------------------------------------------------------------------
const TABLE_PREFIX = process.env.TABLE_PREFIX || 'onboarding_';

// List of *base* table names used throughout the application (without prefix)
// If you add new tables later, append them here so they are prefixed as well.
const TABLES_TO_PREFIX = [
  'hotels', 'hotel_info', 'standard_room_features', 'payment_methods',
  'standard_features', 'users', 'roles', 'permissions', 'role_permissions',
  'user_roles', 'resource_permissions', 'entry_assignments', 'pending_changes',
  'files', 'file_types', 'information_policies', 'information_policy_items',
  'information_policy_item_details', 'user_hotel_assignments',
  'user_all_hotels_access', 'food_beverage_details', 'events', 'event_booking',
  'event_financials', 'event_operations', 'event_spaces', 'event_equipment',
  'event_av_equipment', 'event_contracting', 'event_technical', 'event_handling',
  'event_main', 'hotel_secure_data'
];

function prefixSQL(sql: string): string {
  let modified = sql;
  TABLES_TO_PREFIX.forEach((tbl) => {
    const regex = new RegExp(`\\b${tbl}\\b`, 'gi');
    modified = modified.replace(regex, `${TABLE_PREFIX}${tbl}`);
  });
  return modified;
}

// Patch a single connection so that every .query() call prefixes tables
function patchConnection(conn: any) {
  const origQuery = conn.query.bind(conn);
  conn.query = (...args: any[]) => {
    if (typeof args[0] === 'string') {
      args[0] = prefixSQL(args[0]);
    }
    return origQuery.apply(conn, args as any);
  };
}

// Patch pool.query (shortcut without explicit connection checkout)
const origPoolQuery = pool.query.bind(pool);
(pool as any).query = (...args: any[]) => {
  if (typeof args[0] === 'string') {
    args[0] = prefixSQL(args[0]);
  }
  return origPoolQuery.apply(pool, args as any);
};

// Override pool.getConnection so that every acquired connection is patched once
const origGetConnection = pool.getConnection.bind(pool);
(pool as any).getConnection = async (...args: any[]) => {
  const connection = await origGetConnection.apply(pool, args as any);
  patchConnection(connection);
  return connection;
};

// ------------------------------------------------------------------
export default pool; 