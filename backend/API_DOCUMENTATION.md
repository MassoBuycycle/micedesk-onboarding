# Hotel Management API Documentation

## Overview

This API provides endpoints for managing a hotel system, including user management, room types and categories, and hotel information.

## Base URL

```
http://localhost:3030
```

## Authentication

Authentication details to be implemented.

## Error Handling

The API returns standard HTTP status codes and JSON error responses:

```json
{
  "error": "Error message description"
}
```

Common error codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized
- `404` - Resource Not Found
- `500` - Server Error

## API Endpoints

### User Management

#### Get All Users

Retrieves a list of all users.

- **URL**: `/api/users`
- **Method**: `GET`
- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-01T00:00:00.000Z"
  }
]
```

#### Get User by ID

Retrieves a specific user by ID.

- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Response**: `200 OK`

```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "created_at": "2023-06-01T00:00:00.000Z",
  "updated_at": "2023-06-01T00:00:00.000Z"
}
```

#### Create User

Creates a new user.

- **URL**: `/api/users`
- **Method**: `POST`
- **Request Body**:

```json
{
  "first_name": "Alice",
  "last_name": "Johnson",
  "email": "alice@example.com",
  "password": "securepassword"
}
```

- **Response**: `201 Created`

```json
{
  "success": true,
  "userId": 3,
  "user": {
    "id": 3,
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@example.com",
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-01T00:00:00.000Z"
  }
}
```

#### Update User

Updates an existing user.

- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **Request Body** (all fields optional):

```json
{
  "first_name": "Alice",
  "last_name": "Williams",
  "email": "alice.new@example.com",
  "password": "newsecurepassword"
}
```

- **Response**: `200 OK`

```json
{
  "success": true,
  "userId": 3,
  "user": {
    "id": 3,
    "first_name": "Alice",
    "last_name": "Williams",
    "email": "alice.new@example.com",
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-02T00:00:00.000Z"
  }
}
```

#### Delete User

Deletes a user.

- **URL**: `/api/users/:id`
- **Method**: `DELETE`
- **Response**: `200 OK`

```json
{
  "success": true
}
```

### Room Types Management

#### Get All Room Types

Retrieves all room types with their categories.

- **URL**: `/api/rooms/types`
- **Method**: `GET`
- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "name": "Standard",
    "max_occupancy": 2,
    "base_price": 100.00,
    "description": "Standard room with basic amenities",
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-01T00:00:00.000Z",
    "categories": [
      {
        "id": 1,
        "room_id": 1,
        "category_name": "Standard Single",
        "pms_name": "STD1",
        "num_rooms": 10,
        "size": 20,
        "bed_type": "Single",
        "surcharges_upsell": "",
        "room_features": "",
        "second_person_surcharge": 0,
        "extra_bed_surcharge": 0,
        "baby_bed_available": 1,
        "extra_bed_available": 0,
        "created_at": "2023-06-01T00:00:00.000Z",
        "updated_at": "2023-06-01T00:00:00.000Z"
      }
    ]
  }
]
```

#### Get Room Type by ID

Retrieves a specific room type with its categories.

- **URL**: `/api/rooms/types/:id`
- **Method**: `GET`
- **Response**: `200 OK`

```json
{
  "id": 1,
  "name": "Standard",
  "max_occupancy": 2,
  "base_price": 100.00,
  "description": "Standard room with basic amenities",
  "created_at": "2023-06-01T00:00:00.000Z",
  "updated_at": "2023-06-01T00:00:00.000Z",
  "categories": [
    {
      "id": 1,
      "room_id": 1,
      "category_name": "Standard Single",
      "pms_name": "STD1",
      "num_rooms": 10,
      "size": 20,
      "bed_type": "Single",
      "surcharges_upsell": "",
      "room_features": "",
      "second_person_surcharge": 0,
      "extra_bed_surcharge": 0,
      "baby_bed_available": 1,
      "extra_bed_available": 0,
      "created_at": "2023-06-01T00:00:00.000Z",
      "updated_at": "2023-06-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Room Type

Creates a new room type.

- **URL**: `/api/rooms/types`
- **Method**: `POST`
- **Request Body**:

```json
{
  "name": "Deluxe",
  "max_occupancy": 3,
  "base_price": 150.00,
  "description": "Deluxe room with premium amenities"
}
```

- **Response**: `201 Created`

```json
{
  "success": true,
  "roomTypeId": 2,
  "roomType": {
    "id": 2,
    "name": "Deluxe",
    "max_occupancy": 3,
    "base_price": 150.00,
    "description": "Deluxe room with premium amenities",
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-01T00:00:00.000Z",
    "categories": []
  }
}
```

#### Update Room Type

Updates an existing room type.

- **URL**: `/api/rooms/types/:id`
- **Method**: `PUT`
- **Request Body** (all fields optional):

```json
{
  "name": "Deluxe Premium",
  "max_occupancy": 4,
  "base_price": 180.00,
  "description": "Updated description for deluxe room"
}
```

- **Response**: `200 OK`

```json
{
  "success": true,
  "roomTypeId": 2,
  "roomType": {
    "id": 2,
    "name": "Deluxe Premium",
    "max_occupancy": 4,
    "base_price": 180.00,
    "description": "Updated description for deluxe room",
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-02T00:00:00.000Z",
    "categories": []
  }
}
```

#### Delete Room Type

Deletes a room type and all its associated categories.

- **URL**: `/api/rooms/types/:id`
- **Method**: `DELETE`
- **Response**: `200 OK`

```json
{
  "success": true
}
```

### Room Categories Management

#### Get All Categories for a Room Type

Retrieves all categories for a specific room type.

- **URL**: `/api/rooms/types/:roomId/categories`
- **Method**: `GET`
- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "room_id": 1,
    "category_name": "Standard Single",
    "pms_name": "STD1",
    "num_rooms": 10,
    "size": 20,
    "bed_type": "Single",
    "surcharges_upsell": "",
    "room_features": "",
    "second_person_surcharge": 0,
    "extra_bed_surcharge": 0,
    "baby_bed_available": 1,
    "extra_bed_available": 0,
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-01T00:00:00.000Z"
  }
]
```

#### Get Room Category by ID

Retrieves a specific room category.

- **URL**: `/api/rooms/categories/:id`
- **Method**: `GET`
- **Response**: `200 OK`

```json
{
  "id": 1,
  "room_id": 1,
  "category_name": "Standard Single",
  "pms_name": "STD1",
  "num_rooms": 10,
  "size": 20,
  "bed_type": "Single",
  "surcharges_upsell": "",
  "room_features": "",
  "second_person_surcharge": 0,
  "extra_bed_surcharge": 0,
  "baby_bed_available": 1,
  "extra_bed_available": 0,
  "created_at": "2023-06-01T00:00:00.000Z",
  "updated_at": "2023-06-01T00:00:00.000Z"
}
```

#### Create Room Category

Creates a new room category for a specific room type.

- **URL**: `/api/rooms/types/:roomId/categories`
- **Method**: `POST`
- **Request Body**:

```json
{
  "category_name": "Deluxe Double",
  "pms_name": "DLX2",
  "num_rooms": 5,
  "size": 25,
  "bed_type": "Double",
  "surcharges_upsell": "Breakfast included",
  "room_features": "Sea view, Balcony",
  "second_person_surcharge": 25,
  "extra_bed_surcharge": 50,
  "baby_bed_available": true,
  "extra_bed_available": true
}
```

- **Response**: `201 Created`

```json
{
  "success": true,
  "categoryId": 2,
  "category": {
    "id": 2,
    "room_id": 2,
    "category_name": "Deluxe Double",
    "pms_name": "DLX2",
    "num_rooms": 5,
    "size": 25,
    "bed_type": "Double",
    "surcharges_upsell": "Breakfast included",
    "room_features": "Sea view, Balcony",
    "second_person_surcharge": 25,
    "extra_bed_surcharge": 50,
    "baby_bed_available": 1,
    "extra_bed_available": 1,
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-01T00:00:00.000Z"
  }
}
```

#### Update Room Category

Updates an existing room category.

- **URL**: `/api/rooms/categories/:id`
- **Method**: `PUT`
- **Request Body** (all fields optional):

```json
{
  "category_name": "Deluxe Double Premium",
  "num_rooms": 7,
  "size": 30,
  "extra_bed_surcharge": 60
}
```

- **Response**: `200 OK`

```json
{
  "success": true,
  "categoryId": 2,
  "category": {
    "id": 2,
    "room_id": 2,
    "category_name": "Deluxe Double Premium",
    "pms_name": "DLX2",
    "num_rooms": 7,
    "size": 30,
    "bed_type": "Double",
    "surcharges_upsell": "Breakfast included",
    "room_features": "Sea view, Balcony",
    "second_person_surcharge": 25,
    "extra_bed_surcharge": 60,
    "baby_bed_available": 1,
    "extra_bed_available": 1,
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2023-06-02T00:00:00.000Z"
  }
}
```

#### Delete Room Category

Deletes a room category.

- **URL**: `/api/rooms/categories/:id`
- **Method**: `DELETE`
- **Response**: `200 OK`

```json
{
  "success": true
}
```

### Hotel Information Management

#### Get Room Information

Retrieves hotel room information.

- **URL**: `/api/rooms/info`
- **Method**: `GET`
- **Response**: `200 OK`

```json
{
  "contact": {
    "name": "John Smith",
    "position": "Front Desk Manager",
    "phone": "+1 234 567 8901",
    "email": "contact@hotelexample.com"
  },
  "check_in_out": {
    "check_in_time": "14:00:00",
    "check_out_time": "12:00:00",
    "early_check_in_time_frame": "10:00-14:00",
    "early_check_in_fee": 0,
    "late_check_out_time": "14:00:00",
    "late_check_out_fee": 0,
    "reception_hours": "24/7"
  },
  "room_counts": {
    "single": 10,
    "double": 15,
    "connecting": 5,
    "accessible": 3
  },
  "standard_features": [
    "Shower Toilet",
    "Bathtub Toilet",
    "Safe",
    "TV",
    "Telephone",
    "WiFi",
    "Desk",
    "Minibar"
  ],
  "payment_methods": [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "PayPal"
  ],
  "pet_policy": {
    "pets_allowed": true,
    "pet_fee": 20,
    "pet_inclusions": "Bed, bowl, treats, etc."
  }
}
```

#### Update Room Information

Updates hotel room information.

- **URL**: `/api/rooms/info`
- **Method**: `PUT`
- **Request Body** (all sections optional):

```json
{
  "contact": {
    "name": "Jane Wilson",
    "position": "Hotel Manager",
    "phone": "+1 987 654 3210",
    "email": "jane@hotelexample.com"
  },
  "check_in_out": {
    "check_in_time": "15:00",
    "check_out_time": "11:00"
  },
  "room_counts": {
    "single": 12,
    "double": 18
  },
  "standard_features": [
    "Shower Toilet",
    "Bathtub Toilet",
    "Safe",
    "TV",
    "Telephone",
    "WiFi",
    "Desk",
    "Minibar",
    "Coffee Machine"
  ],
  "payment_methods": [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "PayPal",
    "Apple Pay"
  ],
  "pet_policy": {
    "pet_fee": 25
  }
}
```

- **Response**: Returns the updated room information as in the GET endpoint.

#### Get Standard Room Features

Retrieves standard room features.

- **URL**: `/api/rooms/features`
- **Method**: `GET`
- **Response**: `200 OK`

```json
{
  "shower_toilet": true,
  "bathtub_toilet": true,
  "open_bathroom": false,
  "balcony": true,
  "safe": true,
  "air_condition": true,
  "heating": true,
  "hair_dryer": true,
  "ironing_board": true,
  "tv": true,
  "telephone": true,
  "wifi": true,
  "desk": true,
  "coffee_maker": true,
  "kettle": true,
  "minibar": true,
  "fridge": false,
  "allergy_friendly_bedding": true
}
```

#### Update Standard Room Features

Updates standard room features.

- **URL**: `/api/rooms/features`
- **Method**: `PUT`
- **Request Body** (all fields optional):

```json
{
  "shower_toilet": true,
  "bathtub_toilet": false,
  "fridge": true,
  "coffee_maker": false
}
```

- **Response**: Returns the updated room features as in the GET endpoint.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Room Types Table
```sql
CREATE TABLE room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  max_occupancy INT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Room Category Info Table
```sql
CREATE TABLE room_category_infos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  pms_name VARCHAR(50),
  num_rooms INT DEFAULT 0,
  size INT DEFAULT 0,
  bed_type VARCHAR(100),
  surcharges_upsell TEXT,
  room_features TEXT,
  second_person_surcharge DECIMAL(10, 2) DEFAULT 0,
  extra_bed_surcharge DECIMAL(10, 2) DEFAULT 0,
  baby_bed_available BOOLEAN DEFAULT FALSE,
  extra_bed_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES room_types(id) ON DELETE CASCADE
);
```

### Hotel Info Tables
```sql
CREATE TABLE hotel_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_name VARCHAR(255),
  contact_position VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  check_in_time TIME,
  check_out_time TIME,
  early_check_in_time_frame VARCHAR(50),
  early_check_in_fee DECIMAL(10, 2),
  late_check_out_time TIME,
  late_check_out_fee DECIMAL(10, 2),
  reception_hours VARCHAR(50),
  single_rooms INT,
  double_rooms INT,
  connecting_rooms INT,
  accessible_rooms INT,
  pets_allowed BOOLEAN,
  pet_fee DECIMAL(10, 2),
  pet_inclusions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE standard_room_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shower_toilet BOOLEAN DEFAULT FALSE,
  bathtub_toilet BOOLEAN DEFAULT FALSE,
  open_bathroom BOOLEAN DEFAULT FALSE,
  balcony BOOLEAN DEFAULT FALSE,
  safe BOOLEAN DEFAULT FALSE,
  air_condition BOOLEAN DEFAULT FALSE,
  heating BOOLEAN DEFAULT FALSE,
  hair_dryer BOOLEAN DEFAULT FALSE,
  ironing_board BOOLEAN DEFAULT FALSE,
  tv BOOLEAN DEFAULT FALSE,
  telephone BOOLEAN DEFAULT FALSE,
  wifi BOOLEAN DEFAULT FALSE,
  desk BOOLEAN DEFAULT FALSE,
  coffee_maker BOOLEAN DEFAULT FALSE,
  kettle BOOLEAN DEFAULT FALSE,
  minibar BOOLEAN DEFAULT FALSE,
  fridge BOOLEAN DEFAULT FALSE,
  allergy_friendly_bedding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE standard_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Hotels Table
```sql
CREATE TABLE hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  street VARCHAR(255),
  postal_code VARCHAR(20),
  city VARCHAR(100),
  phone VARCHAR(50),
  fax VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  billing_address_name VARCHAR(255),
  billing_address_street VARCHAR(255),
  billing_address_zip VARCHAR(20),
  billing_address_city VARCHAR(100),
  billing_address_vat VARCHAR(50),
  star_rating INT DEFAULT 0,
  category VARCHAR(100),
  opening_date INT,
  latest_renovation_date INT,
  total_rooms INT DEFAULT 0,
  conference_rooms INT DEFAULT 0,
  pms_system TEXT,
  no_of_parking_spaces INT DEFAULT 0,
  no_of_parking_spaces_garage INT DEFAULT 0,
  no_of_parking_spaces_electric INT DEFAULT 0,
  no_of_parking_spaces_bus INT DEFAULT 0,
  no_of_parking_spaces_outside INT DEFAULT 0,
  no_of_parking_spaces_disabled INT DEFAULT 0,
  parking_cost_per_hour DECIMAL(10, 2) DEFAULT 0,
  parking_cost_per_day DECIMAL(10, 2) DEFAULT 0,
  distance_to_airport_km INT DEFAULT 0,
  distance_to_highway_km INT DEFAULT 0,
  distance_to_fair_km INT DEFAULT 0,
  distance_to_train_station INT DEFAULT 0,
  distance_to_public_transport INT DEFAULT 0,
  opening_time_pool VARCHAR(100),
  opening_time_fitness_center VARCHAR(100),
  opening_time_spa_area VARCHAR(100),
  equipment_fitness_center TEXT,
  equipment_spa_area TEXT,
  planned_changes TEXT,
  attraction_in_the_area TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Event Main Table
```sql
CREATE TABLE event_main (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  contact_position VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);
```

### Event AV Equipment Table
```sql
CREATE TABLE event_av_equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  equipment_name VARCHAR(100) NOT NULL,
  quantity INT DEFAULT 0,
  price_per_unit DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES event_main(id) ON DELETE CASCADE
);
```

### Event Contracting Table
```sql
CREATE TABLE event_contracting (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  contracted_companies TEXT,
  refused_requests TEXT,
  unwanted_marketing_tools TEXT,
  first_second_option BOOLEAN DEFAULT FALSE,
  split_options BOOLEAN DEFAULT FALSE,
  option_hold_duration VARCHAR(100),
  overbooking_policy BOOLEAN DEFAULT FALSE,
  deposit_required BOOLEAN DEFAULT FALSE,
  accepted_payment_methods TEXT,
  commission_rules TEXT,
  second_signature_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES event_main(id) ON DELETE CASCADE
);
```

### Event Technical Table
```sql
CREATE TABLE event_technical (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  beamer_lumens VARCHAR(100),
  copy_cost DECIMAL(10, 2) DEFAULT 0,
  software_presentation TEXT,
  wifi_data_rate VARCHAR(100),
  has_ac_or_ventilation BOOLEAN DEFAULT FALSE,
  has_blackout_curtains BOOLEAN DEFAULT FALSE,
  is_soundproof BOOLEAN DEFAULT FALSE,
  has_daylight BOOLEAN DEFAULT FALSE,
  is_hybrid_meeting_possible BOOLEAN DEFAULT FALSE,
  technical_support_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES event_main(id) ON DELETE CASCADE
);
```

### Event Handling Table
```sql
CREATE TABLE event_handling (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  sold_with_rooms_only BOOLEAN DEFAULT FALSE,
  last_minute_lead_time VARCHAR(100),
  sent_over_time_material BOOLEAN DEFAULT FALSE,
  lunch_location TEXT,
  min_participants_package INT DEFAULT 0,
  coffee_break_location TEXT,
  advance_days_for_material INT DEFAULT 0,
  room_drop_cost DECIMAL(10, 2) DEFAULT 0,
  hotel_exclusive_clients BOOLEAN DEFAULT FALSE,
  minimum_spent BOOLEAN DEFAULT FALSE,
  storage_room BOOLEAN DEFAULT FALSE,
  deposit_needed_event BOOLEAN DEFAULT FALSE,
  deposit_rules_event TEXT,
  deposit_invoice_creator VARCHAR(255),
  informational_invoice_created BOOLEAN DEFAULT FALSE,
  payment_methods_events JSON,
  final_invoice_handling_event TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES event_main(id) ON DELETE CASCADE
);
``` 