import pool from '../db/config.js';

/**
 * Get all roles
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getAllRoles = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [roles] = await connection.query(`
      SELECT id, name, description, is_system, created_at, updated_at
      FROM roles
      ORDER BY name
    `);
    
    res.json(roles);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create a new role
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createRole = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    
    // Check if role already exists
    const [existingRoles] = await connection.query(
      'SELECT id FROM roles WHERE name = ?',
      [name]
    );
    
    if (existingRoles.length > 0) {
      return res.status(409).json({ error: 'Role with this name already exists' });
    }
    
    // Create new role
    const [result] = await connection.query(
      'INSERT INTO roles (name, description, is_system) VALUES (?, ?, FALSE)',
      [name, description || null]
    );
    
    res.status(201).json({
      success: true,
      roleId: result.insertId,
      role: {
        id: result.insertId,
        name,
        description,
        is_system: false
      }
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update an existing role
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateRole = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    
    // Check if role exists
    const [existingRoles] = await connection.query(
      'SELECT id, is_system FROM roles WHERE id = ?',
      [id]
    );
    
    if (existingRoles.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Prevent updating system roles
    if (existingRoles[0].is_system) {
      return res.status(403).json({ error: 'System roles cannot be modified' });
    }
    
    // Check for name conflicts
    const [nameConflicts] = await connection.query(
      'SELECT id FROM roles WHERE name = ? AND id != ?',
      [name, id]
    );
    
    if (nameConflicts.length > 0) {
      return res.status(409).json({ error: 'Another role with this name already exists' });
    }
    
    // Update role
    await connection.query(
      'UPDATE roles SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    
    res.json({
      success: true,
      role: {
        id: parseInt(id),
        name,
        description,
        is_system: false
      }
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Delete a role
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const deleteRole = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    // Check if role exists
    const [existingRoles] = await connection.query(
      'SELECT id, is_system FROM roles WHERE id = ?',
      [id]
    );
    
    if (existingRoles.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Prevent deleting system roles
    if (existingRoles[0].is_system) {
      return res.status(403).json({ error: 'System roles cannot be deleted' });
    }
    
    // Delete role (will cascade to role_permissions and user_roles)
    await connection.query('DELETE FROM roles WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get all permissions
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getAllPermissions = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [permissions] = await connection.query(`
      SELECT id, code, name, description, category
      FROM permissions
      ORDER BY category, name
    `);
    
    // Group permissions by category
    const permissionsByCategory = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {});
    
    res.json({
      categories: Object.keys(permissionsByCategory),
      permissions,
      permissionsByCategory
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get permissions for a specific role
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getRolePermissions = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { roleId } = req.params;
    
    // Check if role exists
    const [existingRoles] = await connection.query(
      'SELECT id FROM roles WHERE id = ?',
      [roleId]
    );
    
    if (existingRoles.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Get permissions for this role
    const [permissions] = await connection.query(`
      SELECT p.id, p.code, p.name, p.description, p.category
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.category, p.name
    `, [roleId]);
    
    res.json(permissions);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Assign permissions to a role
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const assignPermissionsToRole = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;
    
    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({ error: 'permissionIds must be an array' });
    }
    
    // Check if role exists
    const [existingRoles] = await connection.query(
      'SELECT id, is_system FROM roles WHERE id = ?',
      [roleId]
    );
    
    if (existingRoles.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Delete all existing permissions for this role
      await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
      
      // Add new permissions
      if (permissionIds.length > 0) {
        // Build values for bulk insert
        const values = permissionIds.map(permId => [roleId, permId]);
        
        await connection.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
          [values]
        );
      }
      
      await connection.commit();
      
      res.json({ success: true, message: 'Permissions updated successfully' });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Assign a role to a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const assignRoleToUser = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({ error: 'User ID and Role ID are required' });
    }
    
    // Check if user and role exist
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [existingRoles] = await connection.query('SELECT id FROM roles WHERE id = ?', [roleId]);
    if (existingRoles.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Check if assignment already exists
    const [existingAssignments] = await connection.query(
      'SELECT user_id FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, roleId]
    );
    
    if (existingAssignments.length > 0) {
      return res.status(409).json({ error: 'User already has this role' });
    }
    
    // Create assignment
    await connection.query(
      'INSERT INTO user_roles (user_id, role_id, created_by) VALUES (?, ?, ?)',
      [userId, roleId, req.user.id]
    );
    
    res.status(201).json({ success: true, message: 'Role assigned successfully' });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Remove a role from a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const removeRoleFromUser = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, roleId } = req.params;
    
    // Delete assignment
    await connection.query(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, roleId]
    );
    
    res.json({ success: true, message: 'Role removed successfully' });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get all roles assigned to a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getUserRoles = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get roles for this user
    const [roles] = await connection.query(`
      SELECT r.id, r.name, r.description, r.is_system, ur.created_at as assigned_at
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
      ORDER BY r.name
    `, [userId]);
    
    res.json(roles);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Set resource permissions for a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const setResourcePermission = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, resourceType, resourceId, permissionType } = req.body;
    
    if (!userId || !resourceType || !resourceId || !permissionType) {
      return res.status(400).json({ 
        error: 'User ID, resource type, resource ID, and permission type are required' 
      });
    }
    
    // Validate resource type
    const validResourceTypes = ['hotel', 'room', 'event', 'file'];
    if (!validResourceTypes.includes(resourceType)) {
      return res.status(400).json({ 
        error: `Resource type must be one of: ${validResourceTypes.join(', ')}` 
      });
    }
    
    // Validate permission type
    const validPermissionTypes = ['view', 'edit', 'delete', 'manage'];
    if (!validPermissionTypes.includes(permissionType)) {
      return res.status(400).json({ 
        error: `Permission type must be one of: ${validPermissionTypes.join(', ')}` 
      });
    }
    
    // Check if user exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if resource exists (for hotels)
    if (resourceType === 'hotel') {
      const [existingHotels] = await connection.query(
        'SELECT id FROM hotels WHERE id = ?', 
        [resourceId]
      );
      
      if (existingHotels.length === 0) {
        return res.status(404).json({ error: 'Hotel not found' });
      }
    }
    
    // Upsert permission
    await connection.query(`
      INSERT INTO resource_permissions 
        (user_id, resource_type, resource_id, permission_type, granted_by)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        permission_type = VALUES(permission_type),
        granted_by = VALUES(granted_by)
    `, [userId, resourceType, resourceId, permissionType, req.user.id]);
    
    res.json({ 
      success: true, 
      message: 'Resource permission set successfully',
      permission: {
        userId,
        resourceType,
        resourceId,
        permissionType,
        grantedBy: req.user.id
      }
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Remove a resource permission
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const removeResourcePermission = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, resourceType, resourceId } = req.params;
    
    // Delete permission
    await connection.query(
      'DELETE FROM resource_permissions WHERE user_id = ? AND resource_type = ? AND resource_id = ?',
      [userId, resourceType, resourceId]
    );
    
    res.json({ success: true, message: 'Resource permission removed successfully' });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get resource permissions for a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getUserResourcePermissions = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, resourceType } = req.params;
    
    // Optional filter by resource type
    let query = 'SELECT * FROM resource_permissions WHERE user_id = ?';
    const params = [userId];
    
    if (resourceType) {
      query += ' AND resource_type = ?';
      params.push(resourceType);
    }
    
    query += ' ORDER BY resource_type, resource_id';
    
    // Get permissions
    const [permissions] = await connection.query(query, params);
    
    res.json(permissions);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get users with permissions for a specific resource
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getResourcePermissionUsers = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { resourceType, resourceId } = req.params;
    
    // Get users and their permissions for this resource
    const [permissions] = await connection.query(`
      SELECT rp.*, u.first_name, u.last_name, u.email
      FROM resource_permissions rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.resource_type = ? AND rp.resource_id = ?
    `, [resourceType, resourceId]);
    
    res.json(permissions);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 