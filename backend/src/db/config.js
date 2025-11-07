/**
 * MySQL connection pool with automatic table prefixing.
 *
 * Key features:
 * - Creates a pooled MySQL connection using mysql2/promise
 * - Transparently rewrites SQL so bare table names are prefixed with TABLE_PREFIX
 * - Patches pool.query and individual connections to apply prefixing
 * - Optional keepalive ping for hosted environments
 *
 * Relevant env vars:
 * - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
 * - TABLE_PREFIX (default 'onboarding_')
 * - DB_CONNECT_TIMEOUT_MS, DB_KEEPALIVE_DELAY_MS, DB_KEEPALIVE_INTERVAL_MS
 * - NODE_ENV and DB_KEEPALIVE to toggle keepalive
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
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
// This list should match exactly what exists in production with the onboarding_ prefix
const TABLES_TO_PREFIX = [
  // Core tables
  'equipment_types',
  'file_types',
  'files',
  
  // User management tables
  'users',
  'roles',
  'permissions',
  'role_permissions',
  'user_roles',
  'resource_permissions',
  'user_all_hotels_access',
  'user_hotel_assignments',
  
  // Hotel tables
  'hotels',
  'contract_details',
  'hotel_secure_data',
  'hotel_announcements',
  
  // Event management tables
  // NOTE: 'events' is NOT auto-prefixed because it appears in column names
  // (e.g., payment_methods_events, final_invoice_handling_event)
  // Manually prefix 'events' table in queries.
  'event_av_equipment',
  'event_details',
  'event_equipment',
  'event_spaces',
  
  // Food & beverage tables
  'fb_bars',
  'fb_restaurants',
  'food_beverage_details',
  
  // Information policies tables
  'information_policies',
  'information_policy_items',
  'information_policy_item_details',
  
  // Lookup tables
  // NOTE: 'payment_methods' and 'standard_features' are NOT auto-prefixed
  // because they appear in column names (e.g., accepted_payment_methods, payment_methods column)
  // Manually prefix these tables in queries where needed.
  
  // Room management tables
  'rooms',
  'room_category_infos',
  'room_contacts',
  'room_inventory',
  'room_operational_handling',
  'room_pet_policies',
  'room_policies',
  'room_standard_features',
  
  // Approval system tables
  'entry_assignments',
  'pending_changes'
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
    }
  };
  const timer = setInterval(keepAlive, intervalMs);
  // Do not keep the event loop alive for this timer
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
}