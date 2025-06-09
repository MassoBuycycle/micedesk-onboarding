import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  canViewEntry, 
  canEditEntry, 
  canApproveChanges, 
  canAssignEntries 
} from '../middleware/permissions.js';
import * as approvalController from '../controllers/approvalController.js';

const router = express.Router();

// Pending changes routes
router.post('/submit', authenticate, canEditEntry, approvalController.submitChanges);
router.get('/pending', authenticate, canApproveChanges, approvalController.getPendingChanges);
router.get('/changes/:id', authenticate, approvalController.getPendingChangeById);
router.post('/changes/:id/review', authenticate, canApproveChanges, approvalController.reviewChange);
router.get('/my-changes', authenticate, approvalController.getMyChanges);

// Entry assignment routes
router.get('/assignments/users/:userId', authenticate, approvalController.getUserAssignments);
router.get('/assignments/entries/:entryType/:entryId', authenticate, approvalController.getEntryAssignments);
router.post('/assignments', authenticate, canAssignEntries, approvalController.assignEntry);
router.delete('/assignments/users/:userId/entries/:entryType/:entryId', authenticate, canAssignEntries, approvalController.unassignEntry);

export default router; 