using TennisJournal.Application.DTOs.Sessions;
using TennisJournal.Application.Interfaces;
using TennisJournal.Application.Services;
using TennisJournal.Domain.Entities;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Tests.Services;

public class SessionServiceTests
{
    private readonly Mock<ISessionRepository> _sessionRepositoryMock;
    private readonly Mock<IStringRepository> _stringRepositoryMock;
    private readonly SessionService _sut;

    public SessionServiceTests()
    {
        _sessionRepositoryMock = new Mock<ISessionRepository>();
        _stringRepositoryMock = new Mock<IStringRepository>();
        _sut = new SessionService(_sessionRepositoryMock.Object, _stringRepositoryMock.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllSessions()
    {
        // Arrange
        var sessions = new List<TennisSession>
        {
            CreateTestSession("1", SessionType.Practice),
            CreateTestSession("2", SessionType.Match)
        };
        _sessionRepositoryMock.Setup(x => x.GetAllAsync()).ReturnsAsync(sessions);

        // Act
        var result = await _sut.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
        _sessionRepositoryMock.Verify(x => x.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnEmptyList_WhenNoSessionsExist()
    {
        // Arrange
        _sessionRepositoryMock.Setup(x => x.GetAllAsync()).ReturnsAsync(Enumerable.Empty<TennisSession>());

        // Act
        var result = await _sut.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ShouldReturnSession_WhenSessionExists()
    {
        // Arrange
        var session = CreateTestSession("123", SessionType.Match);
        _sessionRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(session);

        // Act
        var result = await _sut.GetByIdAsync("123");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be("123");
        result.Type.Should().Be(SessionType.Match);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenSessionDoesNotExist()
    {
        // Arrange
        _sessionRepositoryMock.Setup(x => x.GetByIdAsync("nonexistent")).ReturnsAsync((TennisSession?)null);

        // Act
        var result = await _sut.GetByIdAsync("nonexistent");

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetWithStringAsync Tests

    [Fact]
    public async Task GetWithStringAsync_ShouldReturnSessionWithString_WhenBothExist()
    {
        // Arrange
        var session = CreateTestSession("123", SessionType.Match);
        session.StringId = "string-1";
        var tennisString = new TennisString
        {
            Id = "string-1",
            Brand = "Luxilon",
            Model = "ALU Power",
            Type = StringType.Polyester,
            DateStrung = DateTime.UtcNow
        };

        _sessionRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(session);
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("string-1")).ReturnsAsync(tennisString);

        // Act
        var result = await _sut.GetWithStringAsync("123");

        // Assert
        result.Should().NotBeNull();
        result!.Session.Id.Should().Be("123");
        result.String.Should().NotBeNull();
        result.String!.Brand.Should().Be("Luxilon");
    }

    [Fact]
    public async Task GetWithStringAsync_ShouldReturnSessionWithNullString_WhenNoStringLinked()
    {
        // Arrange
        var session = CreateTestSession("123", SessionType.Practice);
        session.StringId = null;

        _sessionRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(session);

        // Act
        var result = await _sut.GetWithStringAsync("123");

        // Assert
        result.Should().NotBeNull();
        result!.Session.Id.Should().Be("123");
        result.String.Should().BeNull();
    }

    [Fact]
    public async Task GetWithStringAsync_ShouldReturnNull_WhenSessionDoesNotExist()
    {
        // Arrange
        _sessionRepositoryMock.Setup(x => x.GetByIdAsync("nonexistent")).ReturnsAsync((TennisSession?)null);

        // Act
        var result = await _sut.GetWithStringAsync("nonexistent");

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_ShouldCreateAndReturnSession()
    {
        // Arrange
        var request = new CreateSessionRequest(
            SessionDate: DateTime.UtcNow,
            Type: SessionType.Match,
            DurationMinutes: 90,
            Location: "Tennis Club",
            Surface: CourtSurface.HardCourt,
            StringId: "string-1",
            StringFeelingRating: 8,
            StringNotes: "Great spin",
            Notes: "Won 6-4, 6-3"
        );

        _sessionRepositoryMock
            .Setup(x => x.CreateAsync(It.IsAny<TennisSession>()))
            .ReturnsAsync((TennisSession s) =>
            {
                s.Id = "new-id";
                return s;
            });

        // Act
        var result = await _sut.CreateAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Type.Should().Be(SessionType.Match);
        result.DurationMinutes.Should().Be(90);
        result.Location.Should().Be("Tennis Club");
        result.StringFeelingRating.Should().Be(8);
        _sessionRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<TennisSession>()), Times.Once);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ShouldUpdateAndReturnSession_WhenSessionExists()
    {
        // Arrange
        var existingSession = CreateTestSession("123", SessionType.Practice);
        var request = new UpdateSessionRequest(Type: SessionType.Match, DurationMinutes: 120);

        _sessionRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(existingSession);
        _sessionRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<TennisSession>())).ReturnsAsync((TennisSession s) => s);

        // Act
        var result = await _sut.UpdateAsync("123", request);

        // Assert
        result.Should().NotBeNull();
        result!.Type.Should().Be(SessionType.Match);
        result.DurationMinutes.Should().Be(120);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnNull_WhenSessionDoesNotExist()
    {
        // Arrange
        _sessionRepositoryMock.Setup(x => x.GetByIdAsync("nonexistent")).ReturnsAsync((TennisSession?)null);

        // Act
        var result = await _sut.UpdateAsync("nonexistent", new UpdateSessionRequest());

        // Assert
        result.Should().BeNull();
        _sessionRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<TennisSession>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_ShouldOnlyUpdateProvidedFields()
    {
        // Arrange
        var existingSession = CreateTestSession("123", SessionType.Practice);
        existingSession.Location = "Original Location";
        existingSession.Notes = "Original notes";
        var request = new UpdateSessionRequest(DurationMinutes: 150); // Only updating duration

        _sessionRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(existingSession);
        _sessionRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<TennisSession>())).ReturnsAsync((TennisSession s) => s);

        // Act
        var result = await _sut.UpdateAsync("123", request);

        // Assert
        result.Should().NotBeNull();
        result!.DurationMinutes.Should().Be(150);
        result.Type.Should().Be(SessionType.Practice); // Should remain unchanged
        result.Location.Should().Be("Original Location"); // Should remain unchanged
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_ShouldReturnTrue_WhenSessionDeleted()
    {
        // Arrange
        _sessionRepositoryMock.Setup(x => x.DeleteAsync("123")).ReturnsAsync(true);

        // Act
        var result = await _sut.DeleteAsync("123");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnFalse_WhenSessionDoesNotExist()
    {
        // Arrange
        _sessionRepositoryMock.Setup(x => x.DeleteAsync("nonexistent")).ReturnsAsync(false);

        // Act
        var result = await _sut.DeleteAsync("nonexistent");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region StringExistsAsync Tests

    [Fact]
    public async Task StringExistsAsync_ShouldReturnTrue_WhenStringExists()
    {
        // Arrange
        var tennisString = new TennisString { Id = "string-1" };
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("string-1")).ReturnsAsync(tennisString);

        // Act
        var result = await _sut.StringExistsAsync("string-1");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task StringExistsAsync_ShouldReturnFalse_WhenStringDoesNotExist()
    {
        // Arrange
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("nonexistent")).ReturnsAsync((TennisString?)null);

        // Act
        var result = await _sut.StringExistsAsync("nonexistent");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Helper Methods

    private static TennisSession CreateTestSession(string id, SessionType type)
    {
        return new TennisSession
        {
            Id = id,
            SessionDate = DateTime.UtcNow,
            Type = type,
            DurationMinutes = 60,
            Location = "Test Location",
            Surface = CourtSurface.Clay,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
