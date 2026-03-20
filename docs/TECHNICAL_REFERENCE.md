# Technical Reference

This document is a detailed technical guide for the full EventHub system.

## Architecture Overview

### Frontend

- React + Vite
- role-based UI for customer, organizer, and admin
- calls the API gateway only

### Gateway

- Express-based API gateway
- proxies frontend requests to backend services
- main public backend entry point

### Auth Service

Responsibilities:
- register users
- login users
- JWT generation
- current user endpoint
- user lookup endpoints for internal service usage

### Event Service

Responsibilities:
- event CRUD
- organizer/admin event management
- publish/draft control
- reserve/release seat endpoints

### Booking Service

Responsibilities:
- create booking requests
- reserve seats with event-service
- maintain booking state
- approval queue for organizer/admin
- managed booking visibility for organizer/admin
- booking cancellation

Booking statuses:
- `pending`
- `confirmed`
- `rejected`
- `cancelled`

### Notification Service

Responsibilities:
- store in-app notifications
- return notifications by user
- mark notifications as read
- store customer, organizer, and admin booking alerts

## Current Business Flow

### Customer Booking Request

1. Customer selects event.
2. Frontend sends request through gateway.
3. `booking-service` checks event details from `event-service`.
4. Seats are reserved.
5. Booking is stored as `pending`.
6. Notifications are created for:
   - customer
   - organizer of that event
   - all admins

### Approval Flow

1. Organizer or admin opens approval queue.
2. Pending bookings are listed.
3. Organizer/admin confirms or rejects.
4. Customer gets final notification.
5. On reject, seats are released.

### Cancellation Flow

1. Customer cancels booking.
2. Booking status becomes `cancelled`.
3. Seats are released.
4. Notifications are created for:
   - customer
   - organizer of that event
   - all admins

## Important API Relationships

### Frontend -> Gateway

Frontend does not directly call services. It uses:
- `/auth/*`
- `/events/*`
- `/bookings/*`
- `/notifications/*`

### Gateway -> Services

Gateway proxies requests to:
- auth-service
- event-service
- booking-service
- notification-service

### Service-to-Service Calls

- `booking-service` -> `event-service`
- `booking-service` -> `notification-service`
- `booking-service` -> `auth-service`

## Databases

Each service has its own MongoDB database.

Suggested logical split:
- auth DB
- event DB
- booking DB
- notification DB

This keeps microservices independently deployable and aligned with assignment expectations.

## Security Measures Implemented

### Application Security

- JWT authentication
- role-based access control
- protected routes
- validation using request validators
- service-level authorization checks

### DevSecOps

- SonarCloud static analysis
- GitHub Actions workflow integration

### Cloud Security Story

- Azure Container Apps used for deployment
- gateway exposed publicly
- internal service URLs used for service-to-service communication
- environment-based configuration
- least-privilege explanation can be tied to service roles and cloud deployment scope

## DevOps Practices Implemented

- Git-based public repository
- Docker containerization
- GitHub Actions CI
- GHCR image publishing
- SonarCloud scanning
- Azure deployment using container images

## CI / CD Reality

### Completed

- CI is working
- image publish is working
- SonarCloud is working

### Important note

A prepared Azure deployment workflow was removed because Azure tenant permission limitations prevented reliable service principal authentication. Manual Azure CLI deployment/update is used instead.

This should be explained honestly in viva if asked about full automated CD.

## Local Run Notes

### Docker

Use Docker service names in env/config:
- `http://auth-service:5001`
- `http://event-service:5002`
- `http://booking-service:5003`
- `http://notification-service:5004`

### Azure

Use Azure internal service URLs in env/config.

Example pattern:
- `https://auth-service.internal.<environment>.azurecontainerapps.io`

## What To Test Before Final Demo

1. Register/login as customer.
2. Register/login as organizer.
3. Create and publish an event.
4. Create booking request as customer.
5. Check organizer approval queue.
6. Check organizer and admin notifications.
7. Confirm or reject booking.
8. Check customer notification.
9. Cancel a booking.
10. Mark notification as read.
