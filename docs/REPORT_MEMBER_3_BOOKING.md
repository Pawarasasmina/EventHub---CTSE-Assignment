# Member 3 Report - Booking Service

## Module Information

- Module: Current Trends in Software Engineering (SE4010)
- Assignment: Cloud Computing Assignment
- Semester: 2026 Semester 1
- Institution: SLIIT, Faculty of Computing

## Student Information

- Member: `Member 3`
- Assigned Microservice: `booking-service`

## Project Title

EventHub: A Secure Microservice-Based Event Booking Platform with DevOps, DevSecOps, and Cloud Deployment

## 1. Introduction

EventHub is a microservice-based event booking platform built for the SE4010 Cloud Computing assignment. The overall system was divided into four independently deployable backend microservices, each assigned to one member of the group. My assigned component was the `booking-service`, which acts as the operational core of the platform.

The `booking-service` handles booking creation, approval workflows, status updates, cancellation logic, and cross-service orchestration.

## 2. Shared Architecture Overview

The EventHub platform contains:

- Frontend: React + Vite client
- API Gateway: Express-based routing layer
- `auth-service`
- `event-service`
- `booking-service`
- `notification-service`
- one MongoDB database per microservice
- GitHub Actions for automation
- GHCR for image publishing
- SonarCloud for SAST scanning
- Azure Container Apps for deployment

The `booking-service` is one of the most integration-heavy services because it communicates with several other microservices to complete a single business workflow.

## 3. Description and Rationale of My Microservice

My assigned microservice is `booking-service`.

### 3.1 Main Responsibilities

The `booking-service` is responsible for:

- creating booking requests
- supporting booking lifecycle states
- handling pending, confirmed, rejected, and cancelled statuses
- coordinating seat reservation and release
- triggering booking-related notifications
- exposing organizer/admin booking management views

### 3.2 Why This Service Is Important

This service is the main orchestration point in the system. It transforms a simple booking action into a coordinated multi-service business workflow. Because of that, it is the strongest example of inter-service collaboration in the platform.

### 3.3 Example Endpoints

Important endpoints include:

- `POST /api/bookings`
- `GET /api/bookings/my`
- `PATCH /api/bookings/:id/confirm`
- `PATCH /api/bookings/:id/reject`
- `PATCH /api/bookings/:id/cancel`
- `GET /api/bookings/manage`

## 4. Role of Booking Service in the Overall System

The `booking-service` is the transaction-oriented heart of EventHub. It takes actions initiated by users and translates them into coordinated system behavior involving seat reservation, approval, role-based notifications, and operational visibility for organizers and admins.

Without this service, the platform would only be able to display events, but not complete real event booking operations.

## 5. Inter-Service Communication

The `booking-service` clearly satisfies the assignment requirement for working integration with other group members’ services.

### 5.1 Integration with Event Service

When a customer submits a booking request, `booking-service` contacts `event-service` to:

- validate the selected event
- reserve seats

When a booking is rejected or cancelled, it contacts `event-service` again to release seats.

### 5.2 Integration with Notification Service

After booking state changes, `booking-service` sends role-specific notifications through `notification-service`. These notifications include:

- pending customer booking notifications
- organizer booking request alerts
- admin global booking alerts
- confirmation notifications
- rejection notifications
- cancellation notifications

### 5.3 Integration with Auth Service

The `booking-service` also contacts `auth-service` for internal trusted user lookup, especially to identify admin recipients for global booking-related alerts.

### 5.4 Example End-to-End Flow

A complete working flow is:

1. Customer requests a booking from the frontend.
2. Gateway forwards the request to `booking-service`.
3. `booking-service` checks the event through `event-service`.
4. `booking-service` reserves seats through `event-service`.
5. `booking-service` stores the booking as `pending`.
6. `booking-service` sends a customer notification through `notification-service`.
7. `booking-service` gets admin users through `auth-service`.
8. `booking-service` sends organizer/admin notifications through `notification-service`.
9. Organizer or admin later confirms or rejects the booking.

This is a strong demonstration of multi-service interaction.

## 6. DevOps Practices Implemented

### 6.1 Version Control

The service code was maintained in a public GitHub repository as part of the overall EventHub project.

### 6.2 Continuous Integration

GitHub Actions was used for CI checks including backend syntax validation and frontend build verification.

### 6.3 Containerization and Registry Publishing

The `booking-service` was containerized with Docker and published to GitHub Container Registry as a reusable deployable image.

### 6.4 Cloud Deployment

The service was deployed to Azure Container Apps as an internal service. It communicates with other services using internal networking and configured environment variables.

## 7. Security Measures Implemented

### 7.1 JWT-Protected Booking Operations

Booking operations depend on authenticated users. JWT-based authentication helps protect booking actions.

### 7.2 Role-Based Access Control

The service applies role-aware logic to determine which users can create bookings, approve bookings, reject bookings, or access platform-wide management views.

### 7.3 Trusted Internal Communication

A service-to-service secret was used to support trusted internal calls where needed.

### 7.4 Secure Runtime Configuration

Database URIs, JWT secrets, and internal service settings are configured through environment variables.

### 7.5 DevSecOps Scanning

SonarCloud was integrated to improve code quality and support secure development practices.

## 8. Challenges Faced and How They Were Addressed

### 8.1 Complex Inter-Service Workflow Design

The biggest challenge was designing booking logic that remained clear while also coordinating with multiple services. This was addressed by separating responsibilities and keeping the workflow service-driven.

### 8.2 Partial Success Errors

At one point, bookings were saved successfully but frontend errors still appeared because notification steps failed after the booking write. This was diagnosed through service logs and corrected by fixing downstream notification requests and internal URLs.

### 8.3 Azure Internal URL Handling

Internal Azure FQDNs had to be configured correctly for `event-service`, `auth-service`, and `notification-service`. This was solved using correct environment configuration in Azure Container Apps.

## 9. Demonstration Summary

The `booking-service` can be demonstrated through:

- customer booking request creation
- organizer/admin approval flow
- organizer/admin managed booking view
- customer cancellation
- event seat updates
- notifications triggered across multiple user roles

This makes it the strongest demonstration candidate for inter-service communication.

## 10. Conclusion

The `booking-service` successfully fulfills its role as the operational core of the EventHub platform. It demonstrates real orchestration between multiple microservices, supports meaningful end-to-end workflows, and strongly satisfies the assignment requirement for microservice integration, DevOps readiness, and secure cloud deployment.
