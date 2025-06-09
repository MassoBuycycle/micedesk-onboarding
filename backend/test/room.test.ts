import request from 'supertest';
import app from '../src/server.ts';

// WARNING: The Room API and its controllers are undergoing major rework.
// These tests reflect initial steps for the new comprehensive room structure.

describe('Room API - /api/rooms', () => {
  let createdRoomId: number;
  const testHotelId = 1; // Ensure hotel with ID 1 exists in your test DB

  describe('POST /', () => {
    it('should create a new comprehensive room entry', async () => {
      const newRoomData = {
        hotel_id: testHotelId,
        main_contact_name: 'Front Desk Rooms',
        reception_hours: '24/7',
        phone: '555-ROOM-01',
        email: 'room101@hotel.test',
        check_in: '14:00:00',
        check_out: '12:00:00',
        early_check_in_cost: 20.00,
        late_check_out_cost: 25.00,
        early_check_in_time_frame: '10:00-14:00',
        late_check_out_time: '14:00',
        payment_methods: JSON.stringify(['Cash', 'Credit Card']),
        amt_single_rooms: 10,
        amt_double_rooms: 5,
        amt_connecting_rooms: 2,
        amt_handicapped_accessible_rooms: 1,
        is_dogs_allowed: true,
        dog_fee: 15.00,
        dog_fee_inclusions: 'Water bowl and treat on arrival',
        shower_toilet: true,
        balcony: true,
        wifi: true,
        tv: true,
        desk: true,
        category_name: 'Standard Double', // For single flat category creation
        pms_name: 'STDDBL',
        num_rooms: 5, 
        size: 25,     
        bed_type: 'Double', 
        revenue_manager_name: 'Alice Wonderland',
        group_request_min_rooms: 5,
        // Add other fields from your comprehensive list as needed
      };

      const response = await request(app)
        .post('/api/rooms')
        .send(newRoomData);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.roomId).toBeDefined();
      createdRoomId = response.body.roomId;
      expect(response.body.room).toBeDefined();
      expect(response.body.room.id).toBe(createdRoomId);
      expect(response.body.room.hotel_id).toBe(newRoomData.hotel_id);
      expect(response.body.room.main_contact_name).toBe(newRoomData.main_contact_name);
      
      if (newRoomData.category_name) {
          expect(response.body.category_infos).toBeInstanceOf(Array);
          expect(response.body.category_infos.length).toBeGreaterThanOrEqual(1);
          expect(response.body.category_infos[0].category_name).toBe(newRoomData.category_name);
      }
    });

    // TODOs for other tests
  });

  describe('POST /:roomId/categories', () => {
    let testRoomId: number;

    beforeAll(async () => {
      // Create a room first to get a valid roomId for testing category creation
      const roomData = {
        hotel_id: testHotelId, // Assumes testHotelId is defined (e.g., 1)
        main_contact_name: 'Room For Categories Test'
        // Add any other minimal required fields for POST /api/rooms
      };
      const response = await request(app).post('/api/rooms').send(roomData);
      expect(response.statusCode).toBe(201); // Ensure room creation was successful
      expect(response.body.roomId).toBeDefined();
      testRoomId = response.body.roomId;
    });

    it('should add multiple category infos to an existing room', async () => {
      const categoryInfosPayload = [
        {
          category_name: 'King Suite Category',
          pms_name: 'KNGSUTCAT',
          num_rooms: 5,
          size: 45,
          bed_type: 'King',
          surcharges_upsell: 'Ocean View +$70, Jacuzzi +$100',
          room_features: 'Separate Living Area, Jacuzzi Tub, Balcony',
          second_person_surcharge: 0, // Assuming included
          extra_bed_surcharge: 50.00,
          baby_bed_available: true,
          extra_bed_available: true
        },
        {
          category_name: 'Standard Twin Category',
          pms_name: 'STDTWNCAT',
          num_rooms: 10,
          size: 28,
          bed_type: 'Twin x2',
          surcharges_upsell: 'City View +$20',
          room_features: 'Basic Amenities, Desk',
          second_person_surcharge: 15.00,
          extra_bed_surcharge: 30.00,
          baby_bed_available: false,
          extra_bed_available: true
        }
      ];

      const response = await request(app)
        .post(`/api/rooms/${testRoomId}/categories`)
        .send(categoryInfosPayload);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.roomId).toBe(testRoomId);
      expect(response.body.message).toContain('2 category infos added'); // Check count
      expect(response.body.categories_added).toBeInstanceOf(Array);
      expect(response.body.categories_added.length).toBe(2);
      expect(response.body.categories_added[0].category_name).toBe(categoryInfosPayload[0].category_name);
      expect(response.body.categories_added[1].category_name).toBe(categoryInfosPayload[1].category_name);
      expect(response.body.categories_added[0].room_id).toBe(testRoomId);
    });

    it('should return 400 if request body is not an array', async () => {
      const response = await request(app)
        .post(`/api/rooms/${testRoomId}/categories`)
        .send({ category_name: 'Not an array' }); // Invalid payload
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('Request body must be a non-empty array');
    });

    it('should return 400 if an item in array is missing category_name', async () => {
      const categoryInfosPayload = [
        { pms_name: 'Valid Name' }, // Missing category_name
        { category_name: 'Good Category' }
      ];
      const response = await request(app)
        .post(`/api/rooms/${testRoomId}/categories`)
        .send(categoryInfosPayload);
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('Each category info object must contain at least a category_name');
    });

    it('should return 404 if roomId does not exist', async () => {
      const nonExistentRoomId = 999999;
      const categoryInfosPayload = [{ category_name: 'Test' }];
      const response = await request(app)
        .post(`/api/rooms/${nonExistentRoomId}/categories`)
        .send(categoryInfosPayload);
      expect(response.statusCode).toBe(404);
      expect(response.body.error).toContain(`Room with ID ${nonExistentRoomId} not found`);
    });

    // Cleanup for the room created in beforeAll, if necessary and if DELETE is implemented.
    // For now, this might leave a room in the DB after tests.
  });

  afterAll(async () => {
    if (createdRoomId) {
      // console.log(`Room created with ID: ${createdRoomId} - manual cleanup might be needed.`);
    }
  });
});