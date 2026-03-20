# Personal Azure CI/CD Setup

This guide is for moving EventHub to a personal Azure subscription so GitHub Actions can handle both CI and CD cleanly.

## Goal

After this setup, your pipeline can do all of the following:

- run CI checks
- run SonarCloud scanning
- publish Docker images to `ghcr.io`
- log in to Azure through GitHub OIDC
- deploy or update all backend services in Azure Container Apps automatically

## What Gets Deployed

The workflow deploys these container apps:

- `auth-service`
- `event-service`
- `booking-service`
- `notification-service`
- `gateway`

The frontend can stay local for the assignment demo, or you can deploy it separately later.

## 1. Create Azure Infrastructure

Install or update Azure CLI first, then sign in to your personal subscription.

```powershell
az login
az account set --subscription "<YOUR_SUBSCRIPTION_NAME_OR_ID>"
az extension add --name containerapp --upgrade --yes
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
```

Create a new resource group and Container Apps environment:

```powershell
az group create --name eventhub-personal-rg --location southeastasia
az containerapp env create --name eventhub-personal-env --resource-group eventhub-personal-rg --location southeastasia
```

You can change the names and location if you want, but keep them consistent with the GitHub repository variables.

## 2. Configure GitHub-to-Azure Authentication with OIDC

The workflow uses `azure/login@v2` with OpenID Connect. This is cleaner than storing a JSON service principal secret.

### Create an Entra app registration

Use the Azure Portal:

1. Go to `Microsoft Entra ID`.
2. Open `App registrations`.
3. Click `New registration`.
4. Name it something like `eventhub-github-actions`.
5. Leave the default single-tenant option unless you specifically need something else.
6. Create it.

### Create a federated credential for GitHub

Inside that app registration:

1. Open `Certificates & secrets`.
2. Open `Federated credentials`.
3. Click `Add credential`.
4. Choose `GitHub Actions deploying Azure resources`.
5. Set:
   - Organization: your GitHub username or org
   - Repository: this repo name
   - Entity type: `Branch`
   - Branch: `main`
6. Add the credential.

### Grant the app access to your resource group

Go to the resource group you created:

1. Open `Access control (IAM)`.
2. Click `Add role assignment`.
3. Assign the `Contributor` role.
4. Select the app registration you created.

### Copy these values from Azure

You will need:

- `Application (client) ID`
- `Directory (tenant) ID`
- Azure `Subscription ID`

## 3. GitHub Secrets

Add these repository secrets under `Settings -> Secrets and variables -> Actions`.

### Azure authentication

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

### Deployment/application secrets

- `GHCR_PULL_TOKEN`
- `JWT_SECRET`
- `SERVICE_TO_SERVICE_SECRET`
- `AUTH_MONGO_URI`
- `EVENT_MONGO_URI`
- `BOOKING_MONGO_URI`
- `NOTIFICATION_MONGO_URI`

### Notes

- `GHCR_PULL_TOKEN` should be a GitHub token with at least `read:packages`.
- The Mongo secrets should point to the correct Atlas databases for each service.
- `SERVICE_TO_SERVICE_SECRET` must match across `auth-service`, `booking-service`, and `notification-service`.

## 4. GitHub Repository Variables

Add these repository variables under `Settings -> Secrets and variables -> Actions -> Variables`.

- `AZURE_RESOURCE_GROUP`
- `AZURE_CONTAINERAPPS_ENV`
- `AZURE_LOCATION`

Example values:

- `AZURE_RESOURCE_GROUP=eventhub-personal-rg`
- `AZURE_CONTAINERAPPS_ENV=eventhub-personal-env`
- `AZURE_LOCATION=southeastasia`

## 5. Workflow File

The repository includes this workflow:

- `.github/workflows/deploy-azure.yml`

It will:

1. wait for `Publish Docker Images` to finish successfully
2. log in to Azure with OIDC
3. ensure the resource group exists
4. ensure the Container Apps environment exists
5. deploy internal services first
6. read their internal FQDNs
7. wire the booking and gateway URLs automatically
8. print the final public gateway URL

## 6. First Deployment

Once your secrets and variables are set:

1. push your latest code to `main`
2. wait for these workflows:
   - `CI`
   - `SonarCloud`
   - `Publish Docker Images`
   - `Deploy To Azure Container Apps`
3. open the `Deploy To Azure Container Apps` workflow logs
4. copy the printed gateway URL

You can also run the deploy manually from GitHub Actions using `workflow_dispatch`.

## 7. Recommended Verification Flow

After deployment, test:

1. register/login
2. create an event as organizer
3. request a booking as customer
4. check organizer approval queue
5. check admin booking visibility
6. confirm or reject the booking
7. check customer, organizer, and admin alerts
8. mark notifications as read

## 8. Troubleshooting

### Azure login fails

Check:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- federated credential branch matches `main`
- app registration has `Contributor` access on the resource group

### Container app cannot pull image

Check:

- GHCR package visibility
- `GHCR_PULL_TOKEN`
- `github.repository_owner` matches the image owner

### Booking or notification internal calls fail

The deploy workflow reads the latest internal FQDNs and rewrites:

- `AUTH_SERVICE_URL`
- `EVENT_SERVICE_URL`
- `BOOKING_SERVICE_URL`
- `NOTIFICATION_SERVICE_URL`

So if those fail, inspect the workflow logs and the specific container app logs.

## 9. Why This Setup Is Better Than the Old Tenant Setup

This personal Azure setup removes the university tenant restriction that blocked service principal authentication. That gives you:

- proper GitHub-to-Azure authentication
- real CD after image publish
- a cleaner DevOps story for viva/report
- a backup environment independent from university tenant issues
