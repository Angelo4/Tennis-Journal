using TennisJournal.Application.Interfaces;
using TennisJournal.Domain.Entities;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Infrastructure.Persistence.InMemory;

/// <summary>
/// In-memory implementation of IStringRepository for development.
/// Replace with actual database implementation (DynamoDB/CosmosDB) for production.
/// </summary>
public class InMemoryStringRepository : IStringRepository
{
    private readonly Dictionary<string, TennisString> _strings = new();
    private static bool _seeded = false;
    private static readonly object _seedLock = new();

    public InMemoryStringRepository()
    {
        lock (_seedLock)
        {
            if (!_seeded)
            {
                SeedData();
                _seeded = true;
            }
        }
    }

    private void SeedData()
    {
        var string1 = new TennisString
        {
            Id = "string-1",
            UserId = "demo-user",
            Brand = "Luxilon",
            Model = "ALU Power",
            Gauge = "16L",
            Type = StringType.Polyester,
            MainTension = 52,
            CrossTension = 50,
            DateStrung = DateTime.UtcNow.AddDays(-14),
            Status = StringStatus.Strung,
            Notes = "Great control and spin"
        };

        var string2 = new TennisString
        {
            Id = "string-2",
            UserId = "demo-user",
            Brand = "Wilson",
            Model = "NXT",
            Gauge = "17",
            Type = StringType.Multifilament,
            MainTension = 55,
            CrossTension = 55,
            DateStrung = DateTime.UtcNow.AddDays(-60),
            DateRemoved = DateTime.UtcNow.AddDays(-7),
            Status = StringStatus.Removed,
            Notes = "Comfortable for arm - removed after 53 days"
        };

        _strings[string1.Id] = string1;
        _strings[string2.Id] = string2;
    }

    public Task<IEnumerable<TennisString>> GetAllAsync(string userId, StringStatus? status = null)
    {
        IEnumerable<TennisString> result = _strings.Values.Where(s => s.UserId == userId);
        
        if (status.HasValue)
        {
            result = result.Where(s => s.Status == status.Value);
        }
        
        return Task.FromResult(result);
    }

    public Task<TennisString?> GetByIdAsync(string id, string userId)
    {
        _strings.TryGetValue(id, out var tennisString);
        if (tennisString?.UserId != userId)
            return Task.FromResult<TennisString?>(null);
        return Task.FromResult<TennisString?>(tennisString);
    }

    public Task<TennisString> CreateAsync(TennisString tennisString)
    {
        tennisString.Id = Guid.NewGuid().ToString();
        tennisString.CreatedAt = DateTime.UtcNow;
        tennisString.UpdatedAt = DateTime.UtcNow;
        _strings[tennisString.Id] = tennisString;
        return Task.FromResult(tennisString);
    }

    public Task<TennisString?> UpdateAsync(TennisString tennisString)
    {
        if (!_strings.ContainsKey(tennisString.Id))
            return Task.FromResult<TennisString?>(null);

        tennisString.UpdatedAt = DateTime.UtcNow;
        _strings[tennisString.Id] = tennisString;
        return Task.FromResult<TennisString?>(tennisString);
    }

    public Task<bool> DeleteAsync(string id, string userId)
    {
        if (_strings.TryGetValue(id, out var tennisString) && tennisString.UserId == userId)
        {
            return Task.FromResult(_strings.Remove(id));
        }
        return Task.FromResult(false);
    }
}
