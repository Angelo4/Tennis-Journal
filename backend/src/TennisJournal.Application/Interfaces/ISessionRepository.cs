using TennisJournal.Domain.Entities;

namespace TennisJournal.Application.Interfaces;

/// <summary>
/// Repository interface for TennisSession entities
/// </summary>
public interface ISessionRepository
{
    Task<IEnumerable<TennisSession>> GetAllAsync(string userId);
    Task<TennisSession?> GetByIdAsync(string id, string userId);
    Task<TennisSession> CreateAsync(TennisSession session);
    Task<TennisSession?> UpdateAsync(TennisSession session);
    Task<bool> DeleteAsync(string id, string userId);
    Task<IEnumerable<TennisSession>> GetByStringIdAsync(string stringId, string userId);
}
