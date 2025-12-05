using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Application.Interfaces;
using TennisJournal.Application.Services;
using TennisJournal.Domain.Entities;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Tests.Services;

public class StringServiceTests
{
    private readonly Mock<IStringRepository> _stringRepositoryMock;
    private readonly Mock<ISessionRepository> _sessionRepositoryMock;
    private readonly StringService _sut;

    public StringServiceTests()
    {
        _stringRepositoryMock = new Mock<IStringRepository>();
        _sessionRepositoryMock = new Mock<ISessionRepository>();
        _sut = new StringService(_stringRepositoryMock.Object, _sessionRepositoryMock.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllStrings_WhenNoFilterApplied()
    {
        // Arrange
        var strings = new List<TennisString>
        {
            CreateTestString("1", "Luxilon", "ALU Power"),
            CreateTestString("2", "Babolat", "RPM Blast")
        };
        _stringRepositoryMock.Setup(x => x.GetAllAsync(null)).ReturnsAsync(strings);

        // Act
        var result = await _sut.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
        _stringRepositoryMock.Verify(x => x.GetAllAsync(null), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnActiveStrings_WhenFilteredByActive()
    {
        // Arrange
        var activeString = CreateTestString("1", "Luxilon", "ALU Power", isActive: true);
        _stringRepositoryMock.Setup(x => x.GetAllAsync(true)).ReturnsAsync(new[] { activeString });

        // Act
        var result = await _sut.GetAllAsync(isActive: true);

        // Assert
        result.Should().HaveCount(1);
        result.First().IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnEmptyList_WhenNoStringsExist()
    {
        // Arrange
        _stringRepositoryMock.Setup(x => x.GetAllAsync(null)).ReturnsAsync(Enumerable.Empty<TennisString>());

        // Act
        var result = await _sut.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ShouldReturnString_WhenStringExists()
    {
        // Arrange
        var tennisString = CreateTestString("123", "Luxilon", "ALU Power");
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(tennisString);

        // Act
        var result = await _sut.GetByIdAsync("123");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be("123");
        result.Brand.Should().Be("Luxilon");
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenStringDoesNotExist()
    {
        // Arrange
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("nonexistent")).ReturnsAsync((TennisString?)null);

        // Act
        var result = await _sut.GetByIdAsync("nonexistent");

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_ShouldCreateAndReturnString()
    {
        // Arrange
        var request = new CreateStringRequest(
            Brand: "Luxilon",
            Model: "ALU Power",
            Gauge: "16L",
            Type: StringType.Polyester,
            MainTension: 52,
            CrossTension: 50,
            DateStrung: DateTime.UtcNow,
            IsActive: true,
            Notes: "First string job"
        );

        _stringRepositoryMock
            .Setup(x => x.CreateAsync(It.IsAny<TennisString>()))
            .ReturnsAsync((TennisString s) =>
            {
                s.Id = "new-id";
                return s;
            });

        // Act
        var result = await _sut.CreateAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Brand.Should().Be("Luxilon");
        result.Model.Should().Be("ALU Power");
        result.Type.Should().Be(StringType.Polyester);
        _stringRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<TennisString>()), Times.Once);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ShouldUpdateAndReturnString_WhenStringExists()
    {
        // Arrange
        var existingString = CreateTestString("123", "Luxilon", "ALU Power");
        var request = new UpdateStringRequest(Brand: "Babolat", Model: "RPM Blast");

        _stringRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(existingString);
        _stringRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<TennisString>())).ReturnsAsync((TennisString s) => s);

        // Act
        var result = await _sut.UpdateAsync("123", request);

        // Assert
        result.Should().NotBeNull();
        result!.Brand.Should().Be("Babolat");
        result.Model.Should().Be("RPM Blast");
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnNull_WhenStringDoesNotExist()
    {
        // Arrange
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("nonexistent")).ReturnsAsync((TennisString?)null);

        // Act
        var result = await _sut.UpdateAsync("nonexistent", new UpdateStringRequest());

        // Assert
        result.Should().BeNull();
        _stringRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<TennisString>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_ShouldOnlyUpdateProvidedFields()
    {
        // Arrange
        var existingString = CreateTestString("123", "Luxilon", "ALU Power");
        existingString.Notes = "Original notes";
        var request = new UpdateStringRequest(Brand: "Babolat"); // Only updating brand

        _stringRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(existingString);
        _stringRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<TennisString>())).ReturnsAsync((TennisString s) => s);

        // Act
        var result = await _sut.UpdateAsync("123", request);

        // Assert
        result.Should().NotBeNull();
        result!.Brand.Should().Be("Babolat");
        result.Model.Should().Be("ALU Power"); // Should remain unchanged
        result.Notes.Should().Be("Original notes"); // Should remain unchanged
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_ShouldReturnTrue_WhenStringDeleted()
    {
        // Arrange
        _stringRepositoryMock.Setup(x => x.DeleteAsync("123")).ReturnsAsync(true);

        // Act
        var result = await _sut.DeleteAsync("123");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnFalse_WhenStringDoesNotExist()
    {
        // Arrange
        _stringRepositoryMock.Setup(x => x.DeleteAsync("nonexistent")).ReturnsAsync(false);

        // Act
        var result = await _sut.DeleteAsync("nonexistent");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region RemoveAsync Tests

    [Fact]
    public async Task RemoveAsync_ShouldMarkStringAsRemoved_WhenStringExists()
    {
        // Arrange
        var existingString = CreateTestString("123", "Luxilon", "ALU Power", isActive: true);
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(existingString);
        _stringRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<TennisString>())).ReturnsAsync((TennisString s) => s);

        // Act
        var result = await _sut.RemoveAsync("123");

        // Assert
        result.Should().NotBeNull();
        result!.IsActive.Should().BeFalse();
        result.DateRemoved.Should().NotBeNull();
    }

    [Fact]
    public async Task RemoveAsync_ShouldReturnNull_WhenStringDoesNotExist()
    {
        // Arrange
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("nonexistent")).ReturnsAsync((TennisString?)null);

        // Act
        var result = await _sut.RemoveAsync("nonexistent");

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region RestoreAsync Tests

    [Fact]
    public async Task RestoreAsync_ShouldRestoreString_WhenStringExists()
    {
        // Arrange
        var existingString = CreateTestString("123", "Luxilon", "ALU Power", isActive: false);
        existingString.DateRemoved = DateTime.UtcNow.AddDays(-7);
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(existingString);
        _stringRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<TennisString>())).ReturnsAsync((TennisString s) => s);

        // Act
        var result = await _sut.RestoreAsync("123");

        // Assert
        result.Should().NotBeNull();
        result!.IsActive.Should().BeTrue();
        result.DateRemoved.Should().BeNull();
    }

    #endregion

    #region GetUsageStatsAsync Tests

    [Fact]
    public async Task GetUsageStatsAsync_ShouldReturnStats_WhenStringExists()
    {
        // Arrange
        var tennisString = CreateTestString("123", "Luxilon", "ALU Power");
        tennisString.DateStrung = DateTime.UtcNow.AddDays(-30);
        
        var sessions = new List<TennisSession>
        {
            new() { Id = "s1", StringId = "123", DurationMinutes = 60, StringFeelingRating = 8 },
            new() { Id = "s2", StringId = "123", DurationMinutes = 90, StringFeelingRating = 7 }
        };

        _stringRepositoryMock.Setup(x => x.GetByIdAsync("123")).ReturnsAsync(tennisString);
        _sessionRepositoryMock.Setup(x => x.GetByStringIdAsync("123")).ReturnsAsync(sessions);

        // Act
        var result = await _sut.GetUsageStatsAsync("123");

        // Assert
        result.Should().NotBeNull();
        result!.TotalSessions.Should().Be(2);
        result.TotalMinutesPlayed.Should().Be(150);
        result.AverageFeelingRating.Should().Be(7.5);
        result.DaysSinceStrung.Should().BeGreaterOrEqualTo(30);
    }

    [Fact]
    public async Task GetUsageStatsAsync_ShouldReturnNull_WhenStringDoesNotExist()
    {
        // Arrange
        _stringRepositoryMock.Setup(x => x.GetByIdAsync("nonexistent")).ReturnsAsync((TennisString?)null);

        // Act
        var result = await _sut.GetUsageStatsAsync("nonexistent");

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region Helper Methods

    private static TennisString CreateTestString(string id, string brand, string model, bool isActive = true)
    {
        return new TennisString
        {
            Id = id,
            Brand = brand,
            Model = model,
            Gauge = "16",
            Type = StringType.Polyester,
            MainTension = 52,
            CrossTension = 50,
            DateStrung = DateTime.UtcNow,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
