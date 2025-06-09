import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { hasPermission } from '../middleware/permissions.js';
import * as roleController from '../controllers/roleController.js';

const router = express.Router();

// Role management routes
router.get('/', authenticate, hasPermission('view_roles'), roleController.getAllRoles);
router.post('/', authenticate, hasPermission('create_roles'), roleController.createRole);
router.put('/:id', authenticate, hasPermission('edit_roles'), roleController.updateRole);
router.delete('/:id', authenticate, hasPermission('delete_roles'), roleController.deleteRole);

// Permission management routes
router.get('/permissions', authenticate, hasPermission('view_permissions'), roleController.getAllPermissions);
router.get('/:roleId/permissions', authenticate, hasPermission('view_roles'), roleController.getRolePermissions);
router.post('/:roleId/permissions', authenticate, hasPermission('edit_roles'), roleController.assignPermissionsToRole);

// User role assignment routes
router.post('/assign-user', authenticate, hasPermission('assign_roles'), roleController.assignRoleToUser);
router.delete('/users/:userId/roles/:roleId', authenticate, hasPermission('assign_roles'), roleController.removeRoleFromUser);
router.get('/users/:userId', authenticate, hasPermission('view_users'), roleController.getUserRoles);

// Resource permission routes
router.post('/resource-permissions', authenticate, hasPermission('manage_permissions'), roleController.setResourcePermission);
router.delete('/resource-permissions/users/:userId/resources/:resourceType/:resourceId', 
  authenticate, hasPermission('manage_permissions'), roleController.removeResourcePermission);
router.get('/resource-permissions/users/:userId/:resourceType?', 
  authenticate, hasPermission('view_permissions'), roleController.getUserResourcePermissions);
router.get('/resource-permissions/resources/:resourceType/:resourceId',
  authenticate, hasPermission('view_permissions'), roleController.getResourcePermissionUsers);

export default router; 