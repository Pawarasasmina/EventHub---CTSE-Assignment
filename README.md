# EventHub

EventHub is a microservice-based event booking platform built for the SE4010 Cloud Computing assignment. It demonstrates a four-service architecture, API gateway routing, Docker containerization, CI, DevSecOps scanning with SonarCloud, GitHub Container Registry publishing, and deployment to Azure Container Apps.

## What This Project Includes

- `frontend`: React + Vite client for customers, organizers, and admins
- `gateway`: Express API gateway used by the frontend
- `services/auth-service`: authentication, registration, JWT, user lookup
- `services/event-service`: event creation, publishing, seat handling
- `services/booking-service`: booking requests, approval workflow, booking management
- `services/notification-service`: in-app notifications, role-based alerts, mark-as-read
- MongoDB: one isolated database per microservice

## Assignment Fit

This project is structured so the four main microservices can be presented as four student-owned components:

- `auth-service`
- `event-service`
- `booking-service`
- `notification-service`

Each of them has at least one working integration point with another service in the system.

## Key Integrations

- `auth-service` -> supports `booking-service` internal admin lookup and platform authentication
- `event-service` <-> `booking-service` for seat reservation and release
- `booking-service` -> `notification-service` for customer, organizer, and admin booking alerts
- `notification-service` -> serves role-specific notifications to frontend users

## Quick Links

### Swagger / API Docs

Use these local Swagger endpoints when the services are running:

- Auth Service Swagger: `http://localhost:5001/api-docs`
- Event Service Swagger: `http://localhost:5002/api-docs`
- Booking Service Swagger: `http://localhost:5003/api-docs`
- Notification Service Swagger: `http://localhost:5004/api-docs`

Swagger source files in the repository:

- [services/auth-service/src/docs/swagger.js](d:\.SLIIT\Y-4%20S-2\EventHub\services\auth-service\src\docs\swagger.js)
- [services/event-service/src/docs/swagger.js](d:\.SLIIT\Y-4%20S-2\EventHub\services\event-service\src\docs\swagger.js)
- [services/booking-service/src/docs/swagger.js](d:\.SLIIT\Y-4%20S-2\EventHub\services\booking-service\src\docs\swagger.js)
- [services/notification-service/src/docs/swagger.js](d:\.SLIIT\Y-4%20S-2\EventHub\services\notification-service\src\docs\swagger.js)

### CI/CD Workflow Files

- [CI Workflow](d:\.SLIIT\Y-4%20S-2\EventHub\.github\workflows\ci.yml)
- [Docker Publish Workflow](d:\.SLIIT\Y-4%20S-2\EventHub\.github\workflows\docker-publish.yml)
- [SonarCloud Workflow](d:\.SLIIT\Y-4%20S-2\EventHub\.github\workflows\sonarcloud.yml)
- [Azure Deploy Workflow](d:\.SLIIT\Y-4%20S-2\EventHub\.github\workflows\deploy-azure.yml)

### Docker / Container Files

- [docker-compose.yml](d:\.SLIIT\Y-4%20S-2\EventHub\docker-compose.yml)
- [gateway/Dockerfile](d:\.SLIIT\Y-4%20S-2\EventHub\gateway\Dockerfile)
- [frontend/Dockerfile](d:\.SLIIT\Y-4%20S-2\EventHub\frontend\Dockerfile)
- [services/auth-service/Dockerfile](d:\.SLIIT\Y-4%20S-2\EventHub\services\auth-service\Dockerfile)
- [services/event-service/Dockerfile](d:\.SLIIT\Y-4%20S-2\EventHub\services\event-service\Dockerfile)
- [services/booking-service/Dockerfile](d:\.SLIIT\Y-4%20S-2\EventHub\services\booking-service\Dockerfile)
- [services/notification-service/Dockerfile](d:\.SLIIT\Y-4%20S-2\EventHub\services\notification-service\Dockerfile)

### Report / Project Docs

- [Team Component Mapping](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/TEAM_COMPONENTS.md)
- [Technical Reference](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/TECHNICAL_REFERENCE.md)
- [Report Writing Guide](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/REPORT_GUIDE.md)
- [Full Report Template](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/FULL_REPORT_TEMPLATE.md)
- [Member 1 Report](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/REPORT_MEMBER_1_AUTH.md)
- [Member 2 Report](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/REPORT_MEMBER_2_EVENT.md)
- [Member 3 Report](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/REPORT_MEMBER_3_BOOKING.md)
- [Member 4 Report](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/REPORT_MEMBER_4_NOTIFICATION.md)
- [Personal Azure CI/CD Setup](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/AZURE_PERSONAL_SETUP.md)
- [Personal Azure Step By Step](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/PERSONAL_AZURE_STEP_BY_STEP.md)

## Code Repository Deliverables

This public repository contains the required assignment deliverables for the code submission.

### 1. Public Repository With Source Code

The repository includes the full source code for:

- `frontend`
- `gateway`
- `services/auth-service`
- `services/event-service`
- `services/booking-service`
- `services/notification-service`

### 2. API Contract / OpenAPI / Swagger

Each backend microservice exposes Swagger documentation at:

- `auth-service -> /api-docs`
- `event-service -> /api-docs`
- `booking-service -> /api-docs`
- `notification-service -> /api-docs`

### 3. CI/CD Pipeline Configuration Files

The repository includes GitHub Actions workflow files under `.github/workflows/` for CI, container publishing, SonarCloud scanning, and Azure deployment.

### 4. Dockerfile And Container Configuration

Each deployable component includes a Dockerfile, and the root project includes `docker-compose.yml` for local multi-service startup.

### 5. Access To Version-Controlled Repository

All project files are maintained in Git and intended to be submitted through the public GitHub repository. The repository history, workflows, Docker configuration, and service code are all available from the same version-controlled source.

## Current Booking Flow

1. Customer submits a booking request.
2. `booking-service` checks the event and reserves seats through `event-service`.
3. Booking is created with `pending` status.
4. Customer gets a pending notification.
5. Organizer gets a booking request notification for their own event.
6. Admin gets a global booking request notification.
7. Organizer or admin confirms or rejects the request.
8. Customer receives the final result notification.
9. Booking cancellations also notify organizer and admin.

## Local Development

### Without Docker

Copy `.env.example` to `.env` where needed:

- `gateway`
- `frontend`
- `services/auth-service`
- `services/event-service`
- `services/booking-service`
- `services/notification-service`

Then install dependencies and start in this order:

1. `services/auth-service`
2. `services/event-service`
3. `services/notification-service`
4. `services/booking-service`
5. `gateway`
6. `frontend`

### With Docker

From the project root:

```powershell
docker compose up --build
```

Frontend:
- `http://localhost:5173`

Gateway:
- `http://localhost:5000`

## Ports

- Frontend: `5173`
- Gateway: `5000`
- Auth Service: `5001`
- Event Service: `5002`
- Booking Service: `5003`
- Notification Service: `5004`

## CI And DevSecOps

This repository includes working GitHub Actions for:

- `CI`
- `Publish Docker Images`
- `SonarCloud`
- `Deploy To Azure Container Apps`

### Required GitHub Configuration

Set this GitHub secret:

- `SONAR_TOKEN`

Update `sonar-project.properties` with your real:

- SonarCloud project key
- SonarCloud organization

## Container Registry

Docker images are published to GitHub Container Registry (`ghcr.io`).

## Cloud Deployment

The backend has been deployed to Azure Container Apps.

There are now two supported deployment stories:

- `University Azure`: manual Azure CLI deployment/update when tenant permissions block GitHub-to-Azure auth
- `Personal Azure`: full GitHub-to-Azure CI/CD using `.github/workflows/deploy-azure.yml` and OIDC

If you want the clean personal-subscription setup, follow:

- [Personal Azure CI/CD Setup](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/AZURE_PERSONAL_SETUP.md)
- [Personal Azure Step By Step](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/PERSONAL_AZURE_STEP_BY_STEP.md)

This gives a stronger DevOps and cloud deployment story for the assignment.

## Final Notes

Before final demo or submission:

- verify latest GitHub Actions are green
- rebuild or redeploy latest service changes
- test customer, organizer, and admin flows
- rotate any exposed secrets if needed
