import express from 'express';
import { 
  getAllEvents,
  createEvent,
  getEventsByHotelId,
  getEventById,
  updateEvent
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

import {
  getTechnicalByEventId,
  createOrUpdateTechnical
} from '../controllers/eventTechnicalController.js';

import {
  getContractingByEventId,
  createOrUpdateContracting
} from '../controllers/eventContractingController.js';

const router = express.Router();

// Event main routes
router.get('/', getAllEvents);
router.post('/', createEvent);

// Get events for a specific hotel
router.get('/hotel/:hotelId', getEventsByHotelId);

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

// Technical routes
router.get('/:id/technical', getTechnicalByEventId);
router.post('/:id/technical', createOrUpdateTechnical);

// Contracting routes
router.get('/:id/contracting', getContractingByEventId);
router.post('/:id/contracting', createOrUpdateContracting);

// --------------------------------------------------
// Generic single event routes (placed after sub-routes)
// --------------------------------------------------
router.get('/:id', getEventById);
router.put('/:id', updateEvent);

export default router; 