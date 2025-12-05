using TennisJournal.Domain.Entities;

namespace TennisJournal.Application.Interfaces;

/// <summary>
/// Repository interface for TennisString entities
/// </summary>
public interface IStringRepository
{
    Task<IEnumerable<TennisString>> GetAllAsync(bool? isActive = null);
    Task<TennisString?> GetByIdAsync(string id);
    Task<TennisString> CreateAsync(TennisString tennisString);
    Task<TennisString?> UpdateAsync(TennisString tennisString);
    Task<bool> DeleteAsync(string id);
}
