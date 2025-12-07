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

    public async Task<IEnumerable<TennisString>> GetAllAsync(string userId, bool? isActive = null)
    {
        var queryText = isActive.HasValue
            ? $"SELECT * FROM c WHERE c.userId = @userId AND c.isActive = {isActive.Value.ToString().ToLower()}"
            : "SELECT * FROM c WHERE c.userId = @userId";

        var query = _container.GetItemQueryIterator<TennisString>(
            new QueryDefinition(queryText).WithParameter("@userId", userId),
            requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(userId) });
        var results = new List<TennisString>();

        while (query.HasMoreResults)
        {
            var response = await query.ReadNextAsync();
            results.AddRange(response);
        }

        return results.OrderByDescending(s => s.DateStrung);
    }

    public async Task<TennisString?> GetByIdAsync(string id, string userId)
    {
        try
        {
            var response = await _container.ReadItemAsync<TennisString>(id, new PartitionKey(userId));
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

        var response = await _container.CreateItemAsync(tennisString, new PartitionKey(tennisString.UserId));
        return response.Resource;
    }

    public async Task<TennisString?> UpdateAsync(TennisString tennisString)
    {
        try
        {
            tennisString.UpdatedAt = DateTime.UtcNow;
            var response = await _container.ReplaceItemAsync(tennisString, tennisString.Id, new PartitionKey(tennisString.UserId));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<bool> DeleteAsync(string id, string userId)
    {
        try
        {
            await _container.DeleteItemAsync<TennisString>(id, new PartitionKey(userId));
            return true;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }
}
