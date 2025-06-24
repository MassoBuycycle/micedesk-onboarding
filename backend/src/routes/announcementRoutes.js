import express from 'express';
import { upsertHotelAnnouncement, getHotelAnnouncement, listActiveAnnouncements, deleteHotelAnnouncement } from '../controllers/announcementController.js';

const router = express.Router();

// Upsert announcement for a specific hotel
router.post('/hotels/:hotelId/announcement', upsertHotelAnnouncement);

// Get active announcement for a hotel
router.get('/hotels/:hotelId/announcement', getHotelAnnouncement);

// Delete announcement for a hotel
router.delete('/hotels/:hotelId/announcement', deleteHotelAnnouncement);

// List active announcements for homepage
router.get('/announcements/active', listActiveAnnouncements);

export default router; 