import express from 'express';
import {
  getAllFileTypes,
  getFileTypesByCategory,
  getFileTypeById,
  getFileTypeByCodeAndCategory,
  createFileType,
  updateFileType,
  deleteFileType,
  validateFileType
} from '../controllers/fileTypeController.js';
import {
  uploadFile,
  getFilesByEntity,
  getFilesByEntityAndCategory,
  getFileById,
  deleteFileById,
  getRoomFilesByHotel,
  assignTemporaryFiles,
  assignRoomCategoryFiles
} from '../controllers/fileController.js';
import { uploadMiddleware } from '../services/s3Service.js';

const router = express.Router();

// File Type routes
router.get('/types', getAllFileTypes);
router.get('/types/category/:category', getFileTypesByCategory);
router.get('/types/:id', getFileTypeById);
router.get('/types/:category/:code', getFileTypeByCodeAndCategory);
router.post('/types', createFileType);
router.put('/types/:id', updateFileType);
router.delete('/types/:id', deleteFileType);

// File routes by entity
router.get('/:entityType/:entityId', getFilesByEntity);
router.get('/:entityType/:entityId/:category', getFilesByEntityAndCategory);
router.get('/id/:fileId', getFileById);
router.delete('/id/:fileId', deleteFileById);

// File upload route
// Route format: /files/upload/{entityType}/{entityId}/{category}/{fileTypeCode}
// Example: /files/upload/hotels/123/general/images
router.post(
  '/upload/:entityType/:entityId/:category/:fileTypeCode',
  validateFileType,  // Validate and set file type in request
  uploadMiddleware,  // Handle file upload to S3
  uploadFile         // Process after upload and save metadata
);

// Assign temporary files to entity
// Route format: /files/assign/{entityType}/{entityId}
// Example: /files/assign/hotels/123
router.post('/assign/:entityType/:entityId', assignTemporaryFiles);

// Assign temporary files to room category
// Route format: /files/assign-room-category/{roomCategoryId}
router.post('/assign-room-category/:roomCategoryId', assignRoomCategoryFiles);

router.get('/hotels/:hotelId/room', getRoomFilesByHotel);

export default router; 