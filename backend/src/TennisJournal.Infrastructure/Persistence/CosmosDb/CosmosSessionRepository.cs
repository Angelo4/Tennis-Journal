using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using TennisJournal.Application.Interfaces;
using TennisJournal.Domain.Entities;

namespace TennisJournal.Infrastructure.Persistence.CosmosDb;

public class CosmosSessionRepository : ISessionRepository
{
    private readonly Container _container;

    public CosmosSessionRepository(CosmosClient cosmosClient, IOptions<CosmosDbSettings> settings)
    {
        var database = cosmosClient.GetDatabase(settings.Value.DatabaseName);
        _container = database.GetContainer(settings.Value.SessionsContainerName);
    }

    public async Task<IEnumerable<TennisSession>> GetAllAsync()
    {
        var query = _container.GetItemQueryIterator<TennisSession>(
            new QueryDefinition("SELECT * FROM c ORDER BY c.sessionDate DESC"));
        
        var results = new List<TennisSession>();

        while (query.HasMoreResults)
        {
            var response = await query.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }

    public async Task<TennisSession?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _container.ReadItemAsync<TennisSession>(id, new PartitionKey(id));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<IEnumerable<TennisSession>> GetByStringIdAsync(string stringId)
    {
        var query = _container.GetItemQueryIterator<TennisSession>(
            new QueryDefinition("SELECT * FROM c WHERE c.stringId = @stringId ORDER BY c.sessionDate DESC")
                .WithParameter("@stringId", stringId));
        
        var results = new List<TennisSession>();

        while (query.HasMoreResults)
        {
            var response = await query.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }

    public async Task<TennisSession> CreateAsync(TennisSession session)
    {
        session.Id = Guid.NewGuid().ToString();
        session.CreatedAt = DateTime.UtcNow;
        session.UpdatedAt = DateTime.UtcNow;

        var response = await _container.CreateItemAsync(session, new PartitionKey(session.Id));
        return response.Resource;
    }

    public async Task<TennisSession?> UpdateAsync(TennisSession session)
    {
        try
        {
            session.UpdatedAt = DateTime.UtcNow;
            var response = await _container.ReplaceItemAsync(session, session.Id, new PartitionKey(session.Id));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        try
        {
            await _container.DeleteItemAsync<TennisSession>(id, new PartitionKey(id));
            return true;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }
}
