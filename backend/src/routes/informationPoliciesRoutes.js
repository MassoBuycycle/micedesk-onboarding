import express from 'express';
import {
  getInformationPoliciesByHotel,
  getInformationPoliciesByType,
  createInformationPolicy,
  updateInformationPolicy,
  deleteInformationPolicy
} from '../controllers/informationPoliciesController.js';

const router = express.Router();

// Get all information policies for a hotel
router.get('/hotel/:hotelId', getInformationPoliciesByHotel);

// Get information policies by type for a hotel
router.get('/hotel/:hotelId/type/:type', getInformationPoliciesByType);

// Create a new information policy
router.post('/', createInformationPolicy);

// Update an information policy
router.put('/:id', updateInformationPolicy);

// Delete an information policy
router.delete('/:id', deleteInformationPolicy);

export default router; 