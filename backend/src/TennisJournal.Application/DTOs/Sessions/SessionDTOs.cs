using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Application.DTOs.Sessions;

public record CreateSessionRequest(
    DateTime SessionDate,
    SessionType Type,
    int DurationMinutes,
    string? Location = null,
    CourtSurface? Surface = null,
    string? StringId = null,
    int? StringFeelingRating = null,
    string? StringNotes = null,
    string? Notes = null
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
    string? Notes = null
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
    DateTime UpdatedAt
);

public record SessionWithStringResponse(
    SessionResponse Session,
    StringResponse? String
);
