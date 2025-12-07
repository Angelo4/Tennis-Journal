using TennisJournal.Domain.Entities;

namespace TennisJournal.Application.Interfaces;

/// <summary>
/// Repository interface for TennisString entities
/// </summary>
public interface IStringRepository
{
    Task<IEnumerable<TennisString>> GetAllAsync(string userId, bool? isActive = null);
    Task<TennisString?> GetByIdAsync(string id, string userId);
    Task<TennisString> CreateAsync(TennisString tennisString);
    Task<TennisString?> UpdateAsync(TennisString tennisString);
    Task<bool> DeleteAsync(string id, string userId);
}
