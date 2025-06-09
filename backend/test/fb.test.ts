import request from 'supertest';
import app from '../src/server.ts'; // Adjust if your app export is different

describe('Food & Beverage API - /api/hotels/:hotelId/fb', () => {
  let testHotelId: number;
  const nonExistentHotelId = 999999;

  beforeAll(async () => {
    // Create a hotel to be used for these F&B tests
    const hotelData = {
      name: 'FB Test Hotel',
      // Add any other mandatory fields for hotel creation if your hotelController requires them
    };
    const response = await request(app).post('/api/hotels').send(hotelData);
    expect(response.statusCode).toBe(201);
    expect(response.body.hotelId).toBeDefined();
    testHotelId = response.body.hotelId;
  });

  afterAll(async () => {
    // Clean up the created hotel
    if (testHotelId) {
      await request(app).delete(`/api/hotels/${testHotelId}`);
    }
  });

  describe('/contact - F&B Contact Information', () => {
    const initialContactData = {
      contact_name: 'John Doe',
      contact_position: 'F&B Manager',
      contact_phone: '555-123-4567',
      contact_email: 'john.doe@fbtest.com'
    };

    const updatedContactData = {
      contact_name: 'Jane Doe',
      contact_position: 'Senior F&B Manager',
      contact_phone: '555-987-6543',
      contact_email: 'jane.doe@fbtest.com'
    };

    it('should return 404 when trying to get F&B contact for a non-existent hotel', async () => {
        const response = await request(app).get(`/api/hotels/${nonExistentHotelId}/fb/contact`);
        expect(response.statusCode).toBe(404);
    });
    
    it('should return 404 when trying to create F&B contact for a non-existent hotel', async () => {
        const response = await request(app)
            .post(`/api/hotels/${nonExistentHotelId}/fb/contact`)
            .send(initialContactData);
        expect(response.statusCode).toBe(404);
    });

    it('should create F&B contact information for a hotel', async () => {
      const response = await request(app)
        .post(`/api/hotels/${testHotelId}/fb/contact`)
        .send(initialContactData);
      
      expect(response.statusCode).toBe(200); // Upsert returns 200 on create/update
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.hotel_id).toBe(testHotelId);
      expect(response.body.data.contact_name).toBe(initialContactData.contact_name);
      expect(response.body.data.contact_email).toBe(initialContactData.contact_email);
    });

    it('should get F&B contact information for a hotel', async () => {
      const response = await request(app).get(`/api/hotels/${testHotelId}/fb/contact`);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.hotel_id).toBe(testHotelId);
      expect(response.body.data.contact_name).toBe(initialContactData.contact_name); // Should match initially created
    });

    it('should update existing F&B contact information for a hotel (upsert)', async () => {
      const response = await request(app)
        .post(`/api/hotels/${testHotelId}/fb/contact`)
        .send(updatedContactData);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.hotel_id).toBe(testHotelId);
      expect(response.body.data.contact_name).toBe(updatedContactData.contact_name);
      expect(response.body.data.contact_email).toBe(updatedContactData.contact_email);
    });

    it('should return 400 if no valid contact fields are provided on upsert', async () => {
        const response = await request(app)
            .post(`/api/hotels/${testHotelId}/fb/contact`)
            .send({}); // Empty body
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain('No valid F&B contact fields provided');
    });

    it('should delete F&B contact information for a hotel', async () => {
      const response = await request(app).delete(`/api/hotels/${testHotelId}/fb/contact`);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('F&B contact information deleted');
    });

    it('should return 404 when trying to get deleted F&B contact info', async () => {
      const response = await request(app).get(`/api/hotels/${testHotelId}/fb/contact`);
      expect(response.statusCode).toBe(404);
    });
    
    it('should return 404 when trying to delete already deleted F&B contact info', async () => {
        const response = await request(app).delete(`/api/hotels/${testHotelId}/fb/contact`);
        expect(response.statusCode).toBe(404);
    });

  });

  // TODO: Add describe blocks for /restaurants, /bars, /breakfast, /policies etc.
}); 