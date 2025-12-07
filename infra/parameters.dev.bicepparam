using './main.bicep'

// =============================================================================
// Tennis Journal - Dev Environment Parameters
// =============================================================================

param environmentName = 'dev'
param location = 'australiaeast'
param baseName = 'tennisjournal'

param tags = {
  Project: 'Tennis Journal'
  Environment: 'dev'
  CostCenter: 'Development'
}
