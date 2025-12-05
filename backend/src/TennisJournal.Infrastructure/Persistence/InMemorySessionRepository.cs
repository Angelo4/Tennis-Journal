using TennisJournal.Application.Interfaces;
using TennisJournal.Domain.Entities;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Infrastructure.Persistence;

/// <summary>
/// In-memory implementation of ISessionRepository for development.
/// Replace with actual database implementation (DynamoDB/CosmosDB) for production.
/// </summary>
public class InMemorySessionRepository : ISessionRepository
{
    private readonly Dictionary<string, TennisSession> _sessions = new();
    private static bool _seeded = false;
    private static readonly object _seedLock = new();

    public InMemorySessionRepository()
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
        var session1 = new TennisSession
        {
            Id = "session-1",
            SessionDate = DateTime.UtcNow.AddDays(-2),
            Type = SessionType.Practice,
            DurationMinutes = 90,
            Location = "Local Tennis Club",
            Surface = CourtSurface.HardCourt,
            StringId = "string-1",
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
            StringId = "string-1",
            StringFeelingRating = 7,
            StringNotes = "Tension dropping slightly",
            Notes = "Lost in 3 sets but played well"
        };

        _sessions[session1.Id] = session1;
        _sessions[session2.Id] = session2;
    }

    public Task<IEnumerable<TennisSession>> GetAllAsync()
    {
        return Task.FromResult(_sessions.Values.OrderByDescending(s => s.SessionDate).AsEnumerable());
    }

    public Task<TennisSession?> GetByIdAsync(string id)
    {
        _sessions.TryGetValue(id, out var session);
        return Task.FromResult(session);
    }

    public Task<TennisSession> CreateAsync(TennisSession session)
    {
        session.Id = Guid.NewGuid().ToString();
        session.CreatedAt = DateTime.UtcNow;
        session.UpdatedAt = DateTime.UtcNow;
        _sessions[session.Id] = session;
        return Task.FromResult(session);
    }

    public Task<TennisSession?> UpdateAsync(TennisSession session)
    {
        if (!_sessions.ContainsKey(session.Id))
            return Task.FromResult<TennisSession?>(null);

        session.UpdatedAt = DateTime.UtcNow;
        _sessions[session.Id] = session;
        return Task.FromResult<TennisSession?>(session);
    }

    public Task<bool> DeleteAsync(string id)
    {
        return Task.FromResult(_sessions.Remove(id));
    }

    public Task<IEnumerable<TennisSession>> GetByStringIdAsync(string stringId)
    {
        var sessions = _sessions.Values.Where(s => s.StringId == stringId);
        return Task.FromResult(sessions);
    }
}
