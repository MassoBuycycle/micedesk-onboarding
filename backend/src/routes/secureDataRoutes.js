import express from 'express';
import {
  listHotelSecureData,
  createHotelSecureData,
  getSecureDataEntry,
} from '../controllers/secureDataController.js';

const router = express.Router();

// List secure data for a hotel
router.get('/hotels/:hotelId/secure-data', listHotelSecureData);

// Create secure data entry for a hotel
router.post('/hotels/:hotelId/secure-data', createHotelSecureData);

// Fetch decrypted secure data entry
router.get('/secure-data/:entryId', getSecureDataEntry);

export default router; 