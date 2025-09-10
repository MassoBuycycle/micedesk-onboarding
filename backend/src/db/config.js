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
  queueLimit: 0,
  // Faster failure when DB is unreachable
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000), // 10s
  // Keep TCP connections alive to reduce idle disconnects
  enableKeepAlive: true,
  keepAliveInitialDelay: Number(process.env.DB_KEEPALIVE_DELAY_MS || 10000) // 10s
});

// ------------------------------------------------------------------
// Automatic table-name prefixing to use onboarding_ tables
// ------------------------------------------------------------------
const TABLE_PREFIX = process.env.TABLE_PREFIX || 'onboarding_';

// Complete list of table names used throughout the application (without prefix)
const TABLES_TO_PREFIX = [
  // Core hotel & user tables
  'hotels', 'hotel_info', 'users', 'roles', 'permissions', 'role_permissions',
  'user_roles', 'resource_permissions', 'user_hotel_assignments', 'user_all_hotels_access',
  
  // Room management tables  
  'rooms', 'room_contacts', 'room_policies', 'room_inventory', 'room_pet_policies',
  'room_category_infos', 'room_operational_handling', 'room_standard_features',
  
  // Event management tables
  'events', 'event_booking', 'event_financials', 'event_operations', 'event_spaces',
  'event_equipment', 'event_av_equipment', 'event_contracting', 'event_technical', 
  'event_handling',
  
  // Food & beverage tables
  'food_beverage_details',
  
  // File management tables
  'files', 'file_types',
  
  // Information policies tables
  'information_policies', 'information_policy_items', 'information_policy_item_details',
  
  // Lookup tables
  // 'payment_methods', 'standard_features', 'equipment_types', // Removed to prevent incorrect prefixing in SET clauses. Manually prefixed in controllers.
  
  // Announcements & secure data (actively used)
  'hotel_announcements', 'hotel_secure_data',
  
  // Approval system tables
  'entry_assignments', 'pending_changes'
];

function prefixSQL(sql) {
  let modified = sql;
  TABLES_TO_PREFIX.forEach((tbl) => {
    const regex = new RegExp(`\\b${tbl}\\b`, 'gi');
    modified = modified.replace(regex, `${TABLE_PREFIX}${tbl}`);
  });
  return modified;
}

// Patch a single connection so that every .query() call prefixes tables
function patchConnection(conn) {
  const origQuery = conn.query.bind(conn);
  conn.query = (...args) => {
    if (typeof args[0] === 'string') {
      args[0] = prefixSQL(args[0]);
    }
    return origQuery.apply(conn, args);
  };
}

// Patch pool.query (shortcut without explicit connection checkout)
const origPoolQuery = pool.query.bind(pool);
pool.query = (...args) => {
  if (typeof args[0] === 'string') {
    args[0] = prefixSQL(args[0]);
  }
  return origPoolQuery.apply(pool, args);
};

// Override pool.getConnection so that every acquired connection is patched
const origGetConnection = pool.getConnection.bind(pool);
pool.getConnection = async (...args) => {
  const connection = await origGetConnection.apply(pool, args);
  patchConnection(connection);
  return connection;
};

export default pool; 

// ------------------------------------------------------------------
// Background keepalive ping to prevent idle disconnects in hosted envs
// ------------------------------------------------------------------
// Only run in non-test environments and when not explicitly disabled
if (process.env.NODE_ENV !== 'test' && process.env.DB_KEEPALIVE !== 'false') {
  const intervalMs = Number(process.env.DB_KEEPALIVE_INTERVAL_MS || 45000); // 45s
  const keepAlive = async () => {
    try {
      await pool.query('SELECT 1');
    } catch (err) {
      console.warn('[DB keepalive] ping failed:', err.message);
    }
  };
  const timer = setInterval(keepAlive, intervalMs);
  // Do not keep the event loop alive for this timer
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
}