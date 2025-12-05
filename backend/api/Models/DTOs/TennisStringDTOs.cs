namespace TennisJournal.Api.Models.DTOs;

public class CreateTennisStringRequest
{
    public required string Brand { get; set; }
    public required string Model { get; set; }
    public string? Gauge { get; set; }
    public StringType Type { get; set; }
    public int? MainTension { get; set; }
    public int? CrossTension { get; set; }
    public DateTime DateStrung { get; set; }
    public string? Notes { get; set; }
}

public class UpdateTennisStringRequest
{
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Gauge { get; set; }
    public StringType? Type { get; set; }
    public int? MainTension { get; set; }
    public int? CrossTension { get; set; }
    public DateTime? DateStrung { get; set; }
    public string? Notes { get; set; }
}
