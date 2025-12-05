using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using TennisJournal.Application.Interfaces;
using TennisJournal.Domain.Entities;

namespace TennisJournal.Infrastructure.Persistence.CosmosDb;

public class CosmosStringRepository : IStringRepository
{
    private readonly Container _container;

    public CosmosStringRepository(CosmosClient cosmosClient, IOptions<CosmosDbSettings> settings)
    {
        var database = cosmosClient.GetDatabase(settings.Value.DatabaseName);
        _container = database.GetContainer(settings.Value.StringsContainerName);
    }

    public async Task<IEnumerable<TennisString>> GetAllAsync(bool? isActive = null)
    {
        var queryText = isActive.HasValue
            ? $"SELECT * FROM c WHERE c.isActive = {isActive.Value.ToString().ToLower()}"
            : "SELECT * FROM c";

        var query = _container.GetItemQueryIterator<TennisString>(new QueryDefinition(queryText));
        var results = new List<TennisString>();

        while (query.HasMoreResults)
        {
            var response = await query.ReadNextAsync();
            results.AddRange(response);
        }

        return results.OrderByDescending(s => s.DateStrung);
    }

    public async Task<TennisString?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _container.ReadItemAsync<TennisString>(id, new PartitionKey(id));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<TennisString> CreateAsync(TennisString tennisString)
    {
        tennisString.Id = Guid.NewGuid().ToString();
        tennisString.CreatedAt = DateTime.UtcNow;
        tennisString.UpdatedAt = DateTime.UtcNow;

        var response = await _container.CreateItemAsync(tennisString, new PartitionKey(tennisString.Id));
        return response.Resource;
    }

    public async Task<TennisString?> UpdateAsync(TennisString tennisString)
    {
        try
        {
            tennisString.UpdatedAt = DateTime.UtcNow;
            var response = await _container.ReplaceItemAsync(tennisString, tennisString.Id, new PartitionKey(tennisString.Id));
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
            await _container.DeleteItemAsync<TennisString>(id, new PartitionKey(id));
            return true;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }
}
