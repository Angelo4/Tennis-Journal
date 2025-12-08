using TennisJournal.Application.DTOs.Sessions;
using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Application.Helpers;
using TennisJournal.Application.Interfaces;
using TennisJournal.Domain.Entities;

namespace TennisJournal.Application.Services;

public interface ISessionService
{
    Task<IEnumerable<SessionResponse>> GetAllAsync(string userId);
    Task<SessionResponse?> GetByIdAsync(string id, string userId);
    Task<SessionWithStringResponse?> GetWithStringAsync(string id, string userId);
    Task<SessionResponse> CreateAsync(CreateSessionRequest request, string userId);
    Task<SessionResponse?> UpdateAsync(string id, UpdateSessionRequest request, string userId);
    Task<bool> DeleteAsync(string id, string userId);
    Task<bool> StringExistsAsync(string stringId, string userId);
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

    public async Task<IEnumerable<SessionResponse>> GetAllAsync(string userId)
    {
        var sessions = await _sessionRepository.GetAllAsync(userId);
        return sessions.Select(MapToResponse);
    }

    public async Task<SessionResponse?> GetByIdAsync(string id, string userId)
    {
        var session = await _sessionRepository.GetByIdAsync(id, userId);
        return session != null ? MapToResponse(session) : null;
    }

    public async Task<SessionWithStringResponse?> GetWithStringAsync(string id, string userId)
    {
        var session = await _sessionRepository.GetByIdAsync(id, userId);
        if (session == null)
            return null;

        StringResponse? stringResponse = null;
        if (!string.IsNullOrEmpty(session.StringId))
        {
            var tennisString = await _stringRepository.GetByIdAsync(session.StringId, userId);
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

    public async Task<SessionResponse> CreateAsync(CreateSessionRequest request, string userId)
    {
        var session = new TennisSession
        {
            UserId = userId,
            SessionDate = request.SessionDate,
            Type = request.Type,
            DurationMinutes = request.DurationMinutes,
            Location = request.Location,
            Surface = request.Surface,
            StringId = request.StringId,
            StringFeelingRating = request.StringFeelingRating,
            StringNotes = request.StringNotes,
            Notes = request.Notes,
            YouTubeVideoUrl = request.YouTubeVideoUrl,
            VideoTimestamps = MapVideoTimestamps(request.VideoTimestamps)
        };

        var created = await _sessionRepository.CreateAsync(session);
        return MapToResponse(created);
    }

    public async Task<SessionResponse?> UpdateAsync(string id, UpdateSessionRequest request, string userId)
    {
        var existing = await _sessionRepository.GetByIdAsync(id, userId);
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
        
        // Update video fields
        if (request.YouTubeVideoUrl != null)
            existing.YouTubeVideoUrl = request.YouTubeVideoUrl;
        if (request.VideoTimestamps != null)
            existing.VideoTimestamps = MapVideoTimestamps(request.VideoTimestamps);
        
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _sessionRepository.UpdateAsync(existing);
        return updated != null ? MapToResponse(updated) : null;
    }

    public async Task<bool> DeleteAsync(string id, string userId)
    {
        return await _sessionRepository.DeleteAsync(id, userId);
    }

    public async Task<bool> StringExistsAsync(string stringId, string userId)
    {
        var tennisString = await _stringRepository.GetByIdAsync(stringId, userId);
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
        UpdatedAt: entity.UpdatedAt,
        YouTubeVideoUrl: entity.YouTubeVideoUrl,
        VideoTimestamps: entity.VideoTimestamps?
            .OrderBy(t => t.TimeInSeconds)
            .Select(t => new VideoTimestampDto(
                TimeInSeconds: t.TimeInSeconds,
                Label: t.Label,
                Notes: t.Notes,
                CreatedAt: t.CreatedAt
            ))
            .ToList()
    );
    
    private static List<VideoTimestamp>? MapVideoTimestamps(List<VideoTimestampDto>? dtos)
    {
        if (dtos == null || !dtos.Any())
            return null;
            
        return dtos
            .OrderBy(dto => dto.TimeInSeconds)
            .Select(dto => new VideoTimestamp
            {
                TimeInSeconds = dto.TimeInSeconds,
                Label = dto.Label,
                Notes = dto.Notes,
                CreatedAt = dto.CreatedAt
            })
            .ToList();
    }

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
        Status: entity.Status,
        Notes: entity.Notes,
        CreatedAt: entity.CreatedAt,
        UpdatedAt: entity.UpdatedAt
    );
}
