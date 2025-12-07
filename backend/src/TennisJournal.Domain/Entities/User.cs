namespace TennisJournal.Domain.Entities;

/// <summary>
/// Represents a user of the Tennis Journal application
/// </summary>
public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    /// <summary>
    /// User's email address (unique identifier for login)
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// User's display name
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;
    
    /// <summary>
    /// Hashed password for email/password authentication (null for OAuth-only users)
    /// </summary>
    public string? PasswordHash { get; set; }
    
    /// <summary>
    /// Google OAuth subject ID (null for email/password-only users)
    /// </summary>
    public string? GoogleId { get; set; }
    
    /// <summary>
    /// URL to user's profile picture
    /// </summary>
    public string? PictureUrl { get; set; }
    
    /// <summary>
    /// Whether the user's email has been verified
    /// </summary>
    public bool EmailVerified { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
}
