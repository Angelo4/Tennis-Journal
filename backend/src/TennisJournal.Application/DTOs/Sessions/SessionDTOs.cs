using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Application.DTOs.Sessions;

public record VideoTimestampDto(
    int TimeInSeconds,
    string Label,
    string? Notes,
    DateTime CreatedAt
);

public record CreateSessionRequest(
    DateTime SessionDate,
    SessionType Type,
    int DurationMinutes,
    string? Location = null,
    CourtSurface? Surface = null,
    string? StringId = null,
    int? StringFeelingRating = null,
    string? StringNotes = null,
    string? Notes = null,
    string? YouTubeVideoUrl = null,
    List<VideoTimestampDto>? VideoTimestamps = null
);

public record UpdateSessionRequest(
    DateTime? SessionDate = null,
    SessionType? Type = null,
    int? DurationMinutes = null,
    string? Location = null,
    CourtSurface? Surface = null,
    string? StringId = null,
    int? StringFeelingRating = null,
    string? StringNotes = null,
    string? Notes = null,
    string? YouTubeVideoUrl = null,
    List<VideoTimestampDto>? VideoTimestamps = null
);

public record SessionResponse(
    string Id,
    DateTime SessionDate,
    SessionType Type,
    int DurationMinutes,
    string? Location,
    CourtSurface? Surface,
    string? StringId,
    int? StringFeelingRating,
    string? StringNotes,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? YouTubeVideoUrl,
    List<VideoTimestampDto>? VideoTimestamps
);

public record SessionWithStringResponse(
    SessionResponse Session,
    StringResponse? String
);
