-- Drop old permissions if they exist
DELETE FROM resource_permissions;
DELETE FROM role_permissions;
DELETE FROM permissions;

-- Redefine permissions with simpler structure
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL
);

-- Insert new simplified permissions
INSERT INTO permissions (code, name, description, category) VALUES
('view_entries', 'View Entries', 'Can view hotel entries', 'entry'),
('edit_all', 'Edit All Entries', 'Can edit any entry without restrictions', 'entry'),
('edit_assigned', 'Edit Assigned Entries', 'Can edit entries assigned to them', 'entry'),
('edit_with_approval', 'Edit With Approval', 'Edits require approval from admin', 'entry'),
('approve_changes', 'Approve Changes', 'Can approve pending changes', 'entry'),
('assign_entries', 'Assign Entries', 'Can assign entries to users', 'entry'),
('view_users', 'View Users', 'Can view user information', 'user'),
('edit_users', 'Edit Users', 'Can create and edit users', 'user'),
('manage_roles', 'Manage Roles', 'Can manage roles and permissions', 'user');

-- Create pending changes table to track edits needing approval
CREATE TABLE IF NOT EXISTS pending_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  entry_type ENUM('hotel', 'room', 'event') NOT NULL DEFAULT 'hotel',
  user_id INT NOT NULL,
  change_data JSON NOT NULL,
  original_data JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_by INT NULL,
  review_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create entry assignments table
CREATE TABLE IF NOT EXISTS entry_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  entry_type ENUM('hotel', 'room', 'event') NOT NULL DEFAULT 'hotel',
  user_id INT NOT NULL,
  assigned_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (entry_id, entry_type, user_id)
);

-- Update roles to include new permission sets
-- First, clear existing role permissions
DELETE FROM role_permissions;

-- Get Admin role ID
SET @admin_role_id = (SELECT id FROM roles WHERE name = 'Admin');
-- Get Editor role ID (create if it doesn't exist)
INSERT IGNORE INTO roles (name, description, is_system) VALUES ('Editor', 'Can edit all entries without approval', TRUE);
SET @editor_role_id = (SELECT id FROM roles WHERE name = 'Editor');
-- Get Contributor role ID (create if it doesn't exist)
INSERT IGNORE INTO roles (name, description, is_system) VALUES ('Contributor', 'Can edit assigned entries with approval', TRUE);
SET @contributor_role_id = (SELECT id FROM roles WHERE name = 'Contributor');
-- Get Viewer role ID
SET @viewer_role_id = (SELECT id FROM roles WHERE name = 'Viewer');

-- Get permission IDs
SET @view_entries_id = (SELECT id FROM permissions WHERE code = 'view_entries');
SET @edit_all_id = (SELECT id FROM permissions WHERE code = 'edit_all');
SET @edit_assigned_id = (SELECT id FROM permissions WHERE code = 'edit_assigned');
SET @edit_with_approval_id = (SELECT id FROM permissions WHERE code = 'edit_with_approval');
SET @approve_changes_id = (SELECT id FROM permissions WHERE code = 'approve_changes');
SET @assign_entries_id = (SELECT id FROM permissions WHERE code = 'assign_entries');
SET @view_users_id = (SELECT id FROM permissions WHERE code = 'view_users');
SET @edit_users_id = (SELECT id FROM permissions WHERE code = 'edit_users');
SET @manage_roles_id = (SELECT id FROM permissions WHERE code = 'manage_roles');

-- Assign permissions to roles
-- Admin has all permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
(@admin_role_id, @view_entries_id),
(@admin_role_id, @edit_all_id),
(@admin_role_id, @edit_assigned_id),
(@admin_role_id, @edit_with_approval_id),
(@admin_role_id, @approve_changes_id),
(@admin_role_id, @assign_entries_id),
(@admin_role_id, @view_users_id),
(@admin_role_id, @edit_users_id),
(@admin_role_id, @manage_roles_id);

-- Editor can view and edit all entries
INSERT INTO role_permissions (role_id, permission_id) VALUES
(@editor_role_id, @view_entries_id),
(@editor_role_id, @edit_all_id),
(@editor_role_id, @view_users_id);

-- Contributor can view entries and edit assigned entries with approval
INSERT INTO role_permissions (role_id, permission_id) VALUES
(@contributor_role_id, @view_entries_id),
(@contributor_role_id, @edit_assigned_id),
(@contributor_role_id, @edit_with_approval_id);

-- Viewer can only view entries
INSERT INTO role_permissions (role_id, permission_id) VALUES
(@viewer_role_id, @view_entries_id); 