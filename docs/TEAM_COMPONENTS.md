# Team Component Mapping

This document is for viva preparation and team ownership mapping.

## Shared Group System

The shared system is `EventHub`, built from these main pieces:

- `auth-service`
- `event-service`
- `booking-service`
- `notification-service`
- `gateway`
- `frontend`
- Docker Compose
- GitHub Actions CI
- SonarCloud
- GHCR image publishing
- Azure Container Apps deployment

## Member Ownership Suggestion

### Member 1 - Auth Service

Owned microservice:
- `auth-service`

Main responsibilities:
- register users
- login users
- issue JWT tokens
- return current user details
- provide user lookup for internal service use

Integration point to show:
- `booking-service` calls `auth-service` to fetch admin users for admin booking notifications

Good viva points:
- JWT authentication
- roles: `customer`, `organizer`, `admin`
- secure route protection

### Member 2 - Event Service

Owned microservice:
- `event-service`

Main responsibilities:
- create and update events
- publish/draft event listings
- store venue, date, category, seat count, price
- reserve and release seats

Integration point to show:
- `booking-service` calls `event-service` to reserve seats during booking requests and release seats during rejection/cancellation

Good viva points:
- seat management logic
- organizer ownership of events
- event publishing workflow

### Member 3 - Booking Service

Owned microservice:
- `booking-service`

Main responsibilities:
- create booking requests
- manage approval queue
- confirm or reject bookings
- cancel bookings
- provide booking management views for organizer/admin

Integration points to show:
- `booking-service` -> `event-service`
- `booking-service` -> `notification-service`
- `booking-service` -> `auth-service`

Good viva points:
- pending -> confirmed/rejected workflow
- organizer/admin oversight
- most integration-heavy service in the platform

### Member 4 - Notification Service

Owned microservice:
- `notification-service`

Main responsibilities:
- store in-app notifications
- return notifications for customer, organizer, and admin
- support mark-as-read
- support system-generated booking alerts

Integration point to show:
- `booking-service` sends booking-related notifications to `notification-service`

Good viva points:
- different alert targets by role
- organizer alerts for own events
- admin alerts for all events
- read state support

## Integration Summary By Service

- `auth-service` <-> `booking-service`
- `event-service` <-> `booking-service`
- `booking-service` <-> `event-service`, `notification-service`, `auth-service`
- `notification-service` <-> `booking-service`

## What Each Member Can Say In The Demo

### Member 1
- explain login/register
- explain JWT and roles
- show how another service depends on auth data

### Member 2
- explain event creation and publishing
- explain seat reservation/release endpoints
- show booking integration

### Member 3
- explain the booking request lifecycle
- show pending approval, confirm, reject, cancel
- show managed bookings section

### Member 4
- explain customer/organizer/admin notifications
- show mark-as-read
- show notification updates after booking actions

## Suggested 10-Minute Demo Ownership Flow

1. Show architecture diagram.
2. Member 1 explains auth-service.
3. Member 2 explains event-service.
4. Member 3 performs booking request and approval workflow.
5. Member 4 shows notifications for customer, organizer, and admin.
6. Show CI, SonarCloud, GHCR, and Azure deployment briefly.
