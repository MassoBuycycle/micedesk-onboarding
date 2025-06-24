import pool from '../db/config.js';

/**
 * Create or update an announcement for a hotel. If one already exists, we update it; otherwise insert new.
 * Body: { message: string, active?: boolean }
 */
export const upsertHotelAnnouncement = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.hotelId);
    if (isNaN(hotelId)) {
      return res.status(400).json({ error: 'Invalid hotel ID' });
    }
    const { message, active = true } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const [existing] = await connection.query('SELECT id FROM hotel_announcements WHERE hotel_id = ?', [hotelId]);
    if (existing.length > 0) {
      // update
      await connection.query('UPDATE hotel_announcements SET message = ?, is_active = ?, updated_at = NOW() WHERE hotel_id = ?', [message, active, hotelId]);
      return res.json({ success: true, updated: true });
    }
    // insert
    await connection.query('INSERT INTO hotel_announcements (hotel_id, message, is_active, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [hotelId, message, active]);
    res.status(201).json({ success: true, created: true });
  } catch (err) {
    next(err);
  } finally {
    connection.release();
  }
};

/**
 * Get active announcement for a hotel (single)
 */
export const getHotelAnnouncement = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.hotelId);
    if (isNaN(hotelId)) return res.status(400).json({ error: 'Invalid hotel ID' });
    const [[row]] = await connection.query('SELECT id, message FROM hotel_announcements WHERE hotel_id = ? AND is_active = 1', [hotelId]);
    res.json(row || null);
  } catch (err) { next(err); } finally { connection.release(); }
};

/**
 * Return all active announcements with hotel name for homepage
 */
export const listActiveAnnouncements = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT a.id,
             a.message,
             h.id   AS hotel_id,
             h.name AS hotel_name,
             MIN(CONCAT(f.storage_path)) AS storage_path,
             CONCAT(u.first_name, ' ', u.last_name) AS assignee
      FROM hotel_announcements a
      JOIN hotels h ON a.hotel_id = h.id
      LEFT JOIN files f ON f.entity_id = h.id AND f.entity_type = 'hotels'
      LEFT JOIN file_types ft ON ft.id = f.file_type_id AND ft.code = 'main_image'
      LEFT JOIN (
        SELECT hotel_id, MIN(user_id) AS user_id
        FROM user_hotel_assignments
        GROUP BY hotel_id
      ) assign ON assign.hotel_id = h.id
      LEFT JOIN users u ON u.id = assign.user_id
      WHERE a.is_active = 1
      GROUP BY a.id
      ORDER BY a.updated_at DESC`);

    // build url for each row
    const { getSignedUrl } = await import('../services/s3Service.js');
    const publicBase = process.env.FILE_PUBLIC_BASE_URL || 'https://micedesk-hotel-cms.s3.eu-central-1.amazonaws.com/';
    const withUrls = await Promise.all(rows.map(async r => {
       if (!r.storage_path) return { ...r, image_url: null };
       try {
          const url = await getSignedUrl(r.storage_path);
          return { ...r, image_url: url };
       } catch {
          return { ...r, image_url: `${publicBase}${r.storage_path}` };
       }
    }));
    res.json(withUrls);
  } catch (err) { next(err); } finally { connection.release(); }
};

/**
 * Delete announcement for a hotel
 */
export const deleteHotelAnnouncement = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.hotelId);
    if (isNaN(hotelId)) {
      return res.status(400).json({ error: 'Invalid hotel ID' });
    }
    
    const [result] = await connection.query('DELETE FROM hotel_announcements WHERE hotel_id = ?', [hotelId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No announcement found for this hotel' });
    }
    
    res.json({ success: true, deleted: true });
  } catch (err) {
    next(err);
  } finally {
    connection.release();
  }
}; 