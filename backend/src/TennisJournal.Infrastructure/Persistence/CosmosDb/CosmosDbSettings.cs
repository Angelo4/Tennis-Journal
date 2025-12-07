namespace TennisJournal.Infrastructure.Persistence.CosmosDb;

public class CosmosDbSettings
{
    public const string SectionName = "CosmosDb";
    
    public string Endpoint { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = "TennisJournal";
    public string StringsContainerName { get; set; } = "Strings";
    public string SessionsContainerName { get; set; } = "Sessions";
    public string UsersContainerName { get; set; } = "Users";
    
    /// <summary>
    /// When true, uses Azure Managed Identity for authentication instead of Key.
    /// Set to true when running in Azure App Service with system-assigned managed identity.
    /// </summary>
    public bool UseManagedIdentity { get; set; } = false;
}
