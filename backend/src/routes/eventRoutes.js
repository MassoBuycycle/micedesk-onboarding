import express from 'express';
import { 
  getAllEvents,
  createEvent
} from '../controllers/eventMainController.js';

import { 
  getEventEquipment, 
  upsertEventEquipment,
  getAllEquipmentTypes
} from '../controllers/eventEquipmentController.js';

import {
  getEventBooking,
  createOrUpdateEventBooking
} from '../controllers/eventBookingController.js';

import {
  getEventOperations,
  createOrUpdateEventOperations
} from '../controllers/eventOperationsController.js';

import {
  getEventFinancials,
  createOrUpdateEventFinancials
} from '../controllers/eventFinancialsController.js';

import {
  getEventSpaces,
  getEventSpaceById,
  createEventSpace,
  updateEventSpace,
  deleteEventSpace
} from '../controllers/eventSpacesController.js';

const router = express.Router();

// Event main routes
router.get('/', getAllEvents);
router.post('/', createEvent);

// Equipment types route
router.get('/equipment-types', getAllEquipmentTypes);

// Equipment routes
router.get('/:id/equipment', getEventEquipment);
router.post('/:id/equipment', upsertEventEquipment);

// Booking routes
router.get('/:id/booking', getEventBooking);
router.post('/:id/booking', createOrUpdateEventBooking);

// Operations routes
router.get('/:id/operations', getEventOperations);
router.post('/:id/operations', createOrUpdateEventOperations);

// Financials routes
router.get('/:id/financials', getEventFinancials);
router.post('/:id/financials', createOrUpdateEventFinancials);

// Spaces routes
router.get('/:id/spaces', getEventSpaces);
router.post('/:id/spaces', createEventSpace);
router.get('/:id/spaces/:spaceId', getEventSpaceById);
router.put('/:id/spaces/:spaceId', updateEventSpace);
router.delete('/:id/spaces/:spaceId', deleteEventSpace);

export default router; 