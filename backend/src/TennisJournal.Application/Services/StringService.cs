using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Application.Interfaces;
using TennisJournal.Domain.Entities;

namespace TennisJournal.Application.Services;

public interface IStringService
{
    Task<IEnumerable<StringResponse>> GetAllAsync(string userId, bool? isActive = null);
    Task<StringResponse?> GetByIdAsync(string id, string userId);
    Task<StringResponse> CreateAsync(CreateStringRequest request, string userId);
    Task<StringResponse?> UpdateAsync(string id, UpdateStringRequest request, string userId);
    Task<bool> DeleteAsync(string id, string userId);
    Task<StringResponse?> RemoveAsync(string id, string userId);
    Task<StringResponse?> RestoreAsync(string id, string userId);
    Task<StringUsageStatsResponse?> GetUsageStatsAsync(string id, string userId);
}

public class StringService : IStringService
{
    private readonly IStringRepository _stringRepository;
    private readonly ISessionRepository _sessionRepository;

    public StringService(IStringRepository stringRepository, ISessionRepository sessionRepository)
    {
        _stringRepository = stringRepository;
        _sessionRepository = sessionRepository;
    }

    public async Task<IEnumerable<StringResponse>> GetAllAsync(string userId, bool? isActive = null)
    {
        var strings = await _stringRepository.GetAllAsync(userId, isActive);
        return strings.Select(MapToResponse);
    }

    public async Task<StringResponse?> GetByIdAsync(string id, string userId)
    {
        var tennisString = await _stringRepository.GetByIdAsync(id, userId);
        return tennisString != null ? MapToResponse(tennisString) : null;
    }

    public async Task<StringResponse> CreateAsync(CreateStringRequest request, string userId)
    {
        var tennisString = new TennisString
        {
            UserId = userId,
            Brand = request.Brand,
            Model = request.Model,
            Gauge = request.Gauge,
            Type = request.Type,
            MainTension = request.MainTension,
            CrossTension = request.CrossTension,
            DateStrung = request.DateStrung,
            IsActive = request.IsActive,
            Notes = request.Notes
        };

        var created = await _stringRepository.CreateAsync(tennisString);
        return MapToResponse(created);
    }

    public async Task<StringResponse?> UpdateAsync(string id, UpdateStringRequest request, string userId)
    {
        var existing = await _stringRepository.GetByIdAsync(id, userId);
        if (existing == null)
            return null;

        existing.Brand = request.Brand ?? existing.Brand;
        existing.Model = request.Model ?? existing.Model;
        existing.Gauge = request.Gauge ?? existing.Gauge;
        existing.Type = request.Type ?? existing.Type;
        existing.MainTension = request.MainTension ?? existing.MainTension;
        existing.CrossTension = request.CrossTension ?? existing.CrossTension;
        existing.DateStrung = request.DateStrung ?? existing.DateStrung;
        existing.DateRemoved = request.DateRemoved ?? existing.DateRemoved;
        existing.IsActive = request.IsActive ?? existing.IsActive;
        existing.Notes = request.Notes ?? existing.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _stringRepository.UpdateAsync(existing);
        return updated != null ? MapToResponse(updated) : null;
    }

    public async Task<bool> DeleteAsync(string id, string userId)
    {
        return await _stringRepository.DeleteAsync(id, userId);
    }

    public async Task<StringResponse?> RemoveAsync(string id, string userId)
    {
        var existing = await _stringRepository.GetByIdAsync(id, userId);
        if (existing == null)
            return null;

        existing.MarkAsRemoved();
        var updated = await _stringRepository.UpdateAsync(existing);
        return updated != null ? MapToResponse(updated) : null;
    }

    public async Task<StringResponse?> RestoreAsync(string id, string userId)
    {
        var existing = await _stringRepository.GetByIdAsync(id, userId);
        if (existing == null)
            return null;

        existing.Restore();
        var updated = await _stringRepository.UpdateAsync(existing);
        return updated != null ? MapToResponse(updated) : null;
    }

    public async Task<StringUsageStatsResponse?> GetUsageStatsAsync(string id, string userId)
    {
        var tennisString = await _stringRepository.GetByIdAsync(id, userId);
        if (tennisString == null)
            return null;

        var sessions = await _sessionRepository.GetByStringIdAsync(id, userId);
        var sessionList = sessions.ToList();

        return new StringUsageStatsResponse(
            StringId: id,
            String: MapToResponse(tennisString),
            TotalSessions: sessionList.Count,
            TotalMinutesPlayed: sessionList.Sum(s => s.DurationMinutes),
            AverageFeelingRating: sessionList
                .Where(s => s.StringFeelingRating.HasValue)
                .Select(s => s.StringFeelingRating!.Value)
                .DefaultIfEmpty(0)
                .Average(),
            DaysSinceStrung: (int)(DateTime.UtcNow - tennisString.DateStrung).TotalDays
        );
    }

    private static StringResponse MapToResponse(TennisString entity) => new(
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
