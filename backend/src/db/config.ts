import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_cms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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