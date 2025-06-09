import express from 'express';
import { 
  getAllHotels, 
  getHotelById, 
  createHotel, 
  updateHotel, 
  deleteHotel 
} from '../controllers/hotelController.js';
import { getFullHotelDetails } from '../controllers/hotelAggregateController.js';

const router = express.Router();

// Hotel routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);
router.post('/', createHotel);
router.put('/:id', updateHotel);
router.delete('/:id', deleteHotel);
router.get('/:id/full', getFullHotelDetails);

export default router; 