-- ============================================================================
-- HOTEL CMS - SEED DATA SCRIPT (OPERATIONAL TABLES)
-- Populates lookup tables with default data for the application
-- 
-- NOTE: This script targets the operational tables (non-prefixed) that the API uses:
--       - equipment_types, file_types, payment_methods, standard_features, etc.
--       
--       For onboarding_ prefixed tables, use onboarding_full_schema.sql which 
--       includes its own seed data.
-- ============================================================================

USE hotel_cms;

-- ============================================================================
-- 1. EQUIPMENT TYPES (for events)
-- ============================================================================
INSERT IGNORE INTO equipment_types (equipment_name, description) VALUES
('Projector', 'Digital projector for presentations'),
('Screen', 'Projection screen'),
('Microphone', 'Wireless microphone'),
('Speaker System', 'Audio speaker system'),
('Laptop', 'Laptop computer'),
('Flip Chart', 'Flip chart stand with paper'),
('Whiteboard', 'Portable whiteboard'),
('Extension Cord', 'Power extension cord'),
('Laser Pointer', 'Presentation laser pointer'),
('Conference Phone', 'Conference call phone system'),
('Video Camera', 'Video recording camera'),
('Lighting Equipment', 'Professional lighting setup'),
('PA System', 'Public address system'),
('Stage', 'Portable stage platform'),
('Podium', 'Speaker podium'),
('Registration Desk', 'Event registration table'),
('Signage', 'Directional and event signage'),
('Catering Equipment', 'Coffee machines, water dispensers'),
('AV Cart', 'Mobile AV equipment cart'),
('Backdrop', 'Event backdrop/banner stand');

-- ============================================================================
-- 2. FILE TYPES (for file uploads)
-- ============================================================================
INSERT IGNORE INTO file_types (name, code, category, allowed_extensions, max_size) VALUES
-- Hotel files
('Images', 'images', 'hotel', '["jpg", "jpeg", "png", "webp", "gif"]', 5242880),
('Main Image', 'main_image', 'hotel', '["jpg", "jpeg", "png", "webp"]', 5242880),
('Documents', 'documents', 'hotel', '["pdf", "doc", "docx", "txt"]', 10485760),
('Terms of Service', 'tos', 'hotel', '["pdf"]', 5242880),
('Brochures', 'brochures', 'hotel', '["pdf", "jpg", "jpeg", "png"]', 10485760),
('Floor Plans', 'floor_plans', 'hotel', '["pdf", "jpg", "jpeg", "png", "dwg"]', 10485760),

-- Event files  
('Event Images', 'images', 'event', '["jpg", "jpeg", "png", "webp"]', 5242880),
('Event Floor Plans', 'floor_plans', 'event', '["pdf", "jpg", "jpeg", "png"]', 10485760),
('Event Documents', 'documents', 'event', '["pdf", "doc", "docx"]', 10485760),
('Seating Charts', 'seating_charts', 'event', '["pdf", "jpg", "jpeg", "png"]', 5242880),

-- F&B files
('Menu', 'menu', 'fb', '["pdf", "jpg", "jpeg", "png"]', 5242880),
('Wine List', 'wine_list', 'fb', '["pdf", "jpg", "jpeg", "png"]', 5242880),
('Catering Options', 'catering', 'fb', '["pdf", "doc", "docx"]', 10485760),

-- Room files
('Room Photos', 'photos', 'room', '["jpg", "jpeg", "png", "webp"]', 5242880),
('Room Documents', 'documents', 'room', '["pdf", "doc", "docx"]', 5242880),
('Room Floor Plans', 'floor_plans', 'room', '["pdf", "jpg", "jpeg", "png"]', 5242880);

-- ============================================================================
-- 3. PAYMENT METHODS
-- ============================================================================
INSERT IGNORE INTO payment_methods (name, enabled) VALUES
('Cash', true),
('Credit Card (Visa)', true),
('Credit Card (Mastercard)', true),
('Credit Card (American Express)', true),
('Debit Card', true),
('Bank Transfer', true),
('PayPal', true),
('Apple Pay', false),
('Google Pay', false),
('Cryptocurrency', false),
('Check', true),
('Invoice (30 days)', true),
('Invoice (60 days)', false),
('Corporate Account', true);

-- ============================================================================
-- 4. STANDARD FEATURES (hotel amenities)
-- ============================================================================
INSERT IGNORE INTO standard_features (name) VALUES
('WiFi'),
('Air Conditioning'),
('Heating'),
('Private Bathroom'),
('Shower'),
('Bathtub'),
('Hair Dryer'),
('TV'),
('Cable/Satellite TV'),
('Telephone'),
('Safe'),
('Minibar'),
('Refrigerator'),
('Coffee Maker'),
('Kettle'),
('Desk'),
('Balcony'),
('Terrace'),
('Ironing Board'),
('Iron'),
('Room Service'),
('Housekeeping'),
('Wake-up Service'),
('Laundry Service'),
('Allergy-Friendly Bedding'),
('Extra Bed Available'),
('Baby Bed Available'),
('Soundproof Windows'),
('Blackout Curtains'),
('City View'),
('Garden View'),
('Pool View'),
('Mountain View'),
('Sea View'),
('Connecting Rooms Available');

-- ============================================================================
-- 5. USER ROLES & PERMISSIONS
-- ============================================================================

-- Roles
INSERT IGNORE INTO roles (id, name, description, is_system) VALUES
(1, 'Admin', 'System administrator with full access', true),
(2, 'Manager', 'Hotel manager with comprehensive access', true),
(3, 'Editor', 'Can edit all entries without approval', true),
(4, 'Contributor', 'Can edit assigned entries with approval required', true),
(5, 'Viewer', 'Read-only access to assigned properties', true),
(6, 'Guest', 'Limited read-only access', true);

-- Permissions
INSERT IGNORE INTO permissions (code, name, description, category) VALUES
-- Entry permissions
('view_entries', 'View Entries', 'Can view hotel entries', 'entry'),
('edit_all', 'Edit All Entries', 'Can edit any entry without restrictions', 'entry'),
('edit_assigned', 'Edit Assigned Entries', 'Can edit assigned entries only', 'entry'),
('edit_with_approval', 'Edit With Approval', 'Edits require approval', 'entry'),
('approve_changes', 'Approve Changes', 'Can approve pending changes', 'entry'),
('assign_entries', 'Assign Entries', 'Can assign entries to users', 'entry'),
('delete_entries', 'Delete Entries', 'Can delete entries', 'entry'),

-- User management permissions
('view_users', 'View Users', 'Can view user information', 'user'),
('edit_users', 'Edit Users', 'Can create and edit users', 'user'),
('delete_users', 'Delete Users', 'Can delete user accounts', 'user'),
('manage_roles', 'Manage Roles', 'Can manage roles and permissions', 'user'),
('assign_roles', 'Assign Roles', 'Can assign roles to users', 'user'),

-- File management permissions
('upload_files', 'Upload Files', 'Can upload files', 'file'),
('delete_files', 'Delete Files', 'Can delete files', 'file'),
('manage_file_types', 'Manage File Types', 'Can manage file type settings', 'file'),

-- System permissions
('system_admin', 'System Administration', 'Full system administration access', 'system'),
('view_logs', 'View Logs', 'Can view system logs', 'system'),
('manage_settings', 'Manage Settings', 'Can manage system settings', 'system');

-- Map permissions to roles
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'Admin'; -- Admin gets all permissions

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'Manager' AND p.code IN (
    'view_entries', 'edit_all', 'approve_changes', 'assign_entries', 'delete_entries',
    'view_users', 'edit_users', 'assign_roles', 'upload_files', 'delete_files'
);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'Editor' AND p.code IN (
    'view_entries', 'edit_all', 'upload_files'
);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'Contributor' AND p.code IN (
    'view_entries', 'edit_assigned', 'edit_with_approval', 'upload_files'
);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'Viewer' AND p.code IN ('view_entries');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'Guest' AND p.code IN ('view_entries');

-- ============================================================================
-- 6. HOTEL CATEGORIES (sample data)
-- ============================================================================
-- Note: Categories are stored as VARCHAR in hotels table, these are just common examples

-- ============================================================================
-- 7. DEFAULT ADMIN USER (Optional - uncomment if needed)
-- ============================================================================
-- WARNING: Change the password before using in production!
-- Password is 'admin123' - CHANGE THIS!

-- INSERT IGNORE INTO users (id, first_name, last_name, email, password, status) VALUES 
-- (1, 'System', 'Administrator', 'admin@hotel-cms.com', '$2b$10$rQZ5mQjE5vQ5kQjE5vQ5kOtYv5zQ5zQ5zQ5zQ5zQ5zQ5zQ5zQ5zQ5u', 'active');

-- INSERT IGNORE INTO user_roles (user_id, role_id, created_by) VALUES (1, 1, 1);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check what was inserted:
SELECT 'Equipment Types' as table_name, COUNT(*) as count FROM equipment_types
UNION ALL
SELECT 'File Types', COUNT(*) FROM file_types  
UNION ALL
SELECT 'Payment Methods', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'Standard Features', COUNT(*) FROM standard_features
UNION ALL  
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'Role Permissions', COUNT(*) FROM role_permissions;

-- ============================================================================
-- End of seed script
-- ============================================================================ 