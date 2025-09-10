import request from 'supertest';
import app from '../src/server.ts';

// WARNING: Event controllers are being refactored. This focuses on the new comprehensive createEvent.

describe('Event API - /api/events', () => {
  let createdEventId: number;
  const testHotelId = 1; // Ensure hotel with ID 1 exists
  const testEquipmentTypeId = 1; // Ensure equipment_type with ID 1 exists for AV tests (if we re-enable them)

  describe('POST /', () => {
    it('should create a new comprehensive event entry', async () => {
      const newEventData = {
        // For `events` table (main)
        hotel_id: testHotelId,
        contact_name: 'New Event Planner',
        contact_phone: '555-EVENT-01',
        contact_email: 'planner@event.test',
        contact_position: 'Lead Planner',

        // For `event_booking` table
        has_options: true,
        allows_split_options: false,
        option_duration: '14 days',
        contracted_companies: 'AV World, Catering Inc.',

        // For `event_financials` table
        requires_deposit: true,
        deposit_rules: '25% on booking',
        payment_methods: JSON.stringify(['Wire Transfer', 'ACH']), // Stored as JSON string
        commission_rules: 'No commission on venue',

        // For `event_operations` table
        has_overtime_material: false,
        lunch_location: 'Main Ballroom',
        min_participants: 50, // Formerly min_participants_package

        // For `event_spaces` (single space example)
        name: 'Conference Room A', // This is for event_spaces.name
        daily_rate: 300.00,
        size: '100 sqm',
        beamer_lumens: 3500,
        // ... other event_spaces fields from EVENT_SPACES_FIELDS if needed
      };

      const response = await request(app)
        .post('/api/events')
        .send(newEventData);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.eventId).toBeDefined();
      createdEventId = response.body.eventId;

      // Check main event data
      expect(response.body.event).toBeDefined();
      expect(response.body.event.id).toBe(createdEventId);
      expect(response.body.event.contact_name).toBe(newEventData.contact_name);

      // Check if related data hints are present in response
      if (newEventData.has_options !== undefined) {
          expect(response.body.booking).toBeDefined();
          expect(response.body.booking.has_options).toBe(newEventData.has_options);
      }
      if (newEventData.requires_deposit !== undefined) {
          expect(response.body.financials).toBeDefined();
          expect(response.body.financials.requires_deposit).toBe(newEventData.requires_deposit);
      }
      if (newEventData.lunch_location !== undefined) {
          expect(response.body.operations).toBeDefined();
          expect(response.body.operations.lunch_location).toBe(newEventData.lunch_location);
      }
      if (newEventData.name !== undefined && response.body.space) { // Check for space if 'name' (for space) was sent
          expect(response.body.space.name).toBe(newEventData.name);
      }
    });

  });

  // describe('/equipment', () => { ... }); // Old AV equipment tests - to be reviewed/refactored
  // describe('/contracting', () => { ... }); // Obsolete
  // describe('/technical', () => { ... }); // Obsolete
  // describe('/handling', () => { ... }); // Obsolete

  afterAll(async () => {
    if (createdEventId) {
      // Assuming a DELETE /api/events/:eventId will be implemented
      // await request(app).delete(`/api/events/${createdEventId}`);
    }
  });
}); 