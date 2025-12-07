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
| **App Service Plan** | Linux hosting for the backend API |
| **Web App** | .NET 9 backend API |
| **Static Web App** | Next.js frontend hosting |

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
- **Log Analytics Retention**: 30 days
- **Static Web App SKU**: Free
- **Always On**: Disabled (cost savings)

### Staging (Future)
- **App Service Plan**: S1 (Standard, 1 instance)
- **Log Analytics Retention**: 30 days
- **Static Web App SKU**: Free
- **Always On**: Enabled

### Production (Future)
- **App Service Plan**: P1v3 (Premium, 2 instances)
- **Log Analytics Retention**: 90 days
- **Static Web App SKU**: Standard
- **Always On**: Enabled
- **Staging Environments**: Enabled

## Outputs

After deployment, the following outputs are available:

| Output | Description |
|--------|-------------|
| `webAppName` | Name of the deployed Web App |
| `webAppHostname` | Default hostname for the API |
| `staticWebAppName` | Name of the Static Web App |
| `staticWebAppHostname` | Default hostname for the frontend |
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
