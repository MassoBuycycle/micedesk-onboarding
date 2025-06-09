## Hotel API Documentation

**Base URL:** `/api/hotels`

### 1. Create a New Hotel

*   **Endpoint:** `POST /api/hotels`
*   **Description:** Creates a new hotel along with its core details and related information (contact, billing, parking, and distance details). The operation is transactional.
*   **Request Body:** `application/json`
    *   Send a flat JSON object containing fields for the hotel and its related entities.
    *   **Required field:** `name` (for the hotel)
    *   **Required for billing (if any billing data is provided):** `billing_address_vat`
    *   **Example Request Body:**
        ```json
        {
            "name": "The Grand Test Hotel",
            "street": "123 Main St",
            "postal_code": "12345",
            "city": "Testville",
            "country": "TS",
            "phone": "555-0100", 
            "star_rating": 5,
            "category": "Luxury",
            "opening_date": 2023,
            "latest_renovation_date": 2024,
            "pms_system": "Opera Cloud",
            "planned_changes": "New spa wing in 2025",
            "attraction_in_the_area": "Test City Museum",

            "email": "info@grandtest.com",
            "website": "https://grandtest.com",

            "billing_address_name": "Grand Test Hotel Billing",
            "billing_address_street": "1 Finance Rd",
            "billing_address_zip": "54321",
            "billing_address_city": "Capital City",
            "billing_address_vat": "VAT123TEST",

            "no_of_parking_spaces": 150,
            "parking_cost_per_day": 20.00,

            "distance_to_airport_km": 10
        }
        ```
*   **Success Response:**
    *   **Code:** `201 Created`
    *   **Body:**
        ```json
        {
            "success": true,
            "hotelId": 123,
            "message": "Hotel and related information created successfully. Full data retrieval needs to join related tables.",
            "hotel": {
                "id": 123,
                "name": "The Grand Test Hotel",
                "street": "123 Main St",
                "created_at": "2024-01-01T12:00:00.000Z",
                "updated_at": "2024-01-01T12:00:00.000Z"
            }
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `name` is missing, or if billing data is provided but `billing_address_vat` is missing.
    *   `500 Internal Server Error`: Database errors.

### 2. Update an Existing Hotel

*   **Endpoint:** `PUT /api/hotels/:hotelId`
*   **Description:** Updates an existing hotel's core details and its related information. Uses upsert logic for related tables.
*   **Path Parameters:**
    *   `hotelId` (integer, required): The ID of the hotel to update.
*   **Request Body:** `application/json`
    *   Flat JSON object with fields to update.
    *   **Example Request Body:**
        ```json
        {
            "star_rating": 4,
            "email": "reservations@grandtest.com",
            "parking_cost_per_day": 25.00
        }
        ```
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:**
        ```json
        {
            "success": true,
            "hotelId": 123,
            "message": "Hotel and related information updated. Full data retrieval needs joins.",
            "hotel": {
                "id": 123,
                "name": "The Grand Test Hotel",
                "star_rating": 4,
                "updated_at": "2024-01-02T10:00:00.000Z"
            }
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid fields or missing required fields for upserting related data (e.g., `billing_address_vat`).
    *   `404 Not Found`: Hotel with `hotelId` not found.
    *   `500 Internal Server Error`: Database errors.

### 3. Get All Hotels

*   **Endpoint:** `GET /api/hotels`
*   **Description:** Retrieves a list of all hotels (core information only).
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:** Array of hotel objects (core fields).
        ```json
        [
            {
                "id": 123,
                "name": "The Grand Test Hotel"
            }
        ]
        ```
*   **Error Responses:**
    *   `500 Internal Server Error`.

### 4. Get a Specific Hotel

*   **Endpoint:** `GET /api/hotels/:hotelId`
*   **Description:** Retrieves a specific hotel (core information only). Update controller to join related tables for full details.
*   **Path Parameters:**
    *   `hotelId` (integer, required).
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:** Hotel object (core fields).
        ```json
        {
            "id": 123,
            "name": "The Grand Test Hotel"
        }
        ```
*   **Error Responses:**
    *   `404 Not Found`.
    *   `500 Internal Server Error`.

### 5. Delete a Hotel

*   **Endpoint:** `DELETE /api/hotels/:hotelId`
*   **Description:** Deletes a hotel and cascades to related data.
*   **Path Parameters:**
    *   `hotelId` (integer, required).
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:** 
        ```json
        { 
            "success": true 
        }
        ```
*   **Error Responses:**
    *   `404 Not Found`.
    *   `500 Internal Server Error`. 