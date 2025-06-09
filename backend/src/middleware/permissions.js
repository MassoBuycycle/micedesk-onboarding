import pool from '../db/config.js';

/**
 * Middleware to check if user has a specific permission through their roles
 * @param {string} permissionCode - The permission code to check
 */
export const hasPermission = (permissionCode) => async (req, res, next) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    try {
      // Check if user has permission through roles
      const [result] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.code = ?
        LIMIT 1
      `, [userId, permissionCode]);
      
      if (result.length > 0) {
        return next();
      }
      
      // Also check if user has admin role (bypass)
      const [adminCheck] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'Admin'
        LIMIT 1
      `, [userId]);
      
      if (adminCheck.length > 0) {
        return next();
      }
      
      return res.status(403).json({ error: 'Permission denied' });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can view an entry
 */
export const canViewEntry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id || req.params.hotelId || req.body.id || req.body.hotelId;
    
    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID not provided' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if user has view_entries permission
      const [result] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.code = 'view_entries'
        LIMIT 1
      `, [userId]);
      
      if (result.length > 0) {
        return next();
      }
      
      return res.status(403).json({ error: 'Permission denied - Cannot view entry' });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can edit an entry
 * This checks for different edit permission levels and assigns
 * a property to req indicating the type of edit permission the user has
 */
export const canEditEntry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id 
      || req.params.hotelId 
      || req.params.roomId 
      || req.params.eventId 
      || req.body.id 
      || req.body.hotelId 
      || req.body.roomId 
      || req.body.eventId 
      || req.body.entryId;
    
    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID not provided' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // First check admin role (bypass all checks)
      const [adminCheck] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'Admin'
        LIMIT 1
      `, [userId]);
      
      if (adminCheck.length > 0) {
        req.editPermissionType = 'edit_all';
        return next();
      }
      
      // Check for edit_all permission
      const [editAllCheck] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.code = 'edit_all'
        LIMIT 1
      `, [userId]);
      
      if (editAllCheck.length > 0) {
        req.editPermissionType = 'edit_all';
        return next();
      }
      
      // Check for global edit_with_approval permission (no assignment required)
      const [editWithApprovalGlobal] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.code = 'edit_with_approval'
        LIMIT 1
      `, [userId]);
      
      if (editWithApprovalGlobal.length > 0) {
        req.editPermissionType = 'edit_with_approval';
        return next();
      }
      
      // Check for assignment to this entry and edit_assigned permission
      const [assignmentCheck] = await connection.query(`
        SELECT 1 FROM entry_assignments ea
        JOIN user_roles ur ON ea.user_id = ur.user_id
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ea.user_id = ? AND ea.entry_id = ? AND p.code = 'edit_assigned'
        LIMIT 1
      `, [userId, entryId]);
      
      if (assignmentCheck.length > 0) {
        req.editPermissionType = 'edit_assigned';
        return next();
      }
      
      // retaining assignment + edit_with_approval as fallback (optional)
      const [approvalCheck] = await connection.query(`
        SELECT 1 FROM entry_assignments ea
        JOIN user_roles ur ON ea.user_id = ur.user_id
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ea.user_id = ? AND ea.entry_id = ? AND p.code = 'edit_with_approval'
        LIMIT 1
      `, [userId, entryId]);
      if (approvalCheck.length > 0) {
        req.editPermissionType = 'edit_with_approval';
        return next();
      }
      
      return res.status(403).json({ error: 'Permission denied - Cannot edit entry' });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can approve changes
 */
export const canApproveChanges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    try {
      // Check if user has approve_changes permission
      const [result] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.code = 'approve_changes'
        LIMIT 1
      `, [userId]);
      
      if (result.length > 0) {
        return next();
      }
      
      // Check admin role (bypass)
      const [adminCheck] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'Admin'
        LIMIT 1
      `, [userId]);
      
      if (adminCheck.length > 0) {
        return next();
      }
      
      return res.status(403).json({ error: 'Permission denied - Cannot approve changes' });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can assign entries to users
 */
export const canAssignEntries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    try {
      // Check if user has assign_entries permission
      const [result] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.code = 'assign_entries'
        LIMIT 1
      `, [userId]);
      
      if (result.length > 0) {
        return next();
      }
      
      // Check admin role (bypass)
      const [adminCheck] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'Admin'
        LIMIT 1
      `, [userId]);
      
      if (adminCheck.length > 0) {
        return next();
      }
      
      return res.status(403).json({ error: 'Permission denied - Cannot assign entries' });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has permission for a specific resource
 * @param {string} resourceType - The type of resource (hotel, room, etc.)
 * @param {string} permissionType - The type of permission (view, edit, delete, manage)
 */
export const hasResourcePermission = (resourceType, permissionType) => async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resourceId = req.params.id || req.params.hotelId || req.body.hotelId;
    
    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID not provided' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if user has admin role (bypass)
      const [adminCheck] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'Admin'
        LIMIT 1
      `, [userId]);
      
      if (adminCheck.length > 0) {
        return next();
      }
      
      // Check resource permission
      const [result] = await connection.query(`
        SELECT 1 FROM resource_permissions
        WHERE user_id = ? AND resource_type = ? AND resource_id = ? 
        AND (permission_type = ? OR permission_type = 'manage')
        LIMIT 1
      `, [userId, resourceType, resourceId, permissionType]);
      
      if (result.length > 0) {
        return next();
      }
      
      return res.status(403).json({ error: 'Permission denied for this resource' });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}; 