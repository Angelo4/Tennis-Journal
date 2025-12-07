using TennisJournal.Domain.Entities;

namespace TennisJournal.Application.Interfaces;

/// <summary>
/// Repository interface for User entities
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByGoogleIdAsync(string googleId);
    Task<User> CreateAsync(User user);
    Task<User?> UpdateAsync(User user);
    Task<bool> ExistsAsync(string email);
}
