# EventHub Cloud Computing Assignment Report

## Module Information

- Module: Current Trends in Software Engineering (SE4010)
- Assignment: Cloud Computing Assignment
- Semester: 2026 Semester 1
- Institution: SLIIT, Faculty of Computing

## Group Information

- Member 1: `<Replace with Name>`
- Member 2: `<Replace with Name>`
- Member 3: `<Replace with Name>`
- Member 4: `<Replace with Name>`

## Project Title

EventHub: A Secure Microservice-Based Event Booking Platform with DevOps, DevSecOps, and Cloud Deployment

## 1. Introduction

EventHub is a cloud-based event booking platform designed as a microservice architecture for the SE4010 Cloud Computing assignment. The project was built as a single cohesive application divided into four independently deployable backend microservices, with one major service assigned to each group member. The overall system supports user authentication, event management, booking workflows, and notification delivery.

The main goal of the project was to demonstrate fundamental cloud computing and DevOps practices by designing, containerizing, securing, integrating, and deploying a microservice-based system on a public cloud platform. In addition to the core software functionality, the project also emphasizes CI, container registry usage, static security scanning, and secure service-to-service communication.

The system was implemented using JavaScript and Node.js for backend services, React for the frontend, MongoDB for persistence, Docker for containerization, GitHub Actions for automation, SonarCloud for DevSecOps scanning, GitHub Container Registry for image hosting, and Azure Container Apps for cloud deployment.

## 2. Project Overview

The EventHub platform allows three user roles to interact with the system:

- Customers can register, log in, browse available events, request bookings, cancel bookings, and view notifications.
- Organizers can create and publish events, review booking requests related to their own events, and manage operational event activity.
- Admins can observe and manage platform-wide booking activity, view all relevant booking notifications, and monitor the system at a broader level.

To support these use cases, the application was separated into four microservices:

- `auth-service`
- `event-service`
- `booking-service`
- `notification-service`

A separate API gateway was used to simplify frontend-to-backend communication, while the frontend acted as the user-facing client application. Each microservice uses its own isolated MongoDB database to preserve loose coupling and independent deployment.

## 3. Shared Architecture

The architecture follows a microservice-based design where each business capability is separated into an individual service. The frontend communicates only with the API gateway. The gateway forwards requests to the correct backend microservice. Some services also communicate with each other directly over REST when a workflow requires cross-service coordination.

### 3.1 Main Components

- Frontend: React + Vite web application
- API Gateway: Express-based entry point for the frontend
- Auth Service: registration, login, JWT handling, user lookup
- Event Service: event creation, publication, seat management
- Booking Service: booking requests, approval flow, booking state changes
- Notification Service: in-app alerts for customers, organizers, and admins
- MongoDB: one separate database per microservice
- GitHub Actions: CI automation and image publishing
- GitHub Container Registry (GHCR): container image hosting
- SonarCloud: static analysis and DevSecOps scanning
- Azure Container Apps: managed cloud deployment platform

### 3.2 Shared Architecture Diagram

The report should include one shared architecture diagram created by the group. The diagram should show:

- Frontend connected to the API gateway
- Gateway connected to all four microservices
- Booking service connected to event service, auth service, and notification service
- Separate MongoDB database per microservice
- GitHub Actions pipeline
- GHCR image registry
- SonarCloud scan integration
- Azure Container Apps as the cloud hosting layer

### 3.3 Communication Flow Summary

The main communication paths in the system are:

- Frontend -> Gateway
- Gateway -> Auth Service
- Gateway -> Event Service
- Gateway -> Booking Service
- Gateway -> Notification Service
- Booking Service -> Event Service
- Booking Service -> Notification Service
- Booking Service -> Auth Service

This architecture satisfies the requirement that all four services integrate into a single end-to-end application and that each student-owned service communicates with at least one other service.

## 4. Member-to-Microservice Mapping

For the purpose of the group submission, the following member mapping can be used and adjusted later with actual names.

- Member 1 -> `auth-service`
- Member 2 -> `event-service`
- Member 3 -> `booking-service`
- Member 4 -> `notification-service`

This mapping is only a placeholder and can be updated before final submission.

## 5. Description and Rationale of Each Microservice

### 5.1 Member 1 - Auth Service

The `auth-service` is responsible for identity and access management in the EventHub platform. It supports user registration, login, JWT token creation, and user-related lookup functions used by other internal services.

#### Main responsibilities

- Register new users
- Authenticate users
- Generate JWT tokens
- Expose protected user information where needed
- Support internal user lookup for platform workflows

#### Why it is important

This service centralizes authentication and role-based identity handling. Without it, there would be no secure user session management, no protected role separation, and no reliable identity data for the rest of the platform.

#### Example endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/auth/users`

#### Integration point

The strongest service-to-service integration for `auth-service` is with `booking-service`, which uses internal trusted access to look up administrator users when generating booking-related alerts.

### 5.2 Member 2 - Event Service

The `event-service` manages event data in the system. It allows organizers to create events, update event information, publish events, and maintain seat availability.

#### Main responsibilities

- Create events
- Update events
- Publish event listings
- Track seat counts
- Support booking-related seat reservation and release

#### Why it is important

This service models the main business object of the platform: the event. It acts as the source of truth for event details and seat availability.

#### Example endpoints

- `POST /api/events`
- `GET /api/events`
- `GET /api/events/:id`
- `PATCH /api/events/:id/publish`
- `PATCH /api/events/:id/reserve`
- `PATCH /api/events/:id/release`

#### Integration point

`event-service` integrates with `booking-service` to validate event details and reserve or release seats when bookings are created, approved, rejected, or cancelled.

### 5.3 Member 3 - Booking Service

The `booking-service` is the orchestration center of the system. It handles booking requests, booking state changes, approval workflows, cancellation logic, and cross-service coordination.

#### Main responsibilities

- Create booking requests
- Manage booking status lifecycle
- Support pending, confirmed, rejected, and cancelled states
- Coordinate event seat reservation and release
- Trigger customer, organizer, and admin notifications
- Provide organizer/admin booking management views

#### Why it is important

This service is the operational core of the platform because it coordinates business workflows across multiple services. It is the main example of real inter-service communication within the system.

#### Example endpoints

- `POST /api/bookings`
- `GET /api/bookings/my`
- `PATCH /api/bookings/:id/confirm`
- `PATCH /api/bookings/:id/reject`
- `PATCH /api/bookings/:id/cancel`
- `GET /api/bookings/manage`

#### Integration point

`booking-service` integrates with:

- `event-service` for seat handling and event validation
- `notification-service` for booking alerts
- `auth-service` for internal user role lookup

### 5.4 Member 4 - Notification Service

The `notification-service` manages in-app notification delivery. It stores notification records and exposes alert data to the frontend for customers, organizers, and admins.

#### Main responsibilities

- Create and store notifications
- Provide role-appropriate alerts
- Support booking request notifications
- Support booking confirmation, rejection, and cancellation notifications
- Support mark-as-read functionality

#### Why it is important

This service improves system usability and provides clear user feedback after business events occur. It also helps demonstrate role-specific behavior in the platform.

#### Example endpoints

- `POST /api/notifications/send`
- `GET /api/notifications/user/:userId`
- `PATCH /api/notifications/:id/read`

#### Integration point

`notification-service` integrates with `booking-service`, which triggers notifications for booking-related events affecting customers, organizers, and admins.

## 6. Inter-Service Communication

A key requirement of the assignment is that each microservice must demonstrate at least one working integration point with another group member's service. EventHub satisfies this requirement clearly.

### 6.1 Auth Service Integration

The `auth-service` communicates with `booking-service` by exposing internal user lookup functionality. This is used when `booking-service` needs to identify administrator recipients for global booking-related alerts.

### 6.2 Event Service Integration

The `event-service` communicates with `booking-service` during booking workflows. When a customer requests a booking, the booking service checks the event and reserves seats. When a booking is rejected or cancelled, the booking service requests seat release.

### 6.3 Booking Service Integration

The `booking-service` communicates with several services:

- It queries `event-service` for event information and seat updates.
- It queries `auth-service` for administrator information.
- It calls `notification-service` to create user-facing and role-specific alerts.

This makes it the strongest integration-heavy component in the system.

### 6.4 Notification Service Integration

The `notification-service` receives booking-related events from `booking-service`. These include pending booking requests, confirmations, rejections, cancellations, organizer alerts for owned events, and admin alerts for platform-wide activity.

### 6.5 Working End-to-End Example

One complete inter-service workflow is:

1. A customer submits a booking request from the frontend.
2. The request reaches the gateway.
3. The gateway forwards it to `booking-service`.
4. `booking-service` contacts `event-service` to validate the event and reserve seats.
5. `booking-service` stores the booking as `pending`.
6. `booking-service` contacts `notification-service` to notify the customer.
7. `booking-service` contacts `auth-service` to identify admin recipients.
8. `booking-service` contacts `notification-service` again to notify organizers and admins.

This demonstrates real inter-service collaboration beyond simple isolated CRUD operations.

## 7. DevOps Practices Implemented

The assignment required the use of basic DevOps practices. These were implemented in the following way.

### 7.1 Version Control

All source code was maintained in a public GitHub repository. This provided version tracking, collaborative development, history management, and easy access for demonstration and review.

### 7.2 Continuous Integration

GitHub Actions was used to implement CI workflows. These workflows automatically execute when code is pushed to the repository.

The CI workflow performs:

- backend syntax validation
- frontend build validation
- automated checks on repository changes

This helps identify issues early before deployment.

### 7.3 Container Image Publishing

A separate GitHub Actions workflow builds Docker images and publishes them to GitHub Container Registry (`ghcr.io`). Each service has its own image.

This ensures that cloud deployment consumes version-controlled container images from a proper registry, which aligns with container-based DevOps practice.

### 7.4 Deployment Approach

The system was deployed to Azure Container Apps, which is a managed container orchestration service. The backend services were deployed as separate container applications.

The project also includes a GitHub Actions deployment workflow for Azure Container Apps. However, in the university Azure tenant, fully automated deployment was limited by permission restrictions affecting GitHub-to-Azure authentication. Therefore, manual Azure CLI deployment was used for the active cloud deployment.

This still demonstrates a valid deployment pipeline structure, because the build and image publishing stages were automated while deployment remained reproducible through Azure CLI commands.

## 8. Containerization

Each microservice was containerized using Docker. A separate Dockerfile exists for each service, allowing them to be built and deployed independently.

Containerization provided several benefits:

- consistent runtime behavior across environments
- easier deployment to cloud services
- isolation between services
- support for container registry publishing

The project also includes a `docker-compose.yml` file for local multi-service development and integration testing.

## 9. Cloud Deployment

The backend services were deployed to Azure Container Apps. This allowed each microservice to be deployed independently while still communicating through internal cloud networking.

### 9.1 Deployment model

- `gateway` deployed as the external/public entry point
- `auth-service` deployed internally
- `event-service` deployed internally
- `booking-service` deployed internally
- `notification-service` deployed internally

This model improves security by exposing only the gateway publicly while keeping the core services behind the internal application network.

### 9.2 Cloud capabilities demonstrated

- managed container hosting
- internet-accessible API gateway
- internal service-to-service communication
- independent scaling/deployment units
- environment-variable-based configuration
- cloud-based operational hosting without self-managed servers

## 10. Security Measures Implemented

Security was an important part of the project and was addressed at both application and DevSecOps levels.

### 10.1 Authentication and Authorization

JWT-based authentication was used for user session handling. After successful login, users receive a token that is used to access protected routes.

Role-based access control was also enforced. The main roles were:

- customer
- organizer
- admin

Protected actions such as event management, booking approval, and administrative visibility were restricted based on role.

### 10.2 Service Isolation

Each microservice uses its own MongoDB database. This supports loose coupling and reduces cross-service data dependency.

### 10.3 Secret and Configuration Handling

Sensitive runtime values such as database connection strings and JWT secrets were handled through environment variables rather than hardcoded values in normal code paths.

### 10.4 Internal Service Protection

An internal service-to-service secret was used for selected trusted calls between backend services, especially where internal role lookup or internal notification triggers were needed.

### 10.5 DevSecOps Practice

SonarCloud was integrated as a managed SAST tool. This allowed the repository to be scanned for code quality issues and security-related concerns as part of the development workflow.

### 10.6 Cloud Security Posture

Only the gateway was publicly exposed in Azure. Internal services remained inside the Azure Container Apps internal network. This reduced unnecessary public exposure and follows a least-exposure model.

## 11. API Contracts and Documentation

Each service exposes Swagger / OpenAPI documentation through `/api-docs`. This supports API visibility, easier testing, and clearer communication of available endpoints.

This satisfies the assignment requirement to provide the API contract for the service endpoints.

## 12. Challenges Faced and Solutions

### 12.1 Inter-Service URL Configuration

One challenge was configuring correct service-to-service URLs in Azure Container Apps. Internal calls initially failed when short hostnames or incorrect URL forms were used. This was resolved by using the correct internal FQDNs in service environment variables.

### 12.2 Notification Workflow Errors

During development, some booking actions completed in the database but still returned frontend errors. This happened because a downstream notification step failed after the main booking logic had already succeeded. The issue was identified through service logs and fixed by correcting internal service URLs and request flow logic.

### 12.3 University Azure Tenant Permissions

A major challenge was enabling fully automated GitHub-to-Azure deployment. The university tenant restricted service-principal-related operations, preventing full CD from being configured in the same way as a personal Azure subscription. The group addressed this by keeping CI, image publishing, and DevSecOps automation active while using manual Azure CLI deployment for the final cloud deployment.

### 12.4 Docker and Local Environment Issues

Docker Desktop and WSL occasionally caused local startup problems during development. These were environment-related rather than application-related and were handled through Docker image refresh, WSL restart, and local environment recovery steps.

## 13. Demonstration Plan

The system can be demonstrated within the 10-minute viva using the following flow:

1. Briefly explain the architecture diagram.
2. Show the public GitHub repository.
3. Show GitHub Actions workflows for CI and Docker image publishing.
4. Show SonarCloud results.
5. Open the deployed gateway/backend.
6. Log in as organizer and create or manage an event.
7. Log in as customer and request a booking.
8. Show organizer/admin visibility of the booking request.
9. Confirm or reject the booking.
10. Show notifications and mark-as-read functionality.
11. Explain JWT, RBAC, internal networking, and DevSecOps scanning.

This structure demonstrates functionality, integration, DevOps, cloud capabilities, and security within a compact time frame.

## 14. Conclusion

EventHub successfully demonstrates the design and implementation of a secure microservice-based cloud application using modern DevOps and cloud practices. The project fulfills the assignment’s core technical objectives by providing:

- a cohesive four-microservice system
- independent service responsibilities
- working inter-service communication
- containerization with Docker
- automated CI and container publishing
- DevSecOps scanning with SonarCloud
- cloud deployment on Azure Container Apps
- role-based security and JWT authentication

The system also provides a strong basis for demonstration because it shows real collaboration between services rather than isolated components. Overall, the project meets the key requirements of the assignment and reflects a practical use of cloud-native development practices.

## 15. Appendix - Repository Deliverables Checklist

The repository includes or supports the following required deliverables:

- public source code repository
- Dockerfiles for services
- `docker-compose.yml`
- CI workflow configuration
- Docker publish workflow configuration
- SonarCloud workflow configuration
- Swagger / OpenAPI endpoint exposure
- Azure deployment-ready container images
- service-level environment configuration
- shared architecture documentation support

## 16. Placeholder Section For Final Submission Editing

Before final submission, update the following:

- replace `Member 1`, `Member 2`, `Member 3`, and `Member 4` with actual student names
- insert the final shared architecture diagram image
- add repository URL
- add SonarCloud project link if needed
- add deployed backend URL if required by lecturer
- slightly adjust the microservice ownership section if your group used a different member-to-service mapping
