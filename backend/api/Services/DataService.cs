using TennisJournal.Api.Models;

namespace TennisJournal.Api.Services;

/// <summary>
/// In-memory data service for development. 
/// Replace with DynamoDB/DocumentDB/CosmosDB implementation for production.
/// </summary>
public interface IDataService
{
    // Tennis Strings
    Task<IEnumerable<TennisString>> GetAllStringsAsync();
    Task<TennisString?> GetStringByIdAsync(string id);
    Task<TennisString> CreateStringAsync(TennisString tennisString);
    Task<TennisString?> UpdateStringAsync(string id, TennisString tennisString);
    Task<bool> DeleteStringAsync(string id);

    // Tennis Sessions
    Task<IEnumerable<TennisSession>> GetAllSessionsAsync();
    Task<TennisSession?> GetSessionByIdAsync(string id);
    Task<TennisSession> CreateSessionAsync(TennisSession session);
    Task<TennisSession?> UpdateSessionAsync(string id, TennisSession session);
    Task<bool> DeleteSessionAsync(string id);
    Task<IEnumerable<TennisSession>> GetSessionsByStringIdAsync(string stringId);
}

public class InMemoryDataService : IDataService
{
    private readonly Dictionary<string, TennisString> _strings = new();
    private readonly Dictionary<string, TennisSession> _sessions = new();

    public InMemoryDataService()
    {
        // Seed some sample data
        SeedData();
    }

    private void SeedData()
    {
        var string1 = new TennisString
        {
            Id = "string-1",
            Brand = "Luxilon",
            Model = "ALU Power",
            Gauge = "16L",
            Type = StringType.Polyester,
            MainTension = 52,
            CrossTension = 50,
            DateStrung = DateTime.UtcNow.AddDays(-14),
            IsActive = true,
            Notes = "Great control and spin"
        };

        var string2 = new TennisString
        {
            Id = "string-2",
            Brand = "Wilson",
            Model = "NXT",
            Gauge = "17",
            Type = StringType.Multifilament,
            MainTension = 55,
            CrossTension = 55,
            DateStrung = DateTime.UtcNow.AddDays(-60),
            DateRemoved = DateTime.UtcNow.AddDays(-7),
            IsActive = false,
            Notes = "Comfortable for arm - removed after 53 days"
        };

        _strings[string1.Id] = string1;
        _strings[string2.Id] = string2;

        var session1 = new TennisSession
        {
            Id = "session-1",
            SessionDate = DateTime.UtcNow.AddDays(-2),
            Type = SessionType.Practice,
            DurationMinutes = 90,
            Location = "Local Tennis Club",
            Surface = CourtSurface.HardCourt,
            StringId = string1.Id,
            StringFeelingRating = 8,
            StringNotes = "Strings felt crisp and responsive",
            Notes = "Worked on serve and forehand"
        };

        var session2 = new TennisSession
        {
            Id = "session-2",
            SessionDate = DateTime.UtcNow.AddDays(-1),
            Type = SessionType.Match,
            DurationMinutes = 120,
            Location = "Community Center",
            Surface = CourtSurface.HardCourt,
            StringId = string1.Id,
            StringFeelingRating = 7,
            StringNotes = "Tension dropping slightly",
            Notes = "Lost in 3 sets but played well"
        };

        _sessions[session1.Id] = session1;
        _sessions[session2.Id] = session2;
    }

    // Tennis Strings Implementation
    public Task<IEnumerable<TennisString>> GetAllStringsAsync()
    {
        return Task.FromResult(_strings.Values.AsEnumerable());
    }

    public Task<TennisString?> GetStringByIdAsync(string id)
    {
        _strings.TryGetValue(id, out var tennisString);
        return Task.FromResult(tennisString);
    }

    public Task<TennisString> CreateStringAsync(TennisString tennisString)
    {
        tennisString.Id = Guid.NewGuid().ToString();
        tennisString.CreatedAt = DateTime.UtcNow;
        tennisString.UpdatedAt = DateTime.UtcNow;
        _strings[tennisString.Id] = tennisString;
        return Task.FromResult(tennisString);
    }

    public Task<TennisString?> UpdateStringAsync(string id, TennisString tennisString)
    {
        if (!_strings.ContainsKey(id))
            return Task.FromResult<TennisString?>(null);

        tennisString.Id = id;
        tennisString.UpdatedAt = DateTime.UtcNow;
        _strings[id] = tennisString;
        return Task.FromResult<TennisString?>(tennisString);
    }

    public Task<bool> DeleteStringAsync(string id)
    {
        return Task.FromResult(_strings.Remove(id));
    }

    // Tennis Sessions Implementation
    public Task<IEnumerable<TennisSession>> GetAllSessionsAsync()
    {
        return Task.FromResult(_sessions.Values.OrderByDescending(s => s.SessionDate).AsEnumerable());
    }

    public Task<TennisSession?> GetSessionByIdAsync(string id)
    {
        _sessions.TryGetValue(id, out var session);
        return Task.FromResult(session);
    }

    public Task<TennisSession> CreateSessionAsync(TennisSession session)
    {
        session.Id = Guid.NewGuid().ToString();
        session.CreatedAt = DateTime.UtcNow;
        session.UpdatedAt = DateTime.UtcNow;
        _sessions[session.Id] = session;
        return Task.FromResult(session);
    }

    public Task<TennisSession?> UpdateSessionAsync(string id, TennisSession session)
    {
        if (!_sessions.ContainsKey(id))
            return Task.FromResult<TennisSession?>(null);

        session.Id = id;
        session.UpdatedAt = DateTime.UtcNow;
        _sessions[id] = session;
        return Task.FromResult<TennisSession?>(session);
    }

    public Task<bool> DeleteSessionAsync(string id)
    {
        return Task.FromResult(_sessions.Remove(id));
    }

    public Task<IEnumerable<TennisSession>> GetSessionsByStringIdAsync(string stringId)
    {
        var sessions = _sessions.Values
            .Where(s => s.StringId == stringId)
            .OrderByDescending(s => s.SessionDate);
        return Task.FromResult(sessions.AsEnumerable());
    }
}
