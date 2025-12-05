using TennisJournal.Domain.Enums;

namespace TennisJournal.Application.DTOs.Strings;

public record CreateStringRequest(
    string Brand,
    string Model,
    string? Gauge,
    StringType Type,
    int? MainTension,
    int? CrossTension,
    DateTime DateStrung,
    bool IsActive = true,
    string? Notes = null
);

public record UpdateStringRequest(
    string? Brand = null,
    string? Model = null,
    string? Gauge = null,
    StringType? Type = null,
    int? MainTension = null,
    int? CrossTension = null,
    DateTime? DateStrung = null,
    DateTime? DateRemoved = null,
    bool? IsActive = null,
    string? Notes = null
);

public record StringResponse(
    string Id,
    string Brand,
    string Model,
    string? Gauge,
    StringType Type,
    int? MainTension,
    int? CrossTension,
    DateTime DateStrung,
    DateTime? DateRemoved,
    bool IsActive,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record StringUsageStatsResponse(
    string StringId,
    StringResponse String,
    int TotalSessions,
    int TotalMinutesPlayed,
    double AverageFeelingRating,
    int DaysSinceStrung
);
