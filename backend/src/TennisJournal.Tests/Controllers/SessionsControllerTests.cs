using Microsoft.AspNetCore.Mvc;
using TennisJournal.Api.Controllers;
using TennisJournal.Application.DTOs.Sessions;
using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Application.Services;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Tests.Controllers;

public class SessionsControllerTests
{
    private readonly Mock<ISessionService> _sessionServiceMock;
    private readonly SessionsController _sut;

    public SessionsControllerTests()
    {
        _sessionServiceMock = new Mock<ISessionService>();
        _sut = new SessionsController(_sessionServiceMock.Object);
    }

    #region GetAll Tests

    [Fact]
    public async Task GetAll_ShouldReturnOkWithSessions()
    {
        // Arrange
        var sessions = new List<SessionResponse>
        {
            CreateTestResponse("1", SessionType.Practice),
            CreateTestResponse("2", SessionType.Match)
        };
        _sessionServiceMock.Setup(x => x.GetAllAsync()).ReturnsAsync(sessions);

        // Act
        var result = await _sut.GetAll();

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedSessions = okResult.Value.Should().BeAssignableTo<IEnumerable<SessionResponse>>().Subject;
        returnedSessions.Should().HaveCount(2);
    }

    #endregion

    #region GetById Tests

    [Fact]
    public async Task GetById_ShouldReturnOkWithSession_WhenSessionExists()
    {
        // Arrange
        var session = CreateTestResponse("123", SessionType.Match);
        _sessionServiceMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(session);

        // Act
        var result = await _sut.GetById("123");

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedSession = okResult.Value.Should().BeOfType<SessionResponse>().Subject;
        returnedSession.Id.Should().Be("123");
    }

    [Fact]
    public async Task GetById_ShouldReturnNotFound_WhenSessionDoesNotExist()
    {
        // Arrange
        _sessionServiceMock.Setup(x => x.GetByIdAsync("nonexistent")).ReturnsAsync((SessionResponse?)null);

        // Act
        var result = await _sut.GetById("nonexistent");

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region GetWithString Tests

    [Fact]
    public async Task GetWithString_ShouldReturnOkWithSessionAndString()
    {
        // Arrange
        var sessionWithString = new SessionWithStringResponse(
            Session: CreateTestResponse("123", SessionType.Match),
            String: new StringResponse(
                Id: "string-1",
                Brand: "Luxilon",
                Model: "ALU Power",
                Gauge: "16",
                Type: StringType.Polyester,
                MainTension: 52,
                CrossTension: 50,
                DateStrung: DateTime.UtcNow,
                DateRemoved: null,
                IsActive: true,
                Notes: null,
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow
            )
        );
        _sessionServiceMock.Setup(x => x.GetWithStringAsync("123")).ReturnsAsync(sessionWithString);

        // Act
        var result = await _sut.GetWithString("123");

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returned = okResult.Value.Should().BeOfType<SessionWithStringResponse>().Subject;
        returned.Session.Id.Should().Be("123");
        returned.String.Should().NotBeNull();
        returned.String!.Brand.Should().Be("Luxilon");
    }

    [Fact]
    public async Task GetWithString_ShouldReturnNotFound_WhenSessionDoesNotExist()
    {
        // Arrange
        _sessionServiceMock.Setup(x => x.GetWithStringAsync("nonexistent")).ReturnsAsync((SessionWithStringResponse?)null);

        // Act
        var result = await _sut.GetWithString("nonexistent");

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region Create Tests

    [Fact]
    public async Task Create_ShouldReturnCreatedAtAction_WithNewSession()
    {
        // Arrange
        var request = new CreateSessionRequest(
            SessionDate: DateTime.UtcNow,
            Type: SessionType.Match,
            DurationMinutes: 90,
            Location: "Tennis Club"
        );
        var createdSession = CreateTestResponse("new-id", SessionType.Match);
        _sessionServiceMock.Setup(x => x.CreateAsync(request)).ReturnsAsync(createdSession);

        // Act
        var result = await _sut.Create(request);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(SessionsController.GetById));
        createdResult.RouteValues!["id"].Should().Be("new-id");
    }

    [Fact]
    public async Task Create_WithInvalidStringId_ShouldReturnBadRequest()
    {
        // Arrange
        var request = new CreateSessionRequest(
            SessionDate: DateTime.UtcNow,
            Type: SessionType.Match,
            DurationMinutes: 90,
            StringId: "invalid-string"
        );
        _sessionServiceMock.Setup(x => x.StringExistsAsync("invalid-string")).ReturnsAsync(false);

        // Act
        var result = await _sut.Create(request);

        // Assert
        var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.Value.Should().Be("String with ID 'invalid-string' not found");
    }

    [Fact]
    public async Task Create_WithValidStringId_ShouldCreateSession()
    {
        // Arrange
        var request = new CreateSessionRequest(
            SessionDate: DateTime.UtcNow,
            Type: SessionType.Match,
            DurationMinutes: 90,
            StringId: "valid-string"
        );
        var createdSession = CreateTestResponse("new-id", SessionType.Match);
        _sessionServiceMock.Setup(x => x.StringExistsAsync("valid-string")).ReturnsAsync(true);
        _sessionServiceMock.Setup(x => x.CreateAsync(request)).ReturnsAsync(createdSession);

        // Act
        var result = await _sut.Create(request);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task Update_ShouldReturnOkWithUpdatedSession_WhenSessionExists()
    {
        // Arrange
        var request = new UpdateSessionRequest(DurationMinutes: 120);
        var updatedSession = CreateTestResponse("123", SessionType.Match);
        _sessionServiceMock.Setup(x => x.UpdateAsync("123", request)).ReturnsAsync(updatedSession);

        // Act
        var result = await _sut.Update("123", request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeOfType<SessionResponse>();
    }

    [Fact]
    public async Task Update_ShouldReturnNotFound_WhenSessionDoesNotExist()
    {
        // Arrange
        var request = new UpdateSessionRequest(DurationMinutes: 120);
        _sessionServiceMock.Setup(x => x.UpdateAsync("nonexistent", request)).ReturnsAsync((SessionResponse?)null);

        // Act
        var result = await _sut.Update("nonexistent", request);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Update_WithInvalidStringId_ShouldReturnBadRequest()
    {
        // Arrange
        var request = new UpdateSessionRequest(StringId: "invalid-string");
        _sessionServiceMock.Setup(x => x.StringExistsAsync("invalid-string")).ReturnsAsync(false);

        // Act
        var result = await _sut.Update("123", request);

        // Assert
        var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.Value.Should().Be("String with ID 'invalid-string' not found");
    }

    #endregion

    #region Delete Tests

    [Fact]
    public async Task Delete_ShouldReturnNoContent_WhenSessionDeleted()
    {
        // Arrange
        _sessionServiceMock.Setup(x => x.DeleteAsync("123")).ReturnsAsync(true);

        // Act
        var result = await _sut.Delete("123");

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Delete_ShouldReturnNotFound_WhenSessionDoesNotExist()
    {
        // Arrange
        _sessionServiceMock.Setup(x => x.DeleteAsync("nonexistent")).ReturnsAsync(false);

        // Act
        var result = await _sut.Delete("nonexistent");

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region Helper Methods

    private static SessionResponse CreateTestResponse(string id, SessionType type)
    {
        return new SessionResponse(
            Id: id,
            SessionDate: DateTime.UtcNow,
            Type: type,
            DurationMinutes: 60,
            Location: "Test Location",
            Surface: CourtSurface.Clay,
            StringId: null,
            StringFeelingRating: null,
            StringNotes: null,
            Notes: null,
            CreatedAt: DateTime.UtcNow,
            UpdatedAt: DateTime.UtcNow
        );
    }

    #endregion
}
