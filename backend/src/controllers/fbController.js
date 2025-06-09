import pool from '../db/config.js';
import { extractDataForTable } from '../utils/dataMapping.js';

const FB_CONTACTS_FIELDS = ['contact_name', 'contact_position', 'contact_phone', 'contact_email'];

/**
 * Create or Update F&B Contact information for a hotel
 * POST /api/hotels/:hotelId/fb/contact
 */
export const upsertFbContact = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { hotelId } = req.params;
    const contactDataInput = req.body;

    if (isNaN(parseInt(hotelId))) {
        return res.status(400).json({ error: 'Invalid hotelId parameter.' });
    }

    const contactData = extractDataForTable(contactDataInput, FB_CONTACTS_FIELDS);

    if (!contactData) {
        return res.status(400).json({ error: 'No valid F&B contact fields provided.' });
    }

    try {
        // Check if hotel exists
        const [hotels] = await connection.query('SELECT id FROM hotels WHERE id = ?', [hotelId]);
        if (hotels.length === 0) {
            return res.status(404).json({ error: `Hotel with ID ${hotelId} not found.` });
        }

        const fields = Object.keys(contactData);
        const placeholders = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => contactData[f]);

        // Upsert logic using INSERT ... ON DUPLICATE KEY UPDATE
        // hotel_id is the PK for fb_contacts
        const sql = `
            INSERT INTO fb_contacts (hotel_id, ${fields.join(', ')}) 
            VALUES (?, ${fields.map(() => '?').join(', ')}) 
            ON DUPLICATE KEY UPDATE ${placeholders}, updated_at = NOW()
        `;
        
        await connection.query(sql, [hotelId, ...values, ...values]); // Values are repeated for INSERT and UPDATE parts

        // Fetch the created/updated record
        const [updatedContact] = await connection.query('SELECT * FROM fb_contacts WHERE hotel_id = ?', [hotelId]);

        res.status(200).json({ 
            success: true, 
            message: 'F&B contact information saved.',
            data: updatedContact[0] 
        });
    } catch (error) {
        console.error('Error in upsertFbContact:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') { // Should be caught by hotel existence check
            return res.status(400).json({ error: `Hotel with ID ${hotelId} not found (foreign key constraint).` });
        }
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Get F&B Contact information for a hotel
 * GET /api/hotels/:hotelId/fb/contact
 */
export const getFbContact = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { hotelId } = req.params;

    if (isNaN(parseInt(hotelId))) {
        return res.status(400).json({ error: 'Invalid hotelId parameter.' });
    }

    try {
        const [contact] = await connection.query('SELECT * FROM fb_contacts WHERE hotel_id = ?', [hotelId]);
        if (contact.length === 0) {
            return res.status(404).json({ error: `F&B contact information not found for hotel ID ${hotelId}.` });
        }
        res.status(200).json({ success: true, data: contact[0] });
    } catch (error) {
        console.error('Error in getFbContact:', error);
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Delete F&B Contact information for a hotel
 * DELETE /api/hotels/:hotelId/fb/contact
 */
export const deleteFbContact = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { hotelId } = req.params;

    if (isNaN(parseInt(hotelId))) {
        return res.status(400).json({ error: 'Invalid hotelId parameter.' });
    }

    try {
        const [result] = await connection.query('DELETE FROM fb_contacts WHERE hotel_id = ?', [hotelId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `F&B contact information not found for hotel ID ${hotelId}, nothing to delete.` });
        }
        res.status(200).json({ success: true, message: 'F&B contact information deleted.' });
    } catch (error) {
        console.error('Error in deleteFbContact:', error);
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

// Placeholder for other F&B controller functions (restaurants, bars, etc.) 