using TennisJournal.Domain.Enums;

namespace TennisJournal.Domain.Entities;

/// <summary>
/// Represents a tennis string setup (can be hybrid with different main/cross strings)
/// </summary>
public class TennisString
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string? Gauge { get; set; }
    public StringType Type { get; set; }
    public int? MainTension { get; set; }
    public int? CrossTension { get; set; }
    public DateTime DateStrung { get; set; }
    public DateTime? DateRemoved { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public void MarkAsRemoved()
    {
        IsActive = false;
        DateRemoved = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Restore()
    {
        IsActive = true;
        DateRemoved = null;
        UpdatedAt = DateTime.UtcNow;
    }
}
