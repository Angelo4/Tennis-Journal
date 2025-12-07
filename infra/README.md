# Infrastructure as Code

This directory contains the Azure Bicep infrastructure files for the Tennis Journal application.

## Structure

```
infra/
├── main.bicep                    # Main infrastructure template
├── parameters.dev.bicepparam     # Dev environment parameters
├── parameters.staging.bicepparam # Staging environment parameters (future)
├── parameters.prod.bicepparam    # Production environment parameters (future)
└── README.md                     # This file
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Azure Resource Group                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────┐     ┌──────────────────┐     ┌────────────────┐  │
│   │  Azure Container │     │  App Service     │     │  Azure Cosmos  │  │
│   │  Apps (Frontend) │────▶│  (Backend API)   │────▶│  DB            │  │
│   │  Next.js         │     │  .NET 9          │     │  NoSQL         │  │
│   └────────┬─────────┘     └────────┬─────────┘     └────────────────┘  │
│            │                        │                                    │
│            │                        │                                    │
│   ┌────────▼─────────┐     ┌────────▼─────────┐     ┌────────────────┐  │
│   │  Container       │     │  Key Vault       │     │  Log Analytics │  │
│   │  Registry (ACR)  │     │  (Secrets)       │     │  & App Insights│  │
│   └──────────────────┘     └──────────────────┘     └────────────────┘  │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │  Container Apps Managed Environment                               │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Resources Deployed

The infrastructure includes:

| Resource | Description |
|----------|-------------|
| **Log Analytics Workspace** | Central logging and monitoring |
| **Application Insights** | Application performance monitoring |
| **App Service Plan** | Linux hosting for the backend API |
| **Backend Web App** | .NET 9 backend API with managed identity |
| **Azure Container Registry** | Container image storage for frontend |
| **Container Apps Environment** | Managed Kubernetes environment |
| **Frontend Container App** | Next.js frontend (containerized) |
| **Azure Cosmos DB** | NoSQL database for Users, Sessions, and Strings |
| **Azure Key Vault** | Secure storage for secrets and configuration |

## Cosmos DB Configuration

The Cosmos DB account is configured with:

- **Database**: `TennisJournal`
- **Containers**:
  - `Users` - Partitioned by `/id`
  - `Sessions` - Partitioned by `/userId`
  - `Strings` - Partitioned by `/userId`
- **Serverless** (dev) / **Autoscale** (staging/prod)
- **Managed Identity** access from the API

## Container Apps Configuration

The frontend is deployed to Azure Container Apps with:

- **Ingress**: External HTTPS on port 3000
- **Scale**: 0-3 replicas (dev), 1-10 replicas (prod)
- **Scale Rules**: HTTP concurrent requests (100)
- **Registry**: Azure Container Registry with managed identity pull

## Prerequisites

1. Azure CLI installed and logged in
2. Bicep CLI installed (or use Azure CLI with Bicep support)
3. Azure subscription with appropriate permissions

## Deployment

### Manual Deployment

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription <subscription-id>

# Create resource group (if it doesn't exist)
az group create --name rg-tennisjournal-dev --location australiaeast

# Deploy infrastructure
az deployment group create \
  --resource-group rg-tennisjournal-dev \
  --template-file main.bicep \
  --parameters parameters.dev.bicepparam
```

### Restore Bicep Modules

Before deployment, restore the Azure Verified Modules:

```bash
bicep restore main.bicep
```

### What-If Preview

To preview changes before deployment:

```bash
az deployment group what-if \
  --resource-group rg-tennisjournal-dev \
  --template-file main.bicep \
  --parameters parameters.dev.bicepparam
```

## GitHub Actions Integration

The infrastructure is automatically deployed via the `.github/workflows/infrastructure.yml` pipeline when changes are pushed to the `infra/` directory.

The application deployment flow is:
1. **Backend**: Build .NET API → Deploy to App Service
2. **Frontend**: Build Docker image → Push to ACR → Update Container App

## Environment Configuration

### Dev (Current)
- **App Service Plan**: B1 (Basic, 1 instance)
- **Container Registry**: Basic SKU
- **Container App**: 0.25 vCPU, 0.5Gi memory, 0-3 replicas
- **Cosmos DB**: Serverless (pay-per-request)
- **Log Analytics Retention**: 30 days
- **Key Vault Soft Delete**: 7 days

### Staging (Future)
- **App Service Plan**: S1 (Standard, 1 instance)
- **Container Registry**: Standard SKU
- **Container App**: 0.5 vCPU, 1Gi memory, 0-3 replicas
- **Cosmos DB**: Autoscale (400-4000 RU/s)
- **Log Analytics Retention**: 30 days
- **Key Vault Soft Delete**: 7 days

### Production (Future)
- **App Service Plan**: P1v3 (Premium, 2 instances)
- **Container Registry**: Standard SKU
- **Container App**: 1.0 vCPU, 2Gi memory, 1-10 replicas (zone redundant)
- **Cosmos DB**: Autoscale (1000-10000 RU/s), Zone Redundant
- **Log Analytics Retention**: 90 days
- **Key Vault Soft Delete**: 90 days
- **Continuous Backup**: Enabled

## Outputs

After deployment, the following outputs are available:

| Output | Description |
|--------|-------------|
| `apiWebAppName` | Name of the deployed API Web App |
| `apiWebAppHostname` | Default hostname for the API |
| `containerRegistryName` | Name of the Container Registry |
| `containerRegistryLoginServer` | ACR login server URL |
| `containerAppsEnvironmentName` | Name of the Container Apps Environment |
| `frontendContainerAppName` | Name of the Frontend Container App |
| `frontendContainerAppFqdn` | FQDN for the frontend |
| `cosmosDbAccountName` | Name of the Cosmos DB account |
| `cosmosDbEndpoint` | Cosmos DB account endpoint |
| `keyVaultName` | Name of the Key Vault |
| `keyVaultUri` | Key Vault URI |
| `appInsightsConnectionString` | Connection string for Application Insights |

## Security Notes

- HTTPS is enforced on all resources
- Minimum TLS version is 1.2
- FTPS is disabled on App Service (deployment via GitHub Actions only)
- System-assigned managed identity for both API and Container App
- Container Registry uses managed identity (no admin user)
- Cosmos DB uses RBAC with managed identity (no connection string needed)

## Cost Estimation (Dev)

| Resource | Estimated Monthly Cost (USD) |
|----------|------------------------------|
| App Service Plan (B1) | ~$13 |
| Container Registry (Basic) | ~$5 |
| Container Apps | ~$0-5 (scale to zero) |
| Log Analytics | ~$2-5 (based on ingestion) |
| Application Insights | Free tier (5GB/month) |
| Cosmos DB (Serverless) | ~$0-5 (based on usage) |
| **Total** | **~$20-30** |

*Costs may vary based on usage and region.*
