# Hotel API

This is a standalone REST API for the Hotel Data Hub application. It provides endpoints for managing hotel and room data.

## Features

- CRUD operations for hotels
- CRUD operations for rooms
- Room standard features management
- RESTful API design
- TypeScript for type safety
- MySQL database integration

## Prerequisites

- Node.js (v16+)
- MySQL database server
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_data_hub
PORT=3001
CORS_ORIGIN=http://localhost:8080
```

4. Set up your MySQL database:
```sql
CREATE DATABASE hotel_data_hub;

USE hotel_data_hub;

CREATE TABLE hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL,
  postal_code VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  stars INT NOT NULL,
  director_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  check_in_from VARCHAR(50),
  check_out_until VARCHAR(50),
  pets_allowed BOOLEAN DEFAULT FALSE,
  hotel_chain VARCHAR(100),
  hotel_brand VARCHAR(100),
  spa BOOLEAN DEFAULT FALSE,
  pool BOOLEAN DEFAULT FALSE,
  kids_club BOOLEAN DEFAULT FALSE,
  kids_pool BOOLEAN DEFAULT FALSE,
  gym BOOLEAN DEFAULT FALSE,
  beach_nearby BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (name, street, city, country)
);

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  room_type VARCHAR(100) NOT NULL,
  size_sqm DECIMAL(10,2) NOT NULL,
  max_persons INT NOT NULL,
  bed_type VARCHAR(100) NOT NULL,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  base_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  breakfast_included BOOLEAN DEFAULT FALSE,
  room_quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  UNIQUE KEY (hotel_id, room_type)
);

CREATE TABLE room_standard_features (
  room_id INT PRIMARY KEY,
  has_tv BOOLEAN DEFAULT FALSE,
  has_minibar BOOLEAN DEFAULT FALSE,
  has_safe BOOLEAN DEFAULT FALSE,
  has_hairdryer BOOLEAN DEFAULT FALSE,
  has_air_conditioning BOOLEAN DEFAULT FALSE,
  has_workspace BOOLEAN DEFAULT FALSE,
  has_bath BOOLEAN DEFAULT FALSE,
  has_shower BOOLEAN DEFAULT FALSE,
  has_wifi BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
```

5. Build the project:
```bash
npm run build
```

## Running the API

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm run build
npm start
```

## API Endpoints

### Hotels

- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get a specific hotel
- `POST /api/hotels` - Create/update a hotel
- `DELETE /api/hotels/:id` - Delete a hotel

### Rooms

- `GET /api/hotels/:hotelId/rooms` - Get all rooms for a hotel
- `GET /api/rooms/:id` - Get a specific room
- `POST /api/rooms` - Create/update a room

### Room Standard Features

- `GET /api/rooms/:roomId/features` - Get features for a room
- `POST /api/rooms/features` - Create/update room features

## Connecting to the Frontend

To connect the frontend to this API, update the frontend's `.env` file or proxy configuration to point to this API's URL:

```
VITE_API_URL=http://your-api-host:3001/api
```

## Deployment

This API can be deployed to any server that supports Node.js:

1. Clone the repository on your server
2. Install dependencies: `npm install --production`
3. Build the project: `npm run build`
4. Set up environment variables for production
5. Start the server: `npm start`

For production deployments, consider using a process manager like PM2:
```bash
npm install -g pm2
pm2 start npm --name "hotel-api" -- start
```

## License

This project is licensed under the ISC License. 