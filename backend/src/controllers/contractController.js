import pool from '../db/config.js';

// Define allowed fields for contract details
const CONTRACT_FIELDS = [
  'contract_model',
  'fte_count',
  'onboarding_date',
  'contract_start_date',
  'special_agreements',
  'email_addresses_created',
  'access_pms_system',
  'access_sc_tool',
  'access_other_systems'
];

/**
 * Get contract details by hotel ID
 */
export const getContractDetails = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.hotelId);
    
    const [contracts] = await connection.query(
      'SELECT * FROM onboarding_contract_details WHERE hotel_id = ?',
      [hotelId]
    );
    
    // Return empty object if no contract details found (not an error)
    const contractData = contracts[0] || {};
    
    // Parse access_other_systems if it exists
    if (contractData.access_other_systems) {
      try {
        contractData.access_other_systems = JSON.parse(contractData.access_other_systems);
      } catch (e) {
        contractData.access_other_systems = [];
      }
    }
    
    res.status(200).json(contractData);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create or update contract details for a hotel
 */
export const upsertContractDetails = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const hotelId = parseInt(req.params.hotelId);
    const data = req.body;
    
    // Validate hotel exists
    const [hotels] = await connection.query(
      'SELECT id FROM onboarding_hotels WHERE id = ?',
      [hotelId]
    );
    
    if (hotels.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    // Prepare data
    const contractData = {};
    CONTRACT_FIELDS.forEach(field => {
      if (data[field] !== undefined) {
        if (field === 'access_other_systems' && typeof data[field] !== 'string') {
          contractData[field] = JSON.stringify(data[field] || []);
        } else if (field === 'fte_count') {
          contractData[field] = parseFloat(data[field]) || 0;
        } else if (['onboarding_date', 'contract_start_date'].includes(field)) {
          // Format dates to YYYY-MM-DD for MySQL DATE columns
          if (data[field]) {
            const dateStr = String(data[field]);
            // If it's an ISO string or contains 'T', extract just the date part
            if (dateStr.includes('T')) {
              contractData[field] = dateStr.split('T')[0];
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              // Already in correct format
              contractData[field] = dateStr;
            } else {
              // Try to parse and format
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                contractData[field] = date.toISOString().split('T')[0];
              } else {
                contractData[field] = null;
              }
            }
          } else {
            contractData[field] = null;
          }
        } else {
          contractData[field] = data[field];
        }
      }
    });
    
    // Check if contract details already exist
    const [existing] = await connection.query(
      'SELECT id FROM onboarding_contract_details WHERE hotel_id = ?',
      [hotelId]
    );
    
    let contractId;
    
    if (existing.length > 0) {
      // Update existing
      const updateFields = Object.keys(contractData);
      if (updateFields.length > 0) {
        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        const values = updateFields.map(field => contractData[field]);
        
        await connection.query(
          `UPDATE onboarding_contract_details SET ${setClause} WHERE hotel_id = ?`,
          [...values, hotelId]
        );
      }
      contractId = existing[0].id;
    } else {
      // Insert new
      contractData.hotel_id = hotelId;
      const fields = Object.keys(contractData);
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(f => contractData[f]);
      
      const [result] = await connection.query(
        `INSERT INTO onboarding_contract_details (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      contractId = result.insertId;
    }
    
    await connection.commit();
    
    // Fetch and return updated data
    const [[updatedContract]] = await connection.query(
      'SELECT * FROM onboarding_contract_details WHERE id = ?',
      [contractId]
    );
    
    // Parse access_other_systems
    if (updatedContract.access_other_systems) {
      try {
        updatedContract.access_other_systems = JSON.parse(updatedContract.access_other_systems);
      } catch (e) {
        updatedContract.access_other_systems = [];
      }
    }
    
    res.status(200).json({
      success: true,
      data: updatedContract,
      message: existing.length > 0 ? 'Contract details updated successfully' : 'Contract details created successfully'
    });
    
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Delete contract details
 */
export const deleteContractDetails = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.hotelId);
    
    const [result] = await connection.query(
      'DELETE FROM onboarding_contract_details WHERE hotel_id = ?',
      [hotelId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contract details not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Contract details deleted successfully' 
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 