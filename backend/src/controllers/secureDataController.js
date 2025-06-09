import pool from '../db/config.js';
import { encrypt, decrypt } from '../utils/encryption.js';

/**
 * List secure data entries for a specific hotel (password masked).
 */
export const listHotelSecureData = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.hotelId);
    if (isNaN(hotelId)) {
      return res.status(400).json({ error: 'Invalid hotel ID' });
    }
    const [rows] = await connection.query(
      'SELECT id, name, username FROM hotel_secure_data WHERE hotel_id = ? ORDER BY created_at DESC',
      [hotelId]
    );

    // Mask password field. We don't return it here
    const data = rows.map((row) => ({ ...row, passwordMasked: '********' }));
    res.json(data);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create a new secure data entry for a hotel
 */
export const createHotelSecureData = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.hotelId);
    if (isNaN(hotelId)) {
      return res.status(400).json({ error: 'Invalid hotel ID' });
    }

    const { name, username, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    const encryptedPassword = encrypt(password);

    const [result] = await connection.query(
      'INSERT INTO hotel_secure_data (hotel_id, name, username, password_encrypted, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [hotelId, name, username || null, encryptedPassword]
    );

    res.status(201).json({ id: result.insertId, success: true });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Retrieve decrypted username & password for a secure data entry.
 */
export const getSecureDataEntry = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const entryId = parseInt(req.params.entryId);
    if (isNaN(entryId)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }
    const [[row]] = await connection.query(
      'SELECT id, name, username, password_encrypted FROM hotel_secure_data WHERE id = ?',
      [entryId]
    );
    if (!row) {
      return res.status(404).json({ error: 'Secure data entry not found' });
    }
    const decryptedPassword = decrypt(row.password_encrypted);
    res.json({ id: row.id, name: row.name, username: row.username, password: decryptedPassword });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 