# Member 1 Report - Auth Service

## Module Information

- Module: Current Trends in Software Engineering (SE4010)
- Assignment: Cloud Computing Assignment
- Semester: 2026 Semester 1
- Institution: SLIIT, Faculty of Computing

## Student Information

- Member: `Member 1`
- Assigned Microservice: `auth-service`

## Project Title

EventHub: A Secure Microservice-Based Event Booking Platform with DevOps, DevSecOps, and Cloud Deployment

## 1. Introduction

EventHub is a microservice-based event booking platform designed for the SE4010 Cloud Computing assignment. The overall system was divided into four independently deployable backend microservices, each assigned to one group member. My assigned component was the `auth-service`, which is responsible for identity, authentication, and protected access across the platform.

The complete system includes user authentication, event management, booking workflows, and notification delivery. It was implemented using Node.js, Express, MongoDB, Docker, GitHub Actions, SonarCloud, GitHub Container Registry, and Azure Container Apps.

## 2. Shared Architecture Overview

The EventHub system contains these main components:

- Frontend: React + Vite web application
- API Gateway: single entry point for frontend requests
- `auth-service`: registration, login, JWT, and user lookup
- `event-service`: event creation, publishing, and seat handling
- `booking-service`: booking workflow and approvals
- `notification-service`: user, organizer, and admin notifications
- Separate MongoDB database per microservice
- GitHub Actions for CI automation
- GitHub Container Registry for image storage
- SonarCloud for static analysis
- Azure Container Apps for cloud deployment

The frontend communicates with the gateway, and the gateway routes requests to the appropriate backend microservice. Some services also communicate directly with one another over REST for internal workflows.

A shared architecture diagram should be inserted into the final report to show:

- frontend
- gateway
- all four microservices
- MongoDB databases
- Azure Container Apps deployment
- GitHub Actions
- GHCR
- SonarCloud
- service communication paths

## 3. Description and Rationale of My Microservice

My assigned microservice is `auth-service`.

### 3.1 Main Responsibilities

The `auth-service` is responsible for:

- user registration
- user login
- JWT generation
- returning authenticated user profile information
- supporting internal user lookup functions for trusted backend workflows

### 3.2 Why This Service Is Important

This service provides the security foundation of the platform. Without it, users could not securely log in, roles could not be enforced, and the rest of the services would not be able to trust user identity. It centralizes authentication logic instead of duplicating it across the application.

### 3.3 Example Endpoints

Key endpoints include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/auth/users`

These endpoints allow the system to manage users and support internal platform workflows.

## 4. Role of Auth Service in the Overall System

The `auth-service` supports the entire EventHub platform by providing identity management for customers, organizers, and admins. It works together with the gateway and the other microservices to ensure that protected operations can only be performed by authorized users.

This service also supports role-based access control in the wider platform. Roles such as `customer`, `organizer`, and `admin` are critical because other services depend on these roles when allowing actions such as creating events, approving bookings, and seeing platform-wide alerts.

## 5. Inter-Service Communication

One of the assignment requirements is that each microservice must demonstrate at least one working integration point with another group member’s service. The `auth-service` clearly satisfies this requirement.

### 5.1 Integration with Booking Service

The strongest direct integration for `auth-service` is with `booking-service`.

When a booking-related workflow needs to notify all administrator users, `booking-service` performs a trusted internal call to `auth-service` to retrieve users with the `admin` role. This allows the system to send platform-wide alerts without hardcoding administrator information inside the booking logic.

This is a real service-to-service communication path, not only a frontend interaction.

### 5.2 Integration Through Gateway

The `auth-service` is also connected to the API gateway. The frontend does not call the microservice directly. Instead, authentication requests move through the gateway, which forwards them to `auth-service`.

This demonstrates how the authentication component fits into the broader microservice architecture.

### 5.3 Example Integration Flow

A working example is:

1. A customer submits a booking request.
2. `booking-service` processes the request.
3. `booking-service` needs to notify all admin users.
4. `booking-service` sends an internal trusted request to `auth-service`.
5. `auth-service` returns the relevant admin user list.
6. `booking-service` forwards notifications to `notification-service`.

This proves that `auth-service` actively participates in cross-service behavior.

## 6. DevOps Practices Implemented

### 6.1 Version Control

The source code was maintained in a public GitHub repository. This provided collaboration support, version history, and transparent access to code changes.

### 6.2 Continuous Integration

GitHub Actions was used to implement CI. These workflows automatically ran syntax checks and frontend build validation whenever code was pushed.

This helped detect errors early and improved code reliability.

### 6.3 Containerization and Image Publishing

The `auth-service` was containerized using Docker. Its image was published to GitHub Container Registry (`ghcr.io`) using a GitHub Actions workflow.

This supported reproducible cloud deployment using registry-hosted images.

### 6.4 Deployment

The service was deployed to Azure Container Apps as an independently running backend container. It was configured as an internal service, meaning it was not directly exposed to the internet. Instead, it was accessed through the gateway and internal service-to-service calls.

## 7. Security Measures Implemented

### 7.1 JWT-Based Authentication

After successful login, the service generates JWT tokens. These tokens are later used by protected routes in the wider system to verify user identity.

### 7.2 Role-Based Access Support

The service stores and exposes role information such as `customer`, `organizer`, and `admin`. These roles are used across the platform to enforce authorization.

### 7.3 Internal Trusted Calls

Some internal functionality, such as role-based admin lookup for booking workflows, is protected using a service-to-service secret. This prevents unauthorized public use of internal utility endpoints.

### 7.4 Secure Configuration

Sensitive configuration such as MongoDB connection values and JWT secrets were provided through environment variables.

### 7.5 DevSecOps

SonarCloud was integrated into the repository as a static analysis tool. This supported secure coding practices and improved code quality during development.

## 8. Challenges Faced and How They Were Addressed

### 8.1 Internal Service Authorization

One challenge was enabling internal backend access without exposing sensitive utility behavior publicly. This was handled by adding a service-to-service secret for trusted internal calls.

### 8.2 Cloud Configuration Consistency

Another challenge was ensuring that the cloud-deployed version had the correct environment variables and internal URLs. This was handled by updating Azure Container Apps configuration during deployment.

### 8.3 CI/CD Limitation in University Azure Tenant

Although CI and container publishing were automated successfully, full GitHub-to-Azure CD was limited by university tenant permissions. Because of this, deployment was completed manually using Azure CLI while still keeping the automated pipeline structure in place.

## 9. Demonstration Summary

During the demonstration, the `auth-service` can be shown through:

- user registration
- user login
- JWT-based protected access
- role-aware behavior across the system
- integration with `booking-service` for admin recipient lookup

This demonstrates that the service is both functional and meaningfully integrated with another group member’s microservice.

## 10. Conclusion

The `auth-service` successfully fulfills its role as the identity and access control component of the EventHub platform. It supports secure authentication, role-aware behavior, internal integration with booking workflows, and cloud-ready deployment. It also contributes directly to the security and microservice integration requirements of the assignment.
