using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TennisJournal.Api.Controllers;
using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Application.Services;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Tests.Controllers;

public class StringsControllerTests
{
    private readonly Mock<IStringService> _stringServiceMock;
    private readonly StringsController _sut;
    private const string TestUserId = "test-user-123";

    public StringsControllerTests()
    {
        _stringServiceMock = new Mock<IStringService>();
        _sut = new StringsController(_stringServiceMock.Object);
        
        // Setup mock HttpContext with authenticated user
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, TestUserId) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    #region GetAll Tests

    [Fact]
    public async Task GetAll_ShouldReturnOkWithStrings()
    {
        // Arrange
        var strings = new List<StringResponse>
        {
            CreateTestResponse("1", "Luxilon", "ALU Power"),
            CreateTestResponse("2", "Babolat", "RPM Blast")
        };
        _stringServiceMock.Setup(x => x.GetAllAsync(TestUserId, null)).ReturnsAsync(strings);

        // Act
        var result = await _sut.GetAll();

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedStrings = okResult.Value.Should().BeAssignableTo<IEnumerable<StringResponse>>().Subject;
        returnedStrings.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAll_WithActiveFilter_ShouldPassFilterToService()
    {
        // Arrange
        var activeStrings = new List<StringResponse>
        {
            CreateTestResponse("1", "Luxilon", "ALU Power", isActive: true)
        };
        _stringServiceMock.Setup(x => x.GetAllAsync(TestUserId, true)).ReturnsAsync(activeStrings);

        // Act
        var result = await _sut.GetAll(isActive: true);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedStrings = okResult.Value.Should().BeAssignableTo<IEnumerable<StringResponse>>().Subject;
        returnedStrings.Should().HaveCount(1);
        _stringServiceMock.Verify(x => x.GetAllAsync(TestUserId, true), Times.Once);
    }

    #endregion

    #region GetById Tests

    [Fact]
    public async Task GetById_ShouldReturnOkWithString_WhenStringExists()
    {
        // Arrange
        var tennisString = CreateTestResponse("123", "Luxilon", "ALU Power");
        _stringServiceMock.Setup(x => x.GetByIdAsync("123", TestUserId)).ReturnsAsync(tennisString);

        // Act
        var result = await _sut.GetById("123");

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedString = okResult.Value.Should().BeOfType<StringResponse>().Subject;
        returnedString.Id.Should().Be("123");
    }

    [Fact]
    public async Task GetById_ShouldReturnNotFound_WhenStringDoesNotExist()
    {
        // Arrange
        _stringServiceMock.Setup(x => x.GetByIdAsync("nonexistent", TestUserId)).ReturnsAsync((StringResponse?)null);

        // Act
        var result = await _sut.GetById("nonexistent");

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region GetUsageStats Tests

    [Fact]
    public async Task GetUsageStats_ShouldReturnOkWithStats_WhenStringExists()
    {
        // Arrange
        var stats = new StringUsageStatsResponse(
            StringId: "123",
            String: CreateTestResponse("123", "Luxilon", "ALU Power"),
            TotalSessions: 10,
            TotalMinutesPlayed: 600,
            AverageFeelingRating: 8.5,
            DaysSinceStrung: 30
        );
        _stringServiceMock.Setup(x => x.GetUsageStatsAsync("123", TestUserId)).ReturnsAsync(stats);

        // Act
        var result = await _sut.GetUsageStats("123");

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedStats = okResult.Value.Should().BeOfType<StringUsageStatsResponse>().Subject;
        returnedStats.TotalSessions.Should().Be(10);
        returnedStats.AverageFeelingRating.Should().Be(8.5);
    }

    [Fact]
    public async Task GetUsageStats_ShouldReturnNotFound_WhenStringDoesNotExist()
    {
        // Arrange
        _stringServiceMock.Setup(x => x.GetUsageStatsAsync("nonexistent", TestUserId)).ReturnsAsync((StringUsageStatsResponse?)null);

        // Act
        var result = await _sut.GetUsageStats("nonexistent");

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region Create Tests

    [Fact]
    public async Task Create_ShouldReturnCreatedAtAction_WithNewString()
    {
        // Arrange
        var request = new CreateStringRequest(
            Brand: "Luxilon",
            Model: "ALU Power",
            Gauge: "16L",
            Type: StringType.Polyester,
            MainTension: 52,
            CrossTension: 50,
            DateStrung: DateTime.UtcNow
        );
        var createdString = CreateTestResponse("new-id", "Luxilon", "ALU Power");
        _stringServiceMock.Setup(x => x.CreateAsync(request, TestUserId)).ReturnsAsync(createdString);

        // Act
        var result = await _sut.Create(request);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(StringsController.GetById));
        createdResult.RouteValues!["id"].Should().Be("new-id");
        var returnedString = createdResult.Value.Should().BeOfType<StringResponse>().Subject;
        returnedString.Brand.Should().Be("Luxilon");
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task Update_ShouldReturnOkWithUpdatedString_WhenStringExists()
    {
        // Arrange
        var request = new UpdateStringRequest(Brand: "Babolat");
        var updatedString = CreateTestResponse("123", "Babolat", "ALU Power");
        _stringServiceMock.Setup(x => x.UpdateAsync("123", request, TestUserId)).ReturnsAsync(updatedString);

        // Act
        var result = await _sut.Update("123", request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedString = okResult.Value.Should().BeOfType<StringResponse>().Subject;
        returnedString.Brand.Should().Be("Babolat");
    }

    [Fact]
    public async Task Update_ShouldReturnNotFound_WhenStringDoesNotExist()
    {
        // Arrange
        var request = new UpdateStringRequest(Brand: "Babolat");
        _stringServiceMock.Setup(x => x.UpdateAsync("nonexistent", request, TestUserId)).ReturnsAsync((StringResponse?)null);

        // Act
        var result = await _sut.Update("nonexistent", request);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region Delete Tests

    [Fact]
    public async Task Delete_ShouldReturnNoContent_WhenStringDeleted()
    {
        // Arrange
        _stringServiceMock.Setup(x => x.DeleteAsync("123", TestUserId)).ReturnsAsync(true);

        // Act
        var result = await _sut.Delete("123");

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Delete_ShouldReturnNotFound_WhenStringDoesNotExist()
    {
        // Arrange
        _stringServiceMock.Setup(x => x.DeleteAsync("nonexistent", TestUserId)).ReturnsAsync(false);

        // Act
        var result = await _sut.Delete("nonexistent");

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region Helper Methods

    private static StringResponse CreateTestResponse(string id, string brand, string model, bool isActive = true)
    {
        return new StringResponse(
            Id: id,
            Brand: brand,
            Model: model,
            Gauge: "16",
            Type: StringType.Polyester,
            MainTension: 52,
            CrossTension: 50,
            DateStrung: DateTime.UtcNow,
            DateRemoved: null,
            IsActive: isActive,
            Notes: null,
            CreatedAt: DateTime.UtcNow,
            UpdatedAt: DateTime.UtcNow
        );
    }

    #endregion
}
