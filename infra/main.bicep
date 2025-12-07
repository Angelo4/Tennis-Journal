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
module webApp 'br/public:avm/res/web/site:0.15.1' = {
  name: 'webAppDeployment'
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
    }
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    clientAffinityEnabled: false
  }
}

// Static Web App - Frontend Next.js application
module staticWebApp 'br/public:avm/res/web/static-site:0.7.0' = {
  name: 'staticWebAppDeployment'
  params: {
    name: 'stapp-${resourcePrefix}-${uniqueSuffix}'
    location: location
    tags: defaultTags
    sku: environmentName == 'prod' ? 'Standard' : 'Free'
    stagingEnvironmentPolicy: environmentName == 'prod' ? 'Enabled' : 'Disabled'
    allowConfigFileUpdates: true
  }
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

@description('The resource ID of the Web App')
output webAppId string = webApp.outputs.resourceId

@description('The name of the Web App')
output webAppName string = webApp.outputs.name

@description('The default hostname of the Web App')
output webAppHostname string = webApp.outputs.defaultHostname

@description('The resource ID of the Static Web App')
output staticWebAppId string = staticWebApp.outputs.resourceId

@description('The name of the Static Web App')
output staticWebAppName string = staticWebApp.outputs.name

@description('The default hostname of the Static Web App')
output staticWebAppHostname string = staticWebApp.outputs.defaultHostname
