import pool from '../db/config.js';
import { extractDataForTable } from '../utils/dataMapping.js';

// F&B contact fields map to food_beverage_details table with fnb_ prefix
const FB_CONTACTS_FIELDS = ['fnb_contact_name', 'fnb_contact_position', 'fnb_contact_phone', 'fnb_contact_email'];

/**
 * Create or Update F&B Contact information for a hotel
 * POST /api/hotels/:hotelId/fb/contact
 * NOTE: Contact information is stored in food_beverage_details table
 */
export const upsertFbContact = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { hotelId } = req.params;
    const contactDataInput = req.body;

    if (isNaN(parseInt(hotelId))) {
        return res.status(400).json({ error: 'Invalid hotelId parameter.' });
    }

    // Map input fields to database fields (handle both with and without fnb_ prefix)
    const mappedData = {};
    for (const key in contactDataInput) {
        if (key.startsWith('fnb_')) {
            mappedData[key] = contactDataInput[key];
        } else if (['contact_name', 'contact_position', 'contact_phone', 'contact_email'].includes(key)) {
            mappedData[`fnb_${key}`] = contactDataInput[key];
        }
    }

    const contactData = extractDataForTable(mappedData, FB_CONTACTS_FIELDS);

    if (!contactData || Object.keys(contactData).length === 0) {
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
        // hotel_id is the PK for food_beverage_details
        const sql = `
            INSERT INTO food_beverage_details (hotel_id, ${fields.join(', ')}) 
            VALUES (?, ${fields.map(() => '?').join(', ')}) 
            ON DUPLICATE KEY UPDATE ${placeholders}, updated_at = NOW()
        `;
        
        await connection.query(sql, [hotelId, ...values, ...values]); // Values are repeated for INSERT and UPDATE parts

        // Fetch the created/updated record
        const [updatedContact] = await connection.query('SELECT hotel_id, fnb_contact_name, fnb_contact_position, fnb_contact_phone, fnb_contact_email FROM food_beverage_details WHERE hotel_id = ?', [hotelId]);

        res.status(200).json({ 
            success: true, 
            message: 'F&B contact information saved.',
            data: updatedContact[0] 
        });
    } catch (error) {
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
 * NOTE: Contact information is retrieved from food_beverage_details table
 */
export const getFbContact = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { hotelId } = req.params;

    if (isNaN(parseInt(hotelId))) {
        return res.status(400).json({ error: 'Invalid hotelId parameter.' });
    }

    try {
        const [contact] = await connection.query(
            'SELECT hotel_id, fnb_contact_name, fnb_contact_position, fnb_contact_phone, fnb_contact_email FROM food_beverage_details WHERE hotel_id = ?',
            [hotelId]
        );
        if (contact.length === 0) {
            return res.status(404).json({ error: `F&B contact information not found for hotel ID ${hotelId}.` });
        }
        res.status(200).json({ success: true, data: contact[0] });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Delete F&B Contact information for a hotel
 * DELETE /api/hotels/:hotelId/fb/contact
 * NOTE: This sets contact fields to NULL in food_beverage_details table rather than deleting the entire row
 */
export const deleteFbContact = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { hotelId } = req.params;

    if (isNaN(parseInt(hotelId))) {
        return res.status(400).json({ error: 'Invalid hotelId parameter.' });
    }

    try {
        // Set contact fields to NULL rather than deleting the entire food_beverage_details record
        const [result] = await connection.query(
            'UPDATE food_beverage_details SET fnb_contact_name = NULL, fnb_contact_position = NULL, fnb_contact_phone = NULL, fnb_contact_email = NULL, updated_at = NOW() WHERE hotel_id = ?',
            [hotelId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `F&B information not found for hotel ID ${hotelId}, nothing to delete.` });
        }
        res.status(200).json({ success: true, message: 'F&B contact information deleted.' });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

// Placeholder for other F&B controller functions (restaurants, bars, etc.) 