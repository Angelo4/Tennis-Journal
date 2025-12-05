using TennisJournal.Application.DTOs.Sessions;
using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Application.Interfaces;
using TennisJournal.Domain.Entities;

namespace TennisJournal.Application.Services;

public interface ISessionService
{
    Task<IEnumerable<SessionResponse>> GetAllAsync();
    Task<SessionResponse?> GetByIdAsync(string id);
    Task<SessionWithStringResponse?> GetWithStringAsync(string id);
    Task<SessionResponse> CreateAsync(CreateSessionRequest request);
    Task<SessionResponse?> UpdateAsync(string id, UpdateSessionRequest request);
    Task<bool> DeleteAsync(string id);
    Task<bool> StringExistsAsync(string stringId);
}

public class SessionService : ISessionService
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IStringRepository _stringRepository;

    public SessionService(ISessionRepository sessionRepository, IStringRepository stringRepository)
    {
        _sessionRepository = sessionRepository;
        _stringRepository = stringRepository;
    }

    public async Task<IEnumerable<SessionResponse>> GetAllAsync()
    {
        var sessions = await _sessionRepository.GetAllAsync();
        return sessions.Select(MapToResponse);
    }

    public async Task<SessionResponse?> GetByIdAsync(string id)
    {
        var session = await _sessionRepository.GetByIdAsync(id);
        return session != null ? MapToResponse(session) : null;
    }

    public async Task<SessionWithStringResponse?> GetWithStringAsync(string id)
    {
        var session = await _sessionRepository.GetByIdAsync(id);
        if (session == null)
            return null;

        StringResponse? stringResponse = null;
        if (!string.IsNullOrEmpty(session.StringId))
        {
            var tennisString = await _stringRepository.GetByIdAsync(session.StringId);
            if (tennisString != null)
            {
                stringResponse = MapStringToResponse(tennisString);
            }
        }

        return new SessionWithStringResponse(
            Session: MapToResponse(session),
            String: stringResponse
        );
    }

    public async Task<SessionResponse> CreateAsync(CreateSessionRequest request)
    {
        var session = new TennisSession
        {
            SessionDate = request.SessionDate,
            Type = request.Type,
            DurationMinutes = request.DurationMinutes,
            Location = request.Location,
            Surface = request.Surface,
            StringId = request.StringId,
            StringFeelingRating = request.StringFeelingRating,
            StringNotes = request.StringNotes,
            Notes = request.Notes
        };

        var created = await _sessionRepository.CreateAsync(session);
        return MapToResponse(created);
    }

    public async Task<SessionResponse?> UpdateAsync(string id, UpdateSessionRequest request)
    {
        var existing = await _sessionRepository.GetByIdAsync(id);
        if (existing == null)
            return null;

        existing.SessionDate = request.SessionDate ?? existing.SessionDate;
        existing.Type = request.Type ?? existing.Type;
        existing.DurationMinutes = request.DurationMinutes ?? existing.DurationMinutes;
        existing.Location = request.Location ?? existing.Location;
        existing.Surface = request.Surface ?? existing.Surface;
        existing.StringId = request.StringId ?? existing.StringId;
        existing.StringFeelingRating = request.StringFeelingRating ?? existing.StringFeelingRating;
        existing.StringNotes = request.StringNotes ?? existing.StringNotes;
        existing.Notes = request.Notes ?? existing.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _sessionRepository.UpdateAsync(existing);
        return updated != null ? MapToResponse(updated) : null;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        return await _sessionRepository.DeleteAsync(id);
    }

    public async Task<bool> StringExistsAsync(string stringId)
    {
        var tennisString = await _stringRepository.GetByIdAsync(stringId);
        return tennisString != null;
    }

    private static SessionResponse MapToResponse(TennisSession entity) => new(
        Id: entity.Id,
        SessionDate: entity.SessionDate,
        Type: entity.Type,
        DurationMinutes: entity.DurationMinutes,
        Location: entity.Location,
        Surface: entity.Surface,
        StringId: entity.StringId,
        StringFeelingRating: entity.StringFeelingRating,
        StringNotes: entity.StringNotes,
        Notes: entity.Notes,
        CreatedAt: entity.CreatedAt,
        UpdatedAt: entity.UpdatedAt
    );

    private static StringResponse MapStringToResponse(TennisString entity) => new(
        Id: entity.Id,
        Brand: entity.Brand,
        Model: entity.Model,
        Gauge: entity.Gauge,
        Type: entity.Type,
        MainTension: entity.MainTension,
        CrossTension: entity.CrossTension,
        DateStrung: entity.DateStrung,
        DateRemoved: entity.DateRemoved,
        IsActive: entity.IsActive,
        Notes: entity.Notes,
        CreatedAt: entity.CreatedAt,
        UpdatedAt: entity.UpdatedAt
    );
}
