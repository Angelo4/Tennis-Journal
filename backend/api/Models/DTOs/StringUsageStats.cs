namespace TennisJournal.Api.Models.DTOs;

public class StringUsageStats
{
    public required string StringId { get; set; }
    public required TennisString String { get; set; }
    public int TotalSessions { get; set; }
    public int TotalMinutesPlayed { get; set; }
    public double AverageFeelingRating { get; set; }
    public int DaysSinceStrung { get; set; }
}
