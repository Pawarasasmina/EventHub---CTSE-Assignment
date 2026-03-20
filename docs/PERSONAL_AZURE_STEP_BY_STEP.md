# Personal Azure CI/CD Step By Step

This guide shows how to move EventHub to your own Azure account and enable proper CI/CD with GitHub Actions.

## Goal

At the end of this setup, you should have:

- CI running in GitHub Actions
- SonarCloud running
- Docker images publishing to GHCR
- GitHub Actions deploying automatically to Azure Container Apps
- a public backend gateway URL from your personal Azure subscription

## Step 1. Sign in to your personal Azure account

Install Azure CLI if needed, then run:

```powershell
az login
az account show
```

If you have more than one subscription:

```powershell
az account set --subscription "<YOUR_SUBSCRIPTION_ID_OR_NAME>"
```

## Step 2. Register required Azure providers

Run:

```powershell
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
az extension add --name containerapp --upgrade --yes
```

## Step 3. Create a new resource group

Example:

```powershell
az group create --name eventhub-personal-rg --location southeastasia
```

You can change the name and location, but keep them consistent later.

## Step 4. Create the Azure Container Apps environment

Run:

```powershell
az containerapp env create --name eventhub-personal-env --resource-group eventhub-personal-rg --location southeastasia
```

## Step 5. Create an Entra app registration for GitHub Actions

In Azure Portal:

1. Go to `Microsoft Entra ID`
2. Open `App registrations`
3. Click `New registration`
4. Name it something like `eventhub-github-actions`
5. Create it

From the app overview, copy:

- `Application (client) ID`
- `Directory (tenant) ID`

Also copy your Azure:

- `Subscription ID`

## Step 6. Add a federated credential for GitHub

Inside the same app registration:

1. Open `Certificates & secrets`
2. Open `Federated credentials`
3. Click `Add credential`
4. Choose `GitHub Actions deploying Azure resources`
5. Set:
   - Organization: your GitHub username or org
   - Repository: your EventHub repo
   - Entity type: `Branch`
   - Branch: `main`
6. Save

Important:

- repo name must match exactly
- branch must match exactly

## Step 7. Give the app access to your resource group

Go to your resource group in Azure Portal:

1. Open `Access control (IAM)`
2. Click `Add role assignment`
3. Select role: `Contributor`
4. Assign it to your `eventhub-github-actions` app registration
5. Save

## Step 8. Add GitHub repository secrets

In GitHub:

`Settings -> Secrets and variables -> Actions`

Add these secrets:

### Azure auth

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

### Deployment and app secrets

- `GHCR_PULL_TOKEN`
- `JWT_SECRET`
- `SERVICE_TO_SERVICE_SECRET`
- `AUTH_MONGO_URI`
- `EVENT_MONGO_URI`
- `BOOKING_MONGO_URI`
- `NOTIFICATION_MONGO_URI`
- `SONAR_TOKEN`

Notes:

- `GHCR_PULL_TOKEN` should have at least `read:packages`
- `SERVICE_TO_SERVICE_SECRET` should be the same across auth, booking, and notification flows
- Mongo URIs should point to the correct Atlas databases

## Step 9. Add GitHub repository variables

In GitHub:

`Settings -> Secrets and variables -> Actions -> Variables`

Add:

- `AZURE_RESOURCE_GROUP`
- `AZURE_CONTAINERAPPS_ENV`
- `AZURE_LOCATION`

Example values:

- `AZURE_RESOURCE_GROUP=eventhub-personal-rg`
- `AZURE_CONTAINERAPPS_ENV=eventhub-personal-env`
- `AZURE_LOCATION=southeastasia`

## Step 10. Confirm the deploy workflow exists

The repo already includes:

- [.github/workflows/deploy-azure.yml](d:\.SLIIT\Y-4%20S-2\EventHub\.github\workflows\deploy-azure.yml)

This workflow:

1. waits for `Publish Docker Images`
2. logs into Azure using OIDC
3. creates or updates Container Apps
4. configures internal service URLs automatically
5. prints the final gateway URL

## Step 11. Push your code

Run:

```powershell
git add .
git commit -m "Enable personal Azure CI/CD"
git push
```

## Step 12. Watch GitHub Actions

In GitHub `Actions`, check these workflows:

- `CI`
- `SonarCloud`
- `Publish Docker Images`
- `Deploy To Azure Container Apps`

`Deploy To Azure Container Apps` should run after Docker publish succeeds.

## Step 13. Get the deployed backend URL

Open the deploy workflow logs.

At the end it should print something like:

```text
Gateway URL: https://your-gateway-name.region.azurecontainerapps.io
```

That is your backend base URL.

## Step 14. Connect the frontend

If frontend stays local, update:

- [frontend/.env](d:\.SLIIT\Y-4%20S-2\EventHub\frontend\.env)

```env
VITE_API_BASE_URL=https://<YOUR_GATEWAY_URL>
```

Then run the frontend locally.

## Step 15. Test the full deployed flow

Test in this order:

1. register/login
2. create event as organizer
3. request booking as customer
4. check organizer approval queue
5. check admin booking visibility
6. confirm or reject booking
7. check alerts for customer, organizer, and admin
8. mark notifications as read

## Common Problems

### Azure login fails in GitHub Actions

Check:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- federated credential repo/branch values
- app registration has `Contributor` on the resource group

### Container app cannot pull image

Check:

- `GHCR_PULL_TOKEN`
- GHCR package visibility
- image owner matches your GitHub owner

### Inter-service URLs fail after deployment

The workflow reads the internal FQDNs and sets:

- `AUTH_SERVICE_URL`
- `EVENT_SERVICE_URL`
- `BOOKING_SERVICE_URL`
- `NOTIFICATION_SERVICE_URL`

If something still fails, inspect the deploy logs and container app logs.

## Useful Files In This Repo

- [README.md](d:\.SLIIT\Y-4%20S-2\EventHub\README.md)
- [docs/AZURE_PERSONAL_SETUP.md](d:\.SLIIT\Y-4%20S-2\EventHub\docs\AZURE_PERSONAL_SETUP.md)
- [.github/workflows/deploy-azure.yml](d:\.SLIIT\Y-4%20S-2\EventHub\.github\workflows\deploy-azure.yml)

## Recommended Approach

Keep your current university Azure deployment as a backup.

Use your personal Azure deployment as the clean CI/CD version for:

- proper DevOps story
- proper CD story
- cleaner viva/demo
