import request from 'supertest';
import app from '../src/server.ts';

// Mock the database connection if necessary, or ensure a test DB is configured
// For simplicity, this example assumes the API interacts with a live (test) DB

describe('Hotel API - /api/hotels', () => {
  let createdHotelId: number;

  it('should create a new hotel with all related information', async () => {
    const newHotelFullData = {
        name: 'Comprehensive Test Hotel',
        street: '789 Complex St',
        postal_code: 'CTX-12345',
        city: 'Fullerton',
        country: 'FC',
        phone: '555-1000',
        star_rating: 5,
        category: 'Full Service',
        opening_date: 2024,
        latest_renovation_date: 2024,
        pms_system: 'Oracle Hospitality',
        planned_changes: 'New wing opening 2025',
        attraction_in_the_area: 'Major Theme Park',
        email: 'contact@comprehensivetest.com',
        website: 'https://comprehensivetest.com',
        billing_address_name: 'Comprehensive Hotel Billing Dept',
        billing_address_street: '1 Billing Plaza',
        billing_address_zip: 'CB-54321',
        billing_address_city: 'Bellington',
        billing_address_vat: 'VAT-COMP-TEST-123',
        no_of_parking_spaces: 200,
        no_of_parking_spaces_garage: 100,
        no_of_parking_spaces_electric: 20,
        no_of_parking_spaces_bus: 5,
        no_of_parking_spaces_outside: 100,
        no_of_parking_spaces_disabled: 10,
        parking_cost_per_hour: 3.50,
        parking_cost_per_day: 25.00,
        distance_to_airport_km: 15,
        distance_to_highway_km: 1,
        distance_to_fair_km: 5,
        distance_to_train_station: 2,
        distance_to_public_transport: 0.5,
    };

    const response = await request(app)
      .post('/api/hotels')
      .send(newHotelFullData);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.hotelId).toBeDefined();
    createdHotelId = response.body.hotelId;
    // Check only the core hotel data in the response for now
    expect(response.body.hotel.name).toBe(newHotelFullData.name);
    expect(response.body.hotel.phone).toBe(newHotelFullData.phone);
    // Add more assertions for related data if the controller were to return it joined
  });

  it('should update an existing hotel with all related information', async () => {
    expect(createdHotelId).toBeDefined();

    const updatedHotelFullData = {
        name: 'Updated Comprehensive Hotel',
        street: '789 Updated Complex St',
        postal_code: 'CTX-67890',
        city: 'Updated Fullerton',
        country: 'UFC',
        phone: '555-2000',
        star_rating: 4,
        category: 'Select Service',
        email: 'updated.contact@comprehensivetest.com',
        website: 'https://updated.comprehensivetest.com',
        billing_address_name: 'Updated Comp Hotel Billing',
        billing_address_vat: 'VAT-UPD-COMP-456',
        no_of_parking_spaces: 150,
        parking_cost_per_day: 22.00,
        distance_to_airport_km: 12,
    };

    const response = await request(app)
      .put(`/api/hotels/${createdHotelId}`)
      .send(updatedHotelFullData);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.hotelId).toBe(createdHotelId);
    expect(response.body.hotel.name).toBe(updatedHotelFullData.name);
    expect(response.body.hotel.phone).toBe(updatedHotelFullData.phone);
    // Add more assertions for related data if the controller returns it
  });

  // afterAll to clean up the created hotel and its related data (cascades)
  afterAll(async () => {
    if (createdHotelId) {
      await request(app).delete(`/api/hotels/${createdHotelId}`);
    }
  });
}); 