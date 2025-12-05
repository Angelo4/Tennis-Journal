using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;

namespace TennisJournal.Infrastructure.Persistence.CosmosDb;

public class CosmosDbInitializer
{
    private readonly CosmosClient _cosmosClient;
    private readonly CosmosDbSettings _settings;

    public CosmosDbInitializer(CosmosClient cosmosClient, IOptions<CosmosDbSettings> settings)
    {
        _cosmosClient = cosmosClient;
        _settings = settings.Value;
    }

    public async Task InitializeAsync()
    {
        // Create database if it doesn't exist
        var database = await _cosmosClient.CreateDatabaseIfNotExistsAsync(_settings.DatabaseName);
        
        // Create Strings container with Id as partition key
        await database.Database.CreateContainerIfNotExistsAsync(
            new ContainerProperties(_settings.StringsContainerName, "/id")
            {
                IndexingPolicy = new IndexingPolicy
                {
                    Automatic = true,
                    IndexingMode = IndexingMode.Consistent,
                    IncludedPaths = { new IncludedPath { Path = "/*" } },
                    ExcludedPaths = { new ExcludedPath { Path = "/\"_etag\"/?" } }
                }
            });
        
        // Create Sessions container with Id as partition key
        await database.Database.CreateContainerIfNotExistsAsync(
            new ContainerProperties(_settings.SessionsContainerName, "/id")
            {
                IndexingPolicy = new IndexingPolicy
                {
                    Automatic = true,
                    IndexingMode = IndexingMode.Consistent,
                    IncludedPaths = { new IncludedPath { Path = "/*" } },
                    ExcludedPaths = { new ExcludedPath { Path = "/\"_etag\"/?" } }
                }
            });
    }
}
