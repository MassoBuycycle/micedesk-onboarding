import express from 'express';
import {
    upsertFbContact,
    getFbContact,
    deleteFbContact
} from '../controllers/fbController.js';
import {
    upsertFbDetails,
    getFbDetails,
    deleteFbDetails
} from '../controllers/fbDetailsController.js';

const router = express.Router({ mergeParams: true }); // mergeParams allows access to :hotelId from parent router

// F&B Contact routes (relative to /api/hotels/:hotelId/fb)
router.post('/contact', upsertFbContact); // Create or Update
router.get('/contact', getFbContact);
router.delete('/contact', deleteFbContact);

// Placeholder for restaurant routes
// router.post('/restaurants', createRestaurant); 
// router.get('/restaurants', getAllRestaurantsForHotel);
// ... etc.

// Placeholder for bar routes
// ...

// Placeholder for breakfast settings routes
// ...

// Placeholder for general policies routes
// ...

router.post('/details', upsertFbDetails);
router.get('/details', getFbDetails);
router.delete('/details', deleteFbDetails);

export default router; 