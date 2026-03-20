# Booking Service

Booking orchestration microservice for EventHub.

## Responsibilities

- Validates booking requests
- Calls event-service over REST to check and reserve seats
- Calls notification-service over REST after booking creation and cancellation

## Environment

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `EVENT_SERVICE_URL`
- `NOTIFICATION_SERVICE_URL`
