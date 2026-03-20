# Report Writing Guide

This document is a writing guide for the final assignment report.

## Report Goal

The report should explain how the assigned microservice fits into the full system while also showing the shared architecture, DevOps practices, security considerations, and integration behavior.

## Suggested Report Structure

### 1. Introduction

Write a short introduction to the project.

Suggested points:
- project name: `EventHub`
- domain: event booking platform
- architectural style: microservices
- purpose: satisfy the cloud computing assignment requirements with DevOps and cloud deployment

### 2. Shared Architecture Diagram

Include one high-level architecture diagram showing:
- frontend
- gateway
- auth-service
- event-service
- booking-service
- notification-service
- container registry
- GitHub Actions / SonarCloud
- Azure Container Apps
- MongoDB databases
- communication arrows between services

### 3. Assigned Microservice Description

Each student should focus on their own microservice section.

For this section include:
- what the service is responsible for
- why it exists in the full system
- key endpoints
- main data handled by the service
- why this service matters to the end-to-end application

### 4. Inter-Service Communication

Explain at least one integration point clearly.

Examples:
- auth-service supports booking-service through user/admin lookup
- event-service supports booking-service through seat reservation and release
- booking-service orchestrates auth, event, and notification integrations
- notification-service receives booking-triggered alerts from booking-service

Include a simple example request flow.

### 5. DevOps Practices

Explain:
- source code hosted in GitHub
- Docker containerization
- GitHub Actions CI
- GHCR image publishing
- manual Azure CLI deployment using the published images

Important note to mention honestly:
- CI and image publishing are automated
- SonarCloud is integrated
- Azure deployment is manual because tenant permissions limited full service-principal-based GitHub CD

### 6. Security Practices

Explain:
- JWT authentication
- role-based authorization
- protected endpoints
- service-specific access rules
- SonarCloud DevSecOps integration
- environment-based configuration
- cloud deployment security story

### 7. Challenges Faced

Possible challenges you can mention:
- service-to-service URL differences between local Docker and Azure
- Azure internal HTTPS routing behavior
- deployment env var mismatches
- role-based notification expansion for organizer/admin
- Azure tenant limitation for automated CD
- Docker/WSL issues during local testing

### 8. Conclusion

Summarize:
- what was built
- how the assigned service contributed
- how DevOps/cloud/security requirements were addressed

## What Each Student Should Emphasize

### Member 1 - Auth Service

Focus on:
- authentication and JWT
- user roles
- support for internal service user lookup

### Member 2 - Event Service

Focus on:
- event management
- seat handling
- integration with booking-service

### Member 3 - Booking Service

Focus on:
- booking approval workflow
- orchestration with auth/event/notification services
- organizer/admin booking oversight

### Member 4 - Notification Service

Focus on:
- notification storage and retrieval
- organizer/admin/customer alerts
- mark-as-read support

## Good Evidence To Attach Or Reference

- screenshots of GitHub Actions
- SonarCloud dashboard screenshot
- GHCR package screenshot
- Azure deployment screenshot
- Swagger / API docs screenshot
- frontend screenshots

## Suggested Writing Style

- keep it technical but simple
- avoid very long theory sections
- focus on what you actually implemented
- tie every explanation back to the assignment marking points

## Final Checklist Before Submitting Report

- architecture diagram included
- assigned service clearly explained
- integration example clearly explained
- DevOps and security section included
- challenges section included
- screenshots/evidence prepared
- report matches the real implemented system
