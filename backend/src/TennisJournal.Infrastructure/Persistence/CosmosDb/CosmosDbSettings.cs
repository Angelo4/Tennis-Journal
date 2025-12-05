namespace TennisJournal.Infrastructure.Persistence.CosmosDb;

public class CosmosDbSettings
{
    public const string SectionName = "CosmosDb";
    
    public string Endpoint { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = "TennisJournal";
    public string StringsContainerName { get; set; } = "Strings";
    public string SessionsContainerName { get; set; } = "Sessions";
}
