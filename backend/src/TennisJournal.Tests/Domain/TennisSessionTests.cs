using TennisJournal.Domain.Entities;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Tests.Domain;

public class TennisSessionTests
{
    [Fact]
    public void TennisSession_ShouldInitializeWithDefaults()
    {
        // Act
        var session = new TennisSession();

        // Assert
        session.Id.Should().NotBeNullOrEmpty();
        session.StringId.Should().BeNull();
        session.Location.Should().BeNull();
        session.Surface.Should().BeNull();
        session.StringFeelingRating.Should().BeNull();
        session.StringNotes.Should().BeNull();
        session.Notes.Should().BeNull();
    }

    [Fact]
    public void TennisSession_ShouldStoreAllProperties()
    {
        // Arrange
        var sessionDate = DateTime.UtcNow;

        // Act
        var session = new TennisSession
        {
            Id = "test-id",
            SessionDate = sessionDate,
            Type = SessionType.Match,
            DurationMinutes = 90,
            Location = "Tennis Club",
            Surface = CourtSurface.Clay,
            StringId = "string-123",
            StringFeelingRating = 8,
            StringNotes = "Great spin",
            Notes = "Won 6-4, 6-3"
        };

        // Assert
        session.Id.Should().Be("test-id");
        session.SessionDate.Should().Be(sessionDate);
        session.Type.Should().Be(SessionType.Match);
        session.DurationMinutes.Should().Be(90);
        session.Location.Should().Be("Tennis Club");
        session.Surface.Should().Be(CourtSurface.Clay);
        session.StringId.Should().Be("string-123");
        session.StringFeelingRating.Should().Be(8);
        session.StringNotes.Should().Be("Great spin");
        session.Notes.Should().Be("Won 6-4, 6-3");
    }

    [Theory]
    [InlineData(SessionType.Practice)]
    [InlineData(SessionType.Match)]
    [InlineData(SessionType.Lesson)]
    [InlineData(SessionType.Tournament)]
    public void TennisSession_ShouldAcceptAllSessionTypes(SessionType type)
    {
        // Act
        var session = new TennisSession { Type = type };

        // Assert
        session.Type.Should().Be(type);
    }

    [Theory]
    [InlineData(CourtSurface.Clay)]
    [InlineData(CourtSurface.Grass)]
    [InlineData(CourtSurface.HardCourt)]
    [InlineData(CourtSurface.Carpet)]
    public void TennisSession_ShouldAcceptAllCourtSurfaces(CourtSurface surface)
    {
        // Act
        var session = new TennisSession { Surface = surface };

        // Assert
        session.Surface.Should().Be(surface);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public void TennisSession_ShouldAcceptValidStringFeelingRatings(int rating)
    {
        // Act
        var session = new TennisSession { StringFeelingRating = rating };

        // Assert
        session.StringFeelingRating.Should().Be(rating);
    }

    [Fact]
    public void TennisSession_ShouldAllowNullStringId_ForSessionWithoutString()
    {
        // Act
        var session = new TennisSession
        {
            SessionDate = DateTime.UtcNow,
            Type = SessionType.Practice,
            DurationMinutes = 60,
            StringId = null
        };

        // Assert
        session.StringId.Should().BeNull();
    }

    [Fact]
    public void TennisSession_ShouldHaveTimestamps()
    {
        // Act
        var session = new TennisSession();

        // Assert
        session.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        session.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }
}
