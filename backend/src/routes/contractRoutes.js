import express from 'express';
import { 
  getContractDetails,
  upsertContractDetails,
  deleteContractDetails
} from '../controllers/contractController.js';

const router = express.Router({ mergeParams: true });

// Contract routes - all under /api/hotels/:hotelId/contract
router.get('/', getContractDetails);
router.post('/', upsertContractDetails);
router.put('/', upsertContractDetails); // PUT also uses upsert
router.delete('/', deleteContractDetails);

export default router; 