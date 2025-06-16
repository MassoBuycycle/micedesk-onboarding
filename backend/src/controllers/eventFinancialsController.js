import pool from '../db/config.js';

/**
 * Get financials information for an event
 */
export const getEventFinancials = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }
    const connection = await pool.getConnection();
    try {
      // Check if event exists
      const [events] = await connection.query('SELECT id FROM onboarding_events WHERE id = ?', [eventId]);
      if (events.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      // Get financials data
      const [financialsRows] = await connection.query(
        'SELECT * FROM event_financials WHERE event_id = ?',
        [eventId]
      );
      
      if (financialsRows.length === 0) {
        return res.status(404).json({ error: 'Financial information not found for this event' });
      }
      
      // Parse JSON payment_methods if it's a string
      if (financialsRows[0].payment_methods && typeof financialsRows[0].payment_methods === 'string') {
        try {
          financialsRows[0].payment_methods = JSON.parse(financialsRows[0].payment_methods);
        } catch (err) {
          console.error('Error parsing payment_methods JSON:', err);
        }
      }
      
      res.status(200).json(financialsRows[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching event financials information:', error);
    res.status(500).json({ error: 'Failed to fetch financials information' });
  }
};

/**
 * Create or update financials information for an event
 */
export const createOrUpdateEventFinancials = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }
    const connection = await pool.getConnection();
    try {
      // Check if event exists
      const [events] = await connection.query('SELECT id FROM onboarding_events WHERE id = ?', [eventId]);
      if (events.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      console.log('Received financials data:', JSON.stringify(req.body));
      
      // Extract and process all fields from request body
      const financialsData = {};
      
      // Boolean fields
      if (req.body.requires_deposit !== undefined)
        financialsData.requires_deposit = req.body.requires_deposit;
      
      if (req.body.has_info_invoice !== undefined)
        financialsData.has_info_invoice = req.body.has_info_invoice;
      
      if (req.body.has_minimum_spent !== undefined)
        financialsData.has_minimum_spent = req.body.has_minimum_spent;
      
      // String fields
      if ('deposit_rules' in req.body)
        financialsData.deposit_rules = req.body.deposit_rules || '';
      if ('deposit_invoicer' in req.body)
        financialsData.deposit_invoicer = req.body.deposit_invoicer || '';
      if ('invoice_handling' in req.body)
        financialsData.invoice_handling = req.body.invoice_handling || '';
      if ('commission_rules' in req.body)
        financialsData.commission_rules = req.body.commission_rules || '';
      
      // JSON field
      if ('payment_methods' in req.body) {
        if (req.body.payment_methods && typeof req.body.payment_methods !== 'string') {
          financialsData.payment_methods = JSON.stringify(req.body.payment_methods);
        } else {
          financialsData.payment_methods = req.body.payment_methods || '[]';
        }
      }
      
      console.log('Processed financials data:', JSON.stringify(financialsData));
      
      // Check if financials record exists
      const [existingRows] = await connection.query(
        'SELECT id FROM event_financials WHERE event_id = ?',
        [eventId]
      );
      
      if (existingRows.length > 0) {
        // Update existing
        const fields = Object.keys(financialsData);
        if (fields.length > 0) {
          const setClause = fields.map(f => `${f} = ?`).join(', ');
          const values = fields.map(f => financialsData[f]);
          await connection.query(
            `UPDATE event_financials SET ${setClause} WHERE event_id = ?`,
            [...values, eventId]
          );
        }
      } else {
        // Insert new
        const fields = Object.keys(financialsData);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(f => financialsData[f]);
        await connection.query(
          `INSERT INTO event_financials (event_id${fields.length ? ', ' + fields.join(', ') : ''}) VALUES (?${fields.length ? ', ' + placeholders : ''})`,
          [eventId, ...values]
        );
      }
      
      // Retrieve updated record
      const [financialsRows] = await connection.query(
        'SELECT * FROM event_financials WHERE event_id = ?',
        [eventId]
      );
      if (financialsRows[0] && typeof financialsRows[0].payment_methods === 'string') {
        try {
          financialsRows[0].payment_methods = JSON.parse(financialsRows[0].payment_methods);
        } catch (err) {
          console.error('Error parsing payment_methods JSON:', err);
        }
      }
      
      res.status(200).json({
        success: true,
        financials: financialsRows[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in createOrUpdateEventFinancials:', error);
    console.error('Full error details:', error.message, error.code, error.sqlMessage);
    res.status(500).json({ 
      error: 'Failed to save financials information',
      details: error.message || error.sqlMessage || 'Unknown database error'
    });
  }
}; 