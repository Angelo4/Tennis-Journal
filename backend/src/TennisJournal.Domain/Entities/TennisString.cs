using TennisJournal.Domain.Enums;

namespace TennisJournal.Domain.Entities;

/// <summary>
/// Represents a tennis string setup (can be hybrid with different main/cross strings)
/// </summary>
public class TennisString
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    /// <summary>
    /// The ID of the user who owns this string
    /// </summary>
    public string UserId { get; set; } = string.Empty;
    
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string? Gauge { get; set; }
    public StringType Type { get; set; }
    public int? MainTension { get; set; }
    public int? CrossTension { get; set; }
    public DateTime? DateStrung { get; set; }
    public DateTime? DateRemoved { get; set; }
    public StringStatus Status { get; set; } = StringStatus.Inventory;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public void MarkAsStrung(DateTime? dateStrung = null)
    {
        Status = StringStatus.Strung;
        DateStrung = dateStrung ?? DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsRemoved(DateTime? dateRemoved = null)
    {
        Status = StringStatus.Removed;
        DateRemoved = dateRemoved ?? DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReturnToInventory()
    {
        Status = StringStatus.Inventory;
        DateStrung = null;
        DateRemoved = null;
        UpdatedAt = DateTime.UtcNow;
    }
}
