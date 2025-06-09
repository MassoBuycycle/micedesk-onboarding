import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser,
  deleteUser,
  getUserRole 
} from '../controllers/userController.js';

const router = express.Router();

// User routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/:id/role', getUserRole);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router; 