using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TennisJournal.Application.Interfaces;
using TennisJournal.Infrastructure.Persistence.CosmosDb;

namespace TennisJournal.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure Cosmos DB settings
        services.Configure<CosmosDbSettings>(configuration.GetSection(CosmosDbSettings.SectionName));
        
        // Register CosmosClient as singleton
        services.AddSingleton(sp =>
        {
            var cosmosDbSettings = configuration.GetSection(CosmosDbSettings.SectionName).Get<CosmosDbSettings>()!;
            
            var cosmosClientOptions = new CosmosClientOptions
            {
                SerializerOptions = new CosmosSerializationOptions
                {
                    PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                }
            };
            
            return new CosmosClient(cosmosDbSettings.Endpoint, cosmosDbSettings.Key, cosmosClientOptions);
        });
        
        // Register database initializer
        services.AddSingleton<CosmosDbInitializer>();
        
        // Register repositories as scoped for Cosmos DB implementation
        services.AddScoped<IStringRepository, CosmosStringRepository>();
        services.AddScoped<ISessionRepository, CosmosSessionRepository>();
        
        return services;
    }
    
    /// <summary>
    /// Initialize the Cosmos DB database and containers
    /// </summary>
    public static async Task InitializeCosmosDbAsync(this IServiceProvider serviceProvider)
    {
        var initializer = serviceProvider.GetRequiredService<CosmosDbInitializer>();
        await initializer.InitializeAsync();
    }
}
