using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TennisJournal.Application.DTOs.Auth;
using TennisJournal.Application.Interfaces;
using TennisJournal.Domain.Entities;

namespace TennisJournal.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> GoogleAuthAsync(GoogleAuthRequest request);
    Task<UserResponse?> GetUserByIdAsync(string userId);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        if (await _userRepository.ExistsAsync(request.Email))
        {
            throw new InvalidOperationException("A user with this email already exists");
        }

        // Create new user with hashed password
        var user = new User
        {
            Email = request.Email.ToLowerInvariant(),
            DisplayName = request.DisplayName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            EmailVerified = false
        };

        var createdUser = await _userRepository.CreateAsync(user);
        
        return GenerateAuthResponse(createdUser);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.ToLowerInvariant());
        
        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
        {
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponse?> GoogleAuthAsync(GoogleAuthRequest request)
    {
        GoogleJsonWebSignature.Payload payload;
        
        try
        {
            var googleClientId = _configuration["Google:ClientId"];
            if (string.IsNullOrEmpty(googleClientId))
            {
                throw new InvalidOperationException("Google Client ID not configured");
            }

            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { googleClientId }
            };
            
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
        }
        catch (InvalidJwtException)
        {
            return null;
        }

        // Try to find existing user by Google ID
        var user = await _userRepository.GetByGoogleIdAsync(payload.Subject);
        
        if (user == null)
        {
            // Try to find by email (in case user registered with email first)
            user = await _userRepository.GetByEmailAsync(payload.Email.ToLowerInvariant());
            
            if (user != null)
            {
                // Link Google account to existing user
                user.GoogleId = payload.Subject;
                user.EmailVerified = payload.EmailVerified;
                user.PictureUrl = payload.Picture;
                user.LastLoginAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
            }
            else
            {
                // Create new user from Google account
                user = new User
                {
                    Email = payload.Email.ToLowerInvariant(),
                    DisplayName = payload.Name ?? payload.Email,
                    GoogleId = payload.Subject,
                    PictureUrl = payload.Picture,
                    EmailVerified = payload.EmailVerified
                };
                
                user = await _userRepository.CreateAsync(user);
            }
        }
        else
        {
            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            user.PictureUrl = payload.Picture;
            await _userRepository.UpdateAsync(user);
        }

        return GenerateAuthResponse(user);
    }

    public async Task<UserResponse?> GetUserByIdAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user != null ? MapToUserResponse(user) : null;
    }

    private AuthResponse GenerateAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        var expirationHours = int.Parse(_configuration["Jwt:ExpirationInHours"] ?? "24");
        var expiresAt = DateTime.UtcNow.AddHours(expirationHours);

        return new AuthResponse(
            Token: token,
            ExpiresAt: expiresAt,
            User: MapToUserResponse(user)
        );
    }

    private string GenerateJwtToken(User user)
    {
        var secret = _configuration["Jwt:Secret"] 
            ?? throw new InvalidOperationException("JWT Secret not configured");
        var issuer = _configuration["Jwt:Issuer"] ?? "TennisJournal";
        var audience = _configuration["Jwt:Audience"] ?? "TennisJournalApp";
        var expirationHours = int.Parse(_configuration["Jwt:ExpirationInHours"] ?? "24");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserResponse MapToUserResponse(User user)
    {
        return new UserResponse(
            Id: user.Id,
            Email: user.Email,
            DisplayName: user.DisplayName,
            PictureUrl: user.PictureUrl,
            EmailVerified: user.EmailVerified,
            CreatedAt: user.CreatedAt
        );
    }
}
