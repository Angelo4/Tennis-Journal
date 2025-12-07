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

## Resources Deployed

The infrastructure includes:

| Resource | Description |
|----------|-------------|
| **Log Analytics Workspace** | Central logging and monitoring |
| **Application Insights** | Application performance monitoring |
| **App Service Plan** | Linux hosting for the backend API and frontend |
| **Backend Web App** | .NET 9 backend API with managed identity |
| **Frontend Web App** | Next.js frontend hosting |
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

## Environment Configuration

### Dev (Current)
- **App Service Plan**: B1 (Basic, 1 instance)
- **Cosmos DB**: Serverless (pay-per-request)
- **Log Analytics Retention**: 30 days
- **Always On**: Disabled (cost savings)
- **Key Vault Soft Delete**: 7 days

### Staging (Future)
- **App Service Plan**: S1 (Standard, 1 instance)
- **Cosmos DB**: Autoscale (400-4000 RU/s)
- **Log Analytics Retention**: 30 days
- **Always On**: Enabled
- **Key Vault Soft Delete**: 7 days

### Production (Future)
- **App Service Plan**: P1v3 (Premium, 2 instances)
- **Cosmos DB**: Autoscale (1000-10000 RU/s), Zone Redundant
- **Log Analytics Retention**: 90 days
- **Always On**: Enabled
- **Key Vault Soft Delete**: 90 days
- **Continuous Backup**: Enabled

## Outputs

After deployment, the following outputs are available:

| Output | Description |
|--------|-------------|
| `apiWebAppName` | Name of the deployed API Web App |
| `apiWebAppHostname` | Default hostname for the API |
| `frontendWebAppName` | Name of the Frontend Web App |
| `frontendWebAppHostname` | Default hostname for the frontend |
| `cosmosDbAccountName` | Name of the Cosmos DB account |
| `cosmosDbEndpoint` | Cosmos DB account endpoint |
| `keyVaultName` | Name of the Key Vault |
| `keyVaultUri` | Key Vault URI |
| `appInsightsConnectionString` | Connection string for Application Insights |

## Security Notes

- HTTPS is enforced on all web resources
- Minimum TLS version is 1.2
- FTPS is disabled (deployment via GitHub Actions only)
- System-assigned managed identity is enabled on the Web App

## Cost Estimation (Dev)

| Resource | Estimated Monthly Cost (USD) |
|----------|------------------------------|
| App Service Plan (B1) | ~$13 |
| Log Analytics | ~$2-5 (based on ingestion) |
| Application Insights | Free tier (5GB/month) |
| Static Web App | Free |
| **Total** | **~$15-20** |

*Costs may vary based on usage and region.*
