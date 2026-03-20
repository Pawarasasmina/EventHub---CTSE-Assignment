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

This gives a stronger DevOps and cloud deployment story for the assignment.

## Swagger / API Docs

Each service exposes Swagger at `/api-docs`.

## Recommended Reading

- [Team Component Mapping](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/TEAM_COMPONENTS.md)
- [Technical Reference](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/TECHNICAL_REFERENCE.md)
- [Report Writing Guide](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/REPORT_GUIDE.md)
- [Personal Azure CI/CD Setup](d:/%2E%20SLIIT/Y-4%20S-2/EventHub/docs/AZURE_PERSONAL_SETUP.md)

## Final Notes

Before final demo or submission:

- verify latest GitHub Actions are green
- rebuild/redeploy latest service changes
- test customer, organizer, and admin flows
- rotate any exposed secrets if needed
