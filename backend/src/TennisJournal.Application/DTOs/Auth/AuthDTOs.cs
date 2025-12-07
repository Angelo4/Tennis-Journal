namespace TennisJournal.Application.DTOs.Auth;

/// <summary>
/// Request for user registration with email/password
/// </summary>
public record RegisterRequest(
    string Email,
    string Password,
    string DisplayName
);

/// <summary>
/// Request for user login with email/password
/// </summary>
public record LoginRequest(
    string Email,
    string Password
);

/// <summary>
/// Request for Google OAuth authentication
/// </summary>
public record GoogleAuthRequest(
    string IdToken
);

/// <summary>
/// Response containing authentication token and user info
/// </summary>
public record AuthResponse(
    string Token,
    DateTime ExpiresAt,
    UserResponse User
);

/// <summary>
/// User information response
/// </summary>
public record UserResponse(
    string Id,
    string Email,
    string DisplayName,
    string? PictureUrl,
    bool EmailVerified,
    DateTime CreatedAt
);
