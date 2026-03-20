# Member 4 Report - Notification Service

## Module Information

- Module: Current Trends in Software Engineering (SE4010)
- Assignment: Cloud Computing Assignment
- Semester: 2026 Semester 1
- Institution: SLIIT, Faculty of Computing

## Student Information

- Member: `Member 4`
- Assigned Microservice: `notification-service`

## Project Title

EventHub: A Secure Microservice-Based Event Booking Platform with DevOps, DevSecOps, and Cloud Deployment

## 1. Introduction

EventHub is a microservice-based event booking platform designed for the SE4010 Cloud Computing assignment. The overall system was implemented as four independently deployable backend microservices. My assigned component was the `notification-service`, which is responsible for alert generation and in-app notification delivery.

This service supports different user roles by providing role-specific notifications related to booking requests, confirmations, rejections, cancellations, and platform-wide activity.

## 2. Shared Architecture Overview

The EventHub system includes:

- Frontend: React + Vite user interface
- API Gateway: gateway layer for frontend requests
- `auth-service`
- `event-service`
- `booking-service`
- `notification-service`
- separate MongoDB database per microservice
- GitHub Actions
- GHCR
- SonarCloud
- Azure Container Apps

The `notification-service` is tightly connected to booking workflows because it receives and stores booking-related alerts.

## 3. Description and Rationale of My Microservice

My assigned microservice is `notification-service`.

### 3.1 Main Responsibilities

The `notification-service` is responsible for:

- receiving notification requests from trusted services
- storing notifications in MongoDB
- serving notifications to end users
- supporting customer, organizer, and admin alerts
- supporting mark-as-read functionality

### 3.2 Why This Service Is Important

This service improves usability and makes the system operationally meaningful. Without it, users would not receive clear feedback about booking requests, approvals, rejections, cancellations, or operational updates.

### 3.3 Example Endpoints

Important endpoints include:

- `POST /api/notifications/send`
- `GET /api/notifications/user/:userId`
- `PATCH /api/notifications/:id/read`

## 4. Role of Notification Service in the Overall System

The `notification-service` connects business events to user awareness. It is responsible for ensuring that important booking events become visible to the correct users.

Examples include:

- customer sees pending booking notification
- organizer sees booking request notification for their own event
- admin sees global platform booking notifications
- users can mark alerts as read

This makes the platform easier to use and demonstrates clearer role-based behavior.

## 5. Inter-Service Communication

The `notification-service` satisfies the assignment’s inter-service communication requirement clearly.

### 5.1 Integration with Booking Service

Its strongest integration is with `booking-service`.

The `booking-service` triggers notification creation after important booking actions such as:

- booking request created
- booking confirmed
- booking rejected
- booking cancelled

### 5.2 Role-Specific Notification Behavior

The integration supports different outputs depending on the user role:

- customer receives personal booking result notifications
- organizer receives event-specific booking activity for their own events
- admin receives system-wide booking activity across all events

### 5.3 Example Integration Flow

A working example is:

1. Customer creates a booking request.
2. `booking-service` stores the booking.
3. `booking-service` calls `notification-service` to create a customer notification.
4. `booking-service` calls `notification-service` again for organizer and admin alerts.
5. Users later retrieve those alerts through the gateway and frontend.
6. Users can mark notifications as read.

This demonstrates real cross-service communication in a business workflow.

## 6. DevOps Practices Implemented

### 6.1 Version Control

The microservice code was maintained in the shared public GitHub repository.

### 6.2 Continuous Integration

GitHub Actions workflows were used to run project-level validation on code changes.

### 6.3 Containerization and Image Publishing

The `notification-service` was containerized with Docker and published to GitHub Container Registry.

### 6.4 Deployment

The service was deployed to Azure Container Apps as an internal microservice and connected to the rest of the platform through internal cloud networking.

## 7. Security Measures Implemented

### 7.1 Trusted Internal Notification Triggering

Notification creation endpoints are intended for trusted usage within the system, especially from `booking-service`.

### 7.2 Secure Configuration

Environment variables were used for runtime configuration such as database access and internal secrets.

### 7.3 Role-Aware Visibility

Although notifications are created internally, they are later shown to the correct users only, based on identity and access context handled through the overall system.

### 7.4 DevSecOps

SonarCloud scanning was part of the repository workflow to support secure and maintainable code quality.

## 8. Challenges Faced and How They Were Addressed

### 8.1 Notification Validation and Request Shape

During development, notification creation initially failed in some flows because request handling and downstream service URLs were not correctly aligned. This was fixed by correcting the service communication path and request method behavior.

### 8.2 Azure Internal Communication

Another challenge was ensuring that internal Azure service communication used the correct internal FQDN values. This was resolved by updating the deployment configuration.

### 8.3 Supporting Multiple User Roles

Designing notifications for customers, organizers, and admins required more than a simple generic notification model. The solution was to support role-aware alert creation and read-state management.

## 9. Demonstration Summary

The `notification-service` can be demonstrated through:

- booking request notification creation
- organizer alerts for owned events
- admin platform-wide alerts
- customer confirmation/rejection/cancellation notifications
- mark-as-read functionality

This demonstrates both service usefulness and service integration.

## 10. Conclusion

The `notification-service` successfully fulfills its purpose as the alerting and user feedback component of the EventHub platform. It integrates directly with `booking-service`, supports multiple user roles, and contributes strongly to the system’s usability, security, and microservice collaboration goals.
