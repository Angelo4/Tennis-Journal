namespace TennisJournal.Api.Models;

/// <summary>
/// Represents a tennis session (practice, match, lesson, etc.)
/// </summary>
public class TennisSession
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTime SessionDate { get; set; }
    public SessionType Type { get; set; }
    public int DurationMinutes { get; set; }
    public string? Location { get; set; }
    public CourtSurface? Surface { get; set; }
    
    /// <summary>
    /// Reference to the string setup used in this session
    /// </summary>
    public string? StringId { get; set; }
    
    /// <summary>
    /// Subjective rating of how the strings felt (1-10)
    /// </summary>
    public int? StringFeelingRating { get; set; }
    
    /// <summary>
    /// Notes about string performance during this session
    /// </summary>
    public string? StringNotes { get; set; }
    
    /// <summary>
    /// General session notes
    /// </summary>
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum SessionType
{
    Practice,
    Match,
    Lesson,
    Tournament,
    HittingSession
}

public enum CourtSurface
{
    HardCourt,
    Clay,
    Grass,
    Carpet,
    Indoor
}
