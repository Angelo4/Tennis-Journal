using Microsoft.Extensions.DependencyInjection;
using TennisJournal.Application.Services;

namespace TennisJournal.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IStringService, StringService>();
        services.AddScoped<ISessionService, SessionService>();
        services.AddScoped<IAuthService, AuthService>();
        
        return services;
    }
}
