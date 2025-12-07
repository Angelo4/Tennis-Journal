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
        
        // Create Strings container with userId as partition key for multi-tenant support
        await database.Database.CreateContainerIfNotExistsAsync(
            new ContainerProperties(_settings.StringsContainerName, "/userId")
            {
                IndexingPolicy = new IndexingPolicy
                {
                    Automatic = true,
                    IndexingMode = IndexingMode.Consistent,
                    IncludedPaths = { new IncludedPath { Path = "/*" } },
                    ExcludedPaths = { new ExcludedPath { Path = "/\"_etag\"/?" } }
                }
            });
        
        // Create Sessions container with userId as partition key for multi-tenant support
        await database.Database.CreateContainerIfNotExistsAsync(
            new ContainerProperties(_settings.SessionsContainerName, "/userId")
            {
                IndexingPolicy = new IndexingPolicy
                {
                    Automatic = true,
                    IndexingMode = IndexingMode.Consistent,
                    IncludedPaths = { new IncludedPath { Path = "/*" } },
                    ExcludedPaths = { new ExcludedPath { Path = "/\"_etag\"/?" } }
                }
            });
        
        // Create Users container with id as partition key
        await database.Database.CreateContainerIfNotExistsAsync(
            new ContainerProperties(_settings.UsersContainerName, "/id")
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
