/**
 * User Model
 * @typedef {Object} User
 * @property {number} id - Unique identifier for the user
 * @property {string} first_name - User's first name
 * @property {string} last_name - User's last name
 * @property {string} email - User's email address (unique)
 * @property {string} password - User's hashed password
 * @property {Date} [created_at] - Date when the user was created
 * @property {Date} [updated_at] - Date when the user was last updated
 */

/**
 * Safe User (without password)
 * @typedef {Object} SafeUser
 * @property {number} id - Unique identifier for the user
 * @property {string} first_name - User's first name
 * @property {string} last_name - User's last name
 * @property {string} email - User's email address
 * @property {Date} [created_at] - Date when the user was created
 * @property {Date} [updated_at] - Date when the user was last updated
 */

export default { User: 'User', SafeUser: 'SafeUser' }; 