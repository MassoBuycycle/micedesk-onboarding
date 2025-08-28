import express from 'express';
import {
  // getAllRoomTypes, // Old - to be replaced
  // getRoomTypeById,   // Old
  createRoom,       // New - formerly createRoomType, now targeting comprehensive room creation
  addCategoryInfosToRoom, // Import the new function
  // updateRoomType,    // Old
  // deleteRoomType     // Old
  getOperationalHandlingByRoomId, // Import from roomController.js instead
  createOrUpdateOperationalHandling // Import from roomController.js instead
} from '../controllers/roomController.js'; // Corrected import path

import {
  getRoomCategories,
  getRoomCategoryById,
  createRoomCategory,
  updateRoomCategory,
  deleteRoomCategory
} from '../controllers/roomCategoryController.js';

import {
  getRoomInfo,
  updateRoomInfo,
  getStandardRoomFeatures,
  updateStandardRoomFeatures
} from '../controllers/roomInfoController.js';

const router = express.Router();

// Room main routes (formerly Room Types)
// router.get('/types', getAllRoomTypes); // To be replaced by GET / for listing rooms
// router.get('/types/:id', getRoomTypeById); // To be replaced by GET /:roomId
router.post('/', createRoom); // Changed from '/types' and uses new createRoom
// router.put('/types/:id', updateRoomType); // To be replaced by PUT /:roomId
// router.delete('/types/:id', deleteRoomType); // To be replaced by DELETE /:roomId

// Route for adding multiple category infos to an existing room
router.post('/:roomId/categories', addCategoryInfosToRoom);

// Route for getting room categories by room ID
router.get('/:roomId/categories', getRoomCategories);

// Room Categories routes
router.get('/types/:roomId/categories', getRoomCategories);
router.get('/categories/:id', getRoomCategoryById);
router.post('/types/:roomId/categories', createRoomCategory);
router.put('/categories/:id', updateRoomCategory);
router.delete('/categories/:id', deleteRoomCategory);

// Room Info routes
router.get('/info', getRoomInfo);
router.put('/info', updateRoomInfo);
router.get('/features', getStandardRoomFeatures);
router.put('/features', updateStandardRoomFeatures);

// Operational Handling routes
router.get('/:roomId/handling', getOperationalHandlingByRoomId);
router.post('/:roomId/handling', createOrUpdateOperationalHandling);
router.put('/:roomId/handling', createOrUpdateOperationalHandling);

export default router; 