// =============================================================================
// Tennis Journal - Main Infrastructure Template
// =============================================================================
// This template deploys the Azure infrastructure for the Tennis Journal app
// using Azure Verified Modules (AVM) for best practices and reliability.
// =============================================================================

targetScope = 'resourceGroup'

// =============================================================================
// Parameters
// =============================================================================

@description('The environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environmentName string

@description('The Azure region for all resources')
param location string = resourceGroup().location

@description('The base name for all resources')
param baseName string = 'tennisjournal'

@description('Tags to apply to all resources')
param tags object = {}

@description('The container image for the frontend app (include registry, repository, and tag)')
param frontendContainerImage string = ''

// =============================================================================
// Variables
// =============================================================================

var resourcePrefix = '${baseName}-${environmentName}'
var uniqueSuffix = uniqueString(resourceGroup().id, baseName, environmentName)

// SKU configurations per environment
var appServicePlanSku = {
  dev: {
    name: 'B1'
    tier: 'Basic'
    capacity: 1
  }
  staging: {
    name: 'S1'
    tier: 'Standard'
    capacity: 1
  }
  prod: {
    name: 'P1v3'
    tier: 'PremiumV3'
    capacity: 2
  }
}

var defaultTags = union(tags, {
  Environment: environmentName
  Application: 'Tennis Journal'
  ManagedBy: 'Bicep'
})

// Cosmos DB throughput configuration per environment
var cosmosDbThroughput = {
  dev: {
    maxThroughput: 1000 // Autoscale 100-1000 RU/s for dev
  }
  staging: {
    maxThroughput: 4000 // Autoscale 400-4000 RU/s for staging
  }
  prod: {
    maxThroughput: 10000 // Autoscale 1000-10000 RU/s for prod
  }
}

// Container Apps resource configuration per environment
var containerAppsCpu = {
  dev: '0.25'
  staging: '0.5'
  prod: '1.0'
}

var containerAppsMemory = {
  dev: '0.5Gi'
  staging: '1Gi'
  prod: '2Gi'
}

// Container Registry name (must be globally unique, alphanumeric only, 5-50 chars)
var containerRegistryName = 'crtj${environmentName}${shortUniqueSuffix}'

// =============================================================================
// Modules
// =============================================================================

// Log Analytics Workspace - Required for Application Insights
module logAnalytics 'br/public:avm/res/operational-insights/workspace:0.9.1' = {
  name: 'logAnalyticsDeployment'
  params: {
    name: 'log-${resourcePrefix}-${uniqueSuffix}'
    location: location
    tags: defaultTags
    skuName: 'PerGB2018'
    dataRetention: environmentName == 'prod' ? 90 : 30
  }
}

// Application Insights - For monitoring and telemetry
module appInsights 'br/public:avm/res/insights/component:0.6.0' = {
  name: 'appInsightsDeployment'
  params: {
    name: 'appi-${resourcePrefix}'
    location: location
    tags: defaultTags
    workspaceResourceId: logAnalytics.outputs.resourceId
    kind: 'web'
    applicationType: 'web'
  }
}

// App Service Plan - For hosting the backend API
module appServicePlan 'br/public:avm/res/web/serverfarm:0.4.1' = {
  name: 'appServicePlanDeployment'
  params: {
    name: 'asp-${resourcePrefix}'
    location: location
    tags: defaultTags
    skuName: appServicePlanSku[environmentName].name
    skuCapacity: appServicePlanSku[environmentName].capacity
    kind: 'linux'
    reserved: true // Required for Linux
  }
}

// Web App - Backend .NET 9 API
module apiWebApp 'br/public:avm/res/web/site:0.15.1' = {
  name: 'apiWebAppDeployment'
  params: {
    name: 'app-${resourcePrefix}-api-${uniqueSuffix}'
    location: location
    tags: defaultTags
    kind: 'app,linux'
    serverFarmResourceId: appServicePlan.outputs.resourceId
    managedIdentities: {
      systemAssigned: true
    }
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|9.0'
      alwaysOn: environmentName != 'dev'
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      healthCheckPath: '/health'
    }
    appSettingsKeyValuePairs: {
      APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.outputs.connectionString
      ASPNETCORE_ENVIRONMENT: environmentName == 'prod' ? 'Production' : 'Development'
      WEBSITE_RUN_FROM_PACKAGE: '1'
      // Cosmos DB settings will be added after cosmosDb module is deployed
    }
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    clientAffinityEnabled: false
  }
}

// =============================================================================
// Container Apps Infrastructure for Frontend
// =============================================================================

// Azure Container Registry - For storing container images
module containerRegistry 'br/public:avm/res/container-registry/registry:0.8.0' = {
  name: 'containerRegistryDeployment'
  params: {
    name: containerRegistryName
    location: location
    tags: defaultTags
    acrSku: environmentName == 'prod' ? 'Standard' : 'Basic'
    acrAdminUserEnabled: false // Use managed identity instead
    publicNetworkAccess: 'Enabled'
    // Diagnostic settings
    diagnosticSettings: [
      {
        workspaceResourceId: logAnalytics.outputs.resourceId
        logCategoriesAndGroups: [
          { categoryGroup: 'allLogs' }
        ]
      }
    ]
  }
}

// Container Apps Managed Environment - Shared environment for container apps
module containerAppsEnvironment 'br/public:avm/res/app/managed-environment:0.10.1' = {
  name: 'containerAppsEnvironmentDeployment'
  params: {
    name: 'cae-${resourcePrefix}'
    location: location
    tags: defaultTags
    logAnalyticsWorkspaceResourceId: logAnalytics.outputs.resourceId
    zoneRedundant: environmentName == 'prod'
    publicNetworkAccess: 'Enabled'
  }
}

// Container App - Frontend Next.js application
module frontendContainerApp 'br/public:avm/res/app/container-app:0.14.0' = {
  name: 'frontendContainerAppDeployment'
  params: {
    name: 'ca-${resourcePrefix}-web'
    location: location
    tags: defaultTags
    environmentResourceId: containerAppsEnvironment.outputs.resourceId
    managedIdentities: {
      systemAssigned: true
    }
    // Container configuration
    containers: [
      {
        name: 'frontend'
        image: !empty(frontendContainerImage) ? frontendContainerImage : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
        resources: {
          cpu: json(containerAppsCpu[environmentName])
          memory: containerAppsMemory[environmentName]
        }
        env: [
          {
            name: 'NODE_ENV'
            value: environmentName == 'prod' ? 'production' : 'development'
          }
          {
            name: 'PORT'
            value: '3000'
          }
          {
            name: 'HOSTNAME'
            value: '0.0.0.0'
          }
          {
            name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
            value: appInsights.outputs.connectionString
          }
        ]
      }
    ]
    // Ingress configuration - expose the app publicly
    ingressExternal: true
    ingressTargetPort: 3000
    ingressTransport: 'auto'
    ingressAllowInsecure: false
    // Scale configuration using scaleSettings
    scaleSettings: {
      minReplicas: environmentName == 'prod' ? 1 : 0 // Scale to zero in dev to save costs
      maxReplicas: environmentName == 'prod' ? 10 : 3
      rules: [
        {
          name: 'http-rule'
          http: {
            metadata: {
              concurrentRequests: '100'
            }
          }
        }
      ]
    }
    // Note: Registry configuration is added via az containerapp update after role assignment
    // This avoids circular dependency issues during initial deployment
  }
}

// Reference the Container Registry for role assignment scope
// Using the known name (from variables) allows Bicep to resolve this at deployment start
resource containerRegistryRef 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: containerRegistryName
}

// Role assignment for Container App to pull images from ACR
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, containerRegistryName, 'ca-${resourcePrefix}-web', 'AcrPull')
  scope: containerRegistryRef
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull
    principalId: frontendContainerApp.outputs.systemAssignedMIPrincipalId!
    principalType: 'ServicePrincipal'
  }
  dependsOn: [containerRegistry]
}

// Azure Cosmos DB - NoSQL database for storing Users, Sessions, and Strings
module cosmosDb 'br/public:avm/res/document-db/database-account:0.11.2' = {
  name: 'cosmosDbDeployment'
  params: {
    name: cosmosDbAccountName
    location: location
    tags: defaultTags
    // Use serverless for dev to minimize costs
    capabilitiesToAdd: environmentName == 'dev' ? ['EnableServerless'] : []
    // Enable public network access for dev, can be restricted for prod
    networkRestrictions: {
      publicNetworkAccess: 'Enabled'
      networkAclBypass: 'AzureServices'
    }
    // Disable local auth in prod for security (use managed identity)
    disableLocalAuth: environmentName == 'prod'
    // Allow key-based writes in dev for easier local development
    disableKeyBasedMetadataWriteAccess: environmentName == 'prod'
    // Failover location (single region, with zone redundancy for prod)
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: environmentName == 'prod'
      }
    ]
    // Backup configuration
    backupPolicyType: environmentName == 'prod' ? 'Continuous' : 'Periodic'
    backupIntervalInMinutes: 240
    backupRetentionIntervalInHours: environmentName == 'prod' ? 720 : 8
    // SQL databases and containers
    sqlDatabases: [
      {
        name: 'TennisJournal'
        // Use autoscale for non-serverless (staging/prod)
        autoscaleSettingsMaxThroughput: environmentName != 'dev' ? cosmosDbThroughput[environmentName].maxThroughput : null
        containers: [
          {
            name: 'Users'
            paths: ['/id'] // Partition by user id for single-user lookups
            indexingPolicy: {
              automatic: true
            }
          }
          {
            name: 'Sessions'
            paths: ['/userId'] // Partition by userId for multi-tenant support
            indexingPolicy: {
              automatic: true
            }
          }
          {
            name: 'Strings'
            paths: ['/userId'] // Partition by userId for multi-tenant support
            indexingPolicy: {
              automatic: true
            }
          }
        ]
      }
    ]
    // Diagnostic settings for monitoring
    diagnosticSettings: [
      {
        workspaceResourceId: logAnalytics.outputs.resourceId
        logCategoriesAndGroups: [
          { categoryGroup: 'allLogs' }
        ]
        metricCategories: [
          { category: 'Requests' }
        ]
      }
    ]
  }
}

// Key Vault - For secure storage of secrets (must be deployed before CosmosDB for secrets export)
module keyVault 'br/public:avm/res/key-vault/vault:0.11.2' = {
  name: 'keyVaultDeployment'
  params: {
    name: keyVaultName
    location: location
    tags: defaultTags
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: environmentName == 'prod' ? 90 : 7
    // Allow the API web app managed identity to read secrets
    roleAssignments: [
      {
        principalId: apiWebApp.outputs.systemAssignedMIPrincipalId!
        roleDefinitionIdOrName: 'Key Vault Secrets User'
        principalType: 'ServicePrincipal'
      }
    ]
    // Store the Cosmos DB endpoint as a secret
    secrets: [
      {
        name: 'CosmosDbEndpoint'
        value: cosmosDb.outputs.endpoint
      }
    ]
    // Diagnostic settings
    diagnosticSettings: [
      {
        workspaceResourceId: logAnalytics.outputs.resourceId
        logCategoriesAndGroups: [
          { categoryGroup: 'allLogs' }
        ]
      }
    ]
  }
}

// Compute names for role assignment (must be deterministic)
// Note: Key Vault names must be 3-24 characters, Cosmos DB names must be 3-44 characters
var shortUniqueSuffix = substring(uniqueSuffix, 0, 6)
var cosmosDbAccountName = 'cosmos-${baseName}-${environmentName}-${shortUniqueSuffix}'
var apiWebAppName = 'app-${resourcePrefix}-api-${uniqueSuffix}'
var keyVaultName = 'kv-tj-${environmentName}-${shortUniqueSuffix}'
var roleAssignmentName = guid(resourceGroup().id, cosmosDbAccountName, apiWebAppName, 'CosmosDbDataContributor')

// Role assignment for API Web App to access Cosmos DB (using managed identity instead of keys)
// This grants the Cosmos DB Built-in Data Contributor role to the API's managed identity
resource cosmosDbRoleAssignment 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2024-11-15' = {
  name: '${cosmosDbAccountName}/${roleAssignmentName}'
  properties: {
    roleDefinitionId: '${subscription().id}/resourceGroups/${resourceGroup().name}/providers/Microsoft.DocumentDB/databaseAccounts/${cosmosDbAccountName}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002' // Built-in Data Contributor
    principalId: apiWebApp.outputs.systemAssignedMIPrincipalId!
    scope: '${subscription().id}/resourceGroups/${resourceGroup().name}/providers/Microsoft.DocumentDB/databaseAccounts/${cosmosDbAccountName}'
  }
  dependsOn: [
    cosmosDb
  ]
}

// Update API Web App settings to include Cosmos DB configuration
// This is done as a separate resource to avoid circular dependencies
resource apiWebAppCosmosSettings 'Microsoft.Web/sites/config@2023-12-01' = {
  name: '${apiWebAppName}/appsettings'
  properties: {
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.outputs.connectionString
    ASPNETCORE_ENVIRONMENT: environmentName == 'prod' ? 'Production' : 'Development'
    WEBSITE_RUN_FROM_PACKAGE: '1'
    // Cosmos DB settings for managed identity access
    CosmosDb__Endpoint: cosmosDb.outputs.endpoint
    CosmosDb__DatabaseName: 'TennisJournal'
    CosmosDb__UseManagedIdentity: 'true'
    // CORS settings - allow frontend Container App to access the API
    Cors__AllowedOrigins__0: 'https://${frontendContainerApp.outputs.fqdn}'
  }
  dependsOn: [
    apiWebApp
  ]
}

// =============================================================================
// Outputs
// =============================================================================

@description('The resource ID of the Log Analytics workspace')
output logAnalyticsWorkspaceId string = logAnalytics.outputs.resourceId

@description('The name of the Log Analytics workspace')
output logAnalyticsWorkspaceName string = logAnalytics.outputs.name

@description('The resource ID of Application Insights')
output appInsightsId string = appInsights.outputs.resourceId

@description('The name of Application Insights')
output appInsightsName string = appInsights.outputs.name

@description('The connection string for Application Insights')
output appInsightsConnectionString string = appInsights.outputs.connectionString

@description('The instrumentation key for Application Insights')
output appInsightsInstrumentationKey string = appInsights.outputs.instrumentationKey

@description('The resource ID of the App Service Plan')
output appServicePlanId string = appServicePlan.outputs.resourceId

@description('The name of the App Service Plan')
output appServicePlanName string = appServicePlan.outputs.name

@description('The resource ID of the API Web App')
output apiWebAppId string = apiWebApp.outputs.resourceId

@description('The name of the API Web App')
output apiWebAppName string = apiWebApp.outputs.name

@description('The default hostname of the API Web App')
output apiWebAppHostname string = apiWebApp.outputs.defaultHostname

@description('The resource ID of the Container Registry')
output containerRegistryId string = containerRegistry.outputs.resourceId

@description('The name of the Container Registry')
output containerRegistryName string = containerRegistry.outputs.name

@description('The login server URL of the Container Registry')
output containerRegistryLoginServer string = containerRegistry.outputs.loginServer

@description('The resource ID of the Container Apps Environment')
output containerAppsEnvironmentId string = containerAppsEnvironment.outputs.resourceId

@description('The name of the Container Apps Environment')
output containerAppsEnvironmentName string = containerAppsEnvironment.outputs.name

@description('The resource ID of the Frontend Container App')
output frontendContainerAppId string = frontendContainerApp.outputs.resourceId

@description('The name of the Frontend Container App')
output frontendContainerAppName string = frontendContainerApp.outputs.name

@description('The FQDN of the Frontend Container App')
output frontendContainerAppFqdn string = frontendContainerApp.outputs.fqdn

@description('The resource ID of the Cosmos DB account')
output cosmosDbAccountId string = cosmosDb.outputs.resourceId

@description('The name of the Cosmos DB account')
output cosmosDbAccountName string = cosmosDb.outputs.name

@description('The endpoint of the Cosmos DB account')
output cosmosDbEndpoint string = cosmosDb.outputs.endpoint

@description('The resource ID of the Key Vault')
output keyVaultId string = keyVault.outputs.resourceId

@description('The name of the Key Vault')
output keyVaultName string = keyVault.outputs.name

@description('The URI of the Key Vault')
output keyVaultUri string = keyVault.outputs.uri
