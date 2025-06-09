import express from 'express';
import { 
  createHotel, 
  getHotels, 
  getHotelById, 
  updateHotel, 
  deleteHotel,
  uploadHotelImage
} from '../controllers/hotelController.js';

const router = express.Router();

// Get all hotels
router.get('/', getHotels);

// Get single hotel
router.get('/:id', getHotelById);

// Create new hotel
router.post('/', createHotel);

// Update hotel
router.put('/:id', updateHotel);

// Delete hotel
router.delete('/:id', deleteHotel);

// Upload hotel image
router.post('/:id/images', uploadHotelImage);

export default router; 