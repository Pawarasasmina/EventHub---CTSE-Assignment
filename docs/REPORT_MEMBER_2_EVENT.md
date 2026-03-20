# Member 2 Report - Event Service

## Module Information

- Module: Current Trends in Software Engineering (SE4010)
- Assignment: Cloud Computing Assignment
- Semester: 2026 Semester 1
- Institution: SLIIT, Faculty of Computing

## Student Information

- Member: `Member 2`
- Assigned Microservice: `event-service`

## Project Title

EventHub: A Secure Microservice-Based Event Booking Platform with DevOps, DevSecOps, and Cloud Deployment

## 1. Introduction

EventHub is a microservice-based event booking platform developed for the SE4010 Cloud Computing assignment. The system was divided into four independently deployable backend microservices, each assigned to one group member. My assigned component was the `event-service`, which is responsible for managing event information and seat availability.

The complete application supports customers, organizers, and admins through a connected set of services for authentication, event handling, booking operations, and notifications.

## 2. Shared Architecture Overview

The EventHub platform contains the following major components:

- Frontend: React + Vite interface
- API Gateway: single entry point for frontend requests
- `auth-service`
- `event-service`
- `booking-service`
- `notification-service`
- separate MongoDB database per microservice
- GitHub Actions
- GitHub Container Registry
- SonarCloud
- Azure Container Apps

The `event-service` is a core business service because it stores and manages the event inventory of the platform.

A shared architecture diagram should be inserted in the final report showing the above components and all communication paths.

## 3. Description and Rationale of My Microservice

My assigned microservice is `event-service`.

### 3.1 Main Responsibilities

The `event-service` is responsible for:

- creating events
- updating event details
- publishing events
- exposing event information to other services and the gateway
- managing seat reservation and release logic

### 3.2 Why This Service Is Important

This service is the system’s source of truth for event data. Without it, the platform would have no reliable way to list events, track capacity, or coordinate booking-related seat management.

### 3.3 Example Endpoints

Important endpoints include:

- `POST /api/events`
- `GET /api/events`
- `GET /api/events/:id`
- `PATCH /api/events/:id/publish`
- `PATCH /api/events/:id/reserve`
- `PATCH /api/events/:id/release`

These endpoints support both user-facing event management and internal system workflows.

## 4. Role of Event Service in the Overall System

The `event-service` enables organizers to create and manage event content while also supporting booking workflows by tracking seat availability. It acts as a domain service that both the gateway and `booking-service` depend on.

This makes it essential for both the public event discovery experience and the internal operational correctness of bookings.

## 5. Inter-Service Communication

The `event-service` clearly demonstrates inter-service communication, which is required by the assignment.

### 5.1 Integration with Booking Service

The strongest integration point is with `booking-service`.

When a customer requests a booking, `booking-service` communicates with `event-service` to:

- validate the event
- check seat availability
- reserve seats

Later, if a booking is rejected or cancelled, `booking-service` communicates with `event-service` again to release seats.

This is a direct service-to-service dependency and a strong example of a microservice integration.

### 5.2 Example Integration Flow

A working example is:

1. A customer selects an event from the frontend.
2. The gateway forwards the request to `booking-service`.
3. `booking-service` contacts `event-service` to fetch and validate the event.
4. `booking-service` requests seat reservation from `event-service`.
5. The event seat count is updated.
6. If the booking is later cancelled or rejected, `booking-service` calls `event-service` again to release seats.

This proves that `event-service` is actively used by another microservice during a real business workflow.

## 6. DevOps Practices Implemented

### 6.1 Version Control

All code was maintained in a public GitHub repository with full version history.

### 6.2 Continuous Integration

GitHub Actions was used to run backend syntax validation and frontend build checks on pushes and pull requests.

### 6.3 Containerization and Image Publishing

The `event-service` was containerized with Docker. Its image was built and published to GitHub Container Registry.

### 6.4 Deployment

The service was deployed to Azure Container Apps as an internal containerized microservice. This allowed it to communicate with the rest of the system without being unnecessarily exposed to the internet.

## 7. Security Measures Implemented

### 7.1 Role-Aware Event Management

Only authorized roles such as organizers and admins are allowed to create or manage events.

### 7.2 Secure Configuration

Runtime configuration such as database connection values and secrets are handled through environment variables.

### 7.3 Service Isolation

The `event-service` uses its own dedicated MongoDB database, which reduces cross-service dependency and helps preserve separation of responsibilities.

### 7.4 DevSecOps

SonarCloud was used to scan the repository for quality and security-related issues as part of the development workflow.

## 8. Challenges Faced and How They Were Addressed

### 8.1 Seat Management Coordination

One of the main design challenges was making sure seat changes stayed synchronized with booking state changes. This was addressed by clearly defining REST interactions between `booking-service` and `event-service`.

### 8.2 Cloud Service Communication

Another challenge was ensuring internal service calls worked correctly in Azure Container Apps. This was solved by using the correct internal service URLs in environment configuration.

### 8.3 Deployment Practicality

Although CI and image publishing were automated, full automated deployment to Azure was limited in the university tenant, so the final active deployment used Azure CLI update commands.

## 9. Demonstration Summary

During the demonstration, the `event-service` can be shown through:

- event creation and publication
- event listing
- seat reservation during a booking request
- seat release during booking rejection or cancellation

This provides a direct working example of inter-service communication with `booking-service`.

## 10. Conclusion

The `event-service` successfully fulfills its role as the event management and seat tracking component of the EventHub platform. It provides important business functionality for organizers and supports essential integration with `booking-service`, making it a valid and practical microservice for the assignment.
