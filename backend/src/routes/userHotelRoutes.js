import express from 'express';
import { 
  getHotelsByUserId, 
  getUsersByHotelId, 
  assignUserToHotel, 
  unassignUserFromHotel, 
  grantAllHotelsAccess, 
  revokeAllHotelsAccess 
} from '../controllers/userHotelController.js';

const router = express.Router();

// User-Hotel assignment routes
router.get('/users/:userId/hotels', getHotelsByUserId);
router.get('/hotels/:hotelId/users', getUsersByHotelId);
router.post('/assignments', assignUserToHotel);
router.delete('/assignments/users/:userId/hotels/:hotelId', unassignUserFromHotel);
router.post('/all-access', grantAllHotelsAccess);
router.delete('/all-access/users/:userId', revokeAllHotelsAccess);

export default router; 