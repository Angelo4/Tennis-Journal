namespace TennisJournal.Api.Models.DTOs;

public class CreateTennisSessionRequest
{
    public DateTime SessionDate { get; set; }
    public SessionType Type { get; set; }
    public int DurationMinutes { get; set; }
    public string? Location { get; set; }
    public CourtSurface? Surface { get; set; }
    public string? StringId { get; set; }
    public int? StringFeelingRating { get; set; }
    public string? StringNotes { get; set; }
    public string? Notes { get; set; }
}

public class UpdateTennisSessionRequest
{
    public DateTime? SessionDate { get; set; }
    public SessionType? Type { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Location { get; set; }
    public CourtSurface? Surface { get; set; }
    public string? StringId { get; set; }
    public int? StringFeelingRating { get; set; }
    public string? StringNotes { get; set; }
    public string? Notes { get; set; }
}

public class TennisSessionWithString
{
    public required TennisSession Session { get; set; }
    public TennisString? String { get; set; }
}
