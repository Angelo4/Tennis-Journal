namespace TennisJournal.Domain.Entities;

/// <summary>
/// Represents a timestamp marker in a video recording of a tennis session
/// </summary>
public class VideoTimestamp
{
    /// <summary>
    /// Time position in the video in seconds
    /// </summary>
    public int TimeInSeconds { get; set; }
    
    /// <summary>
    /// Short label or title for this timestamp (e.g., "Great serve", "Match point")
    /// </summary>
    public string Label { get; set; } = string.Empty;
    
    /// <summary>
    /// Additional notes or description for this timestamp
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// When this timestamp was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
