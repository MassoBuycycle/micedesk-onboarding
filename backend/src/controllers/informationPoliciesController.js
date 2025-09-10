import pool from '../db/config.js';

/**
 * Get all information policies for a hotel
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getInformationPoliciesByHotel = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { systemHotelId } = req.params;
    
    const [rows] = await connection.query(`
      SELECT 
        ip.*,
        COALESCE(
          JSON_ARRAYAGG(
            CASE WHEN ipi.id IS NOT NULL THEN JSON_OBJECT(
              'id', ipi.id,
              'title', ipi.title,
              'is_condition', ipi.is_condition,
              'details', (
                SELECT COALESCE(
                  JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', ipid.id,
                      'name', ipid.name,
                      'description', ipid.description,
                      'default', ipid.\`default\`
                    )
                  ), JSON_ARRAY())
                FROM information_policy_item_details ipid
                WHERE ipid.information_policy_item_id = ipi.id
              )
            ) END
          ), JSON_ARRAY()) as items
      FROM information_policies ip
      LEFT JOIN information_policy_items ipi ON ip.id = ipi.information_policy_id
      WHERE ip.system_hotel_id = ?
      GROUP BY ip.id
      ORDER BY ip.type, ip.created_at
    `, [systemHotelId]);

    const policies = rows.map((row) => {
      let items = row.items;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      if (!Array.isArray(items)) items = [];
      items = items.filter(Boolean).map((item) => {
        let details = item.details;
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch { details = []; }
        }
        if (!Array.isArray(details)) details = [];
        return { ...item, details };
      });
      return { ...row, items };
    });

    res.status(200).json(policies);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get information policies by type for a hotel
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getInformationPoliciesByType = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { systemHotelId, type } = req.params;
    
    const [rows] = await connection.query(`
      SELECT 
        ip.*,
        COALESCE(
          JSON_ARRAYAGG(
            CASE WHEN ipi.id IS NOT NULL THEN JSON_OBJECT(
              'id', ipi.id,
              'title', ipi.title,
              'is_condition', ipi.is_condition,
              'details', (
                SELECT COALESCE(
                  JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', ipid.id,
                      'name', ipid.name,
                      'description', ipid.description,
                      'default', ipid.\`default\`
                    )
                  ), JSON_ARRAY())
                FROM information_policy_item_details ipid
                WHERE ipid.information_policy_item_id = ipi.id
              )
            ) END
          ), JSON_ARRAY()) as items
      FROM information_policies ip
      LEFT JOIN information_policy_items ipi ON ip.id = ipi.information_policy_id
      WHERE ip.system_hotel_id = ? AND ip.type = ?
      GROUP BY ip.id
      ORDER BY ip.created_at
    `, [systemHotelId, type]);

    const policies = rows.map((row) => {
      let items = row.items;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      if (!Array.isArray(items)) items = [];
      items = items.filter(Boolean).map((item) => {
        let details = item.details;
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch { details = []; }
        }
        if (!Array.isArray(details)) details = [];
        return { ...item, details };
      });
      return { ...row, items };
    });

    res.status(200).json(policies);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create a new information policy
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createInformationPolicy = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { system_hotel_id, type, items } = req.body;
    
    // Validate required fields
    if (!system_hotel_id || !type) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        error: 'System Hotel ID and type are required' 
      });
    }
    
    // Validate type
    const validTypes = ['room_information', 'service_information', 'general_policies'];
    if (!validTypes.includes(type)) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid policy type' 
      });
    }
    
    // Create the information policy
    const [policyResult] = await connection.query(
      'INSERT INTO information_policies (system_hotel_id, type) VALUES (?, ?)',
      [system_hotel_id, type]
    );
    
    const policyId = policyResult.insertId;
    
    // Create policy items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const [itemResult] = await connection.query(
          'INSERT INTO information_policy_items (information_policy_id, title, is_condition) VALUES (?, ?, ?)',
          [policyId, item.title, item.is_condition || false]
        );
        
        const itemId = itemResult.insertId;
        
        // Create item details if provided
        if (item.details && Array.isArray(item.details)) {
          for (const detail of item.details) {
            await connection.query(
              'INSERT INTO information_policy_item_details (information_policy_item_id, name, description, `default`) VALUES (?, ?, ?, ?)',
              [itemId, detail.name, detail.description || '', detail.default || false]
            );
          }
        }
      }
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      data: { id: policyId, system_hotel_id, type },
      message: 'Information policy created successfully'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update an information policy
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateInformationPolicy = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { type, items } = req.body;
    
    // Check if policy exists
    const [existing] = await connection.query(
      'SELECT id FROM information_policies WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        error: 'Information policy not found' 
      });
    }
    
    // Update policy type if provided
    if (type) {
      const validTypes = ['room_information', 'service_information', 'general_policies'];
      if (!validTypes.includes(type)) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid policy type' 
        });
      }
      
      await connection.query(
        'UPDATE information_policies SET type = ? WHERE id = ?',
        [type, id]
      );
    }
    
    // Update items if provided
    if (items && Array.isArray(items)) {
      
      // Delete existing items and their details
      await connection.query(
        'DELETE FROM information_policy_items WHERE information_policy_id = ?',
        [id]
      );
      
      // Create new items
      for (const item of items) {
        if (!item.title || item.title.trim() === '') {
          await connection.rollback();
          return res.status(400).json({ 
            success: false, 
            error: 'Item title is required' 
          });
        }
        
        const [itemResult] = await connection.query(
          'INSERT INTO information_policy_items (information_policy_id, title, is_condition) VALUES (?, ?, ?)',
          [id, item.title, item.is_condition || false]
        );
        
        const itemId = itemResult.insertId;
        
        // Create item details if provided
        if (item.details && Array.isArray(item.details)) {
          for (const detail of item.details) {
            if (!detail.name || detail.name.trim() === '') {
              await connection.rollback();
              return res.status(400).json({ 
                success: false, 
                error: 'Detail name is required' 
              });
            }
            
            await connection.query(
              'INSERT INTO information_policy_item_details (information_policy_item_id, name, description, `default`) VALUES (?, ?, ?, ?)',
              [itemId, detail.name, detail.description || '', detail.default || false]
            );
          }
        }
      }
      
    } else {
    }
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Information policy updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Delete an information policy
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const deleteInformationPolicy = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    // Check if policy exists
    const [existing] = await connection.query(
      'SELECT id FROM information_policies WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Information policy not found' 
      });
    }
    
    // Delete the policy (cascade will handle items and details)
    await connection.query(
      'DELETE FROM information_policies WHERE id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Information policy deleted successfully'
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 