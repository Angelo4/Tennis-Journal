using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using TennisJournal.Application.Interfaces;
using DomainUser = TennisJournal.Domain.Entities.User;

namespace TennisJournal.Infrastructure.Persistence.CosmosDb;

public class CosmosUserRepository : IUserRepository
{
    private readonly Container _container;

    public CosmosUserRepository(CosmosClient cosmosClient, IOptions<CosmosDbSettings> settings)
    {
        var database = cosmosClient.GetDatabase(settings.Value.DatabaseName);
        _container = database.GetContainer(settings.Value.UsersContainerName);
    }

    public async Task<DomainUser?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _container.ReadItemAsync<DomainUser>(id, new PartitionKey(id));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<DomainUser?> GetByEmailAsync(string email)
    {
        var query = _container.GetItemQueryIterator<DomainUser>(
            new QueryDefinition("SELECT * FROM c WHERE c.email = @email")
                .WithParameter("@email", email.ToLowerInvariant()));

        while (query.HasMoreResults)
        {
            var response = await query.ReadNextAsync();
            var user = response.FirstOrDefault();
            if (user != null)
            {
                return user;
            }
        }

        return null;
    }

    public async Task<DomainUser?> GetByGoogleIdAsync(string googleId)
    {
        var query = _container.GetItemQueryIterator<DomainUser>(
            new QueryDefinition("SELECT * FROM c WHERE c.googleId = @googleId")
                .WithParameter("@googleId", googleId));

        while (query.HasMoreResults)
        {
            var response = await query.ReadNextAsync();
            var user = response.FirstOrDefault();
            if (user != null)
            {
                return user;
            }
        }

        return null;
    }

    public async Task<DomainUser> CreateAsync(DomainUser user)
    {
        user.Id = Guid.NewGuid().ToString();
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        var response = await _container.CreateItemAsync(user, new PartitionKey(user.Id));
        return response.Resource;
    }

    public async Task<DomainUser?> UpdateAsync(DomainUser user)
    {
        try
        {
            user.UpdatedAt = DateTime.UtcNow;
            var response = await _container.ReplaceItemAsync(user, user.Id, new PartitionKey(user.Id));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<bool> ExistsAsync(string email)
    {
        var user = await GetByEmailAsync(email);
        return user != null;
    }
}
