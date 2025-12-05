using Microsoft.Extensions.DependencyInjection;
using TennisJournal.Application.Interfaces;
using TennisJournal.Infrastructure.Persistence;

namespace TennisJournal.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // Register repositories as singletons for in-memory implementation
        // Change to Scoped when using actual database
        services.AddSingleton<IStringRepository, InMemoryStringRepository>();
        services.AddSingleton<ISessionRepository, InMemorySessionRepository>();
        
        return services;
    }
}
