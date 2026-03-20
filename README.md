# EventHub

EventHub is a MERN microservices event ticket booking platform built for a university assignment. It includes a React frontend, an Express API gateway, four backend microservices, and one MongoDB database per service.

## Architecture Summary

- `frontend`: React + Vite client for users, organizers, and admins
- `gateway`: Express API gateway that exposes simple frontend routes and proxies requests to microservices
- `services/auth-service`: registration, login, JWT identity, and user lookup
- `services/event-service`: event catalog and organizer event management
- `services/booking-service`: booking lifecycle and service-to-service orchestration
- `services/notification-service`: mock notification storage and retrieval
- MongoDB: one isolated database container per service

All backend services use CommonJS, JavaScript, REST over HTTP, JWT authentication, and their own independent MongoDB connection.

## Folder Structure

```text
EventHub/
├── docker-compose.yml
├── gateway/
├── frontend/
└── services/
    ├── auth-service/
    ├── booking-service/
    ├── event-service/
    └── notification-service/
```

## Service Ports

- Frontend: `5173`
- Gateway: `5000`
- Auth Service: `5001`
- Event Service: `5002`
- Booking Service: `5003`
- Notification Service: `5004`

## Local Setup Without Docker

1. Make sure MongoDB is running locally.
2. Copy each `.env.example` to `.env` in:
   - `gateway`
   - `frontend`
   - `services/auth-service`
   - `services/event-service`
   - `services/booking-service`
   - `services/notification-service`
3. Install dependencies and start services in this order:
   - `services/auth-service`
   - `services/event-service`
   - `services/booking-service`
   - `services/notification-service`
   - `gateway`
   - `frontend`

## Docker Compose Setup

1. Make sure Docker Desktop is running.
2. From the project root run:

```powershell
docker compose up --build
```

3. Open `http://localhost:5173`.

## Test Flow

1. Register a customer account and an organizer account.
2. Log in as organizer and create a published event.
3. Log in as customer and browse the event list.
4. Open event details and create a booking.
5. Confirm the booking appears under My Bookings.
6. Confirm a notification appears under My Notifications.
7. Cancel the booking and verify seats are released and a cancellation notification is stored.

## Notes

- Swagger docs are exposed per service at `/api-docs`.
- The gateway exposes simplified frontend routes:
  - `/auth/*`
  - `/events/*`
  - `/bookings/*`
  - `/notifications/*`

"# EventHub---CTSE-Assignment" 
