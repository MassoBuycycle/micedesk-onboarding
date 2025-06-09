import request from 'supertest';
import app from '../src/server.ts'; // Added .ts extension

describe('User API - /api/users', () => {
  let createdUserId: number;
  const testUserEmail = `testuser_${Date.now()}@example.com`; // Unique email for each test run

  it('should create a new user with all fields', async () => {
    const newUser = {
      first_name: 'Test',
      last_name: 'User',
      email: testUserEmail,
      password: 'SecurePassword123!',
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.userId).toBeDefined();
    createdUserId = response.body.userId;

    // Check returned user data (password will be hashed, so we don't check its value directly)
    expect(response.body.user).toBeDefined();
    expect(response.body.user.first_name).toBe(newUser.first_name);
    expect(response.body.user.last_name).toBe(newUser.last_name);
    expect(response.body.user.email).toBe(newUser.email);
    expect(response.body.user.password).toBeDefined(); // Check password hash exists
  });

  it('should update an existing user', async () => {
    expect(createdUserId).toBeDefined(); // Ensure POST test ran

    const updatedUserData = {
      first_name: 'UpdatedTest',
      last_name: 'UpdatedUser',
      email: testUserEmail, // Email usually isn't changed or requires special handling
      // password: 'NewSecurePassword123!' // Password updates might be separate endpoints
    };

    const response = await request(app)
      .put(`/api/users/${createdUserId}`)
      .send(updatedUserData);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.id).toBe(createdUserId);
    expect(response.body.user.first_name).toBe(updatedUserData.first_name);
    expect(response.body.user.last_name).toBe(updatedUserData.last_name);
    expect(response.body.user.email).toBe(updatedUserData.email);
  });

  // Cleanup: Delete the created user
  afterAll(async () => {
    if (createdUserId) {
      const res = await request(app).delete(`/api/users/${createdUserId}`);
      // console.log(`Cleanup for user ${createdUserId}: Status ${res.status}`);
    }
  });
}); 