using TennisJournal.Domain.Entities;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Tests.Domain;

public class TennisStringTests
{
    [Fact]
    public void TennisString_ShouldInitializeWithDefaults()
    {
        // Act
        var tennisString = new TennisString();

        // Assert
        tennisString.Id.Should().NotBeNullOrEmpty();
        tennisString.Brand.Should().BeEmpty();
        tennisString.Model.Should().BeEmpty();
        tennisString.IsActive.Should().BeTrue();
        tennisString.DateRemoved.Should().BeNull();
    }

    [Fact]
    public void MarkAsRemoved_ShouldSetIsActiveToFalse_AndSetDateRemoved()
    {
        // Arrange
        var tennisString = new TennisString
        {
            Brand = "Luxilon",
            Model = "ALU Power",
            IsActive = true
        };
        var beforeUpdate = tennisString.UpdatedAt;

        // Act
        tennisString.MarkAsRemoved();

        // Assert
        tennisString.IsActive.Should().BeFalse();
        tennisString.DateRemoved.Should().NotBeNull();
        tennisString.DateRemoved.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        tennisString.UpdatedAt.Should().BeOnOrAfter(beforeUpdate);
    }

    [Fact]
    public void Restore_ShouldSetIsActiveToTrue_AndClearDateRemoved()
    {
        // Arrange
        var tennisString = new TennisString
        {
            Brand = "Luxilon",
            Model = "ALU Power",
            IsActive = false,
            DateRemoved = DateTime.UtcNow.AddDays(-7)
        };

        // Act
        tennisString.Restore();

        // Assert
        tennisString.IsActive.Should().BeTrue();
        tennisString.DateRemoved.Should().BeNull();
        tennisString.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void TennisString_ShouldStoreAllProperties()
    {
        // Arrange
        var dateStrung = DateTime.UtcNow.AddDays(-30);
        var dateRemoved = DateTime.UtcNow;

        // Act
        var tennisString = new TennisString
        {
            Id = "test-id",
            Brand = "Babolat",
            Model = "RPM Blast",
            Gauge = "17",
            Type = StringType.Polyester,
            MainTension = 54,
            CrossTension = 52,
            DateStrung = dateStrung,
            DateRemoved = dateRemoved,
            IsActive = false,
            Notes = "Test notes"
        };

        // Assert
        tennisString.Id.Should().Be("test-id");
        tennisString.Brand.Should().Be("Babolat");
        tennisString.Model.Should().Be("RPM Blast");
        tennisString.Gauge.Should().Be("17");
        tennisString.Type.Should().Be(StringType.Polyester);
        tennisString.MainTension.Should().Be(54);
        tennisString.CrossTension.Should().Be(52);
        tennisString.DateStrung.Should().Be(dateStrung);
        tennisString.DateRemoved.Should().Be(dateRemoved);
        tennisString.IsActive.Should().BeFalse();
        tennisString.Notes.Should().Be("Test notes");
    }

    [Theory]
    [InlineData(StringType.Polyester)]
    [InlineData(StringType.NaturalGut)]
    [InlineData(StringType.SyntheticGut)]
    [InlineData(StringType.Multifilament)]
    [InlineData(StringType.Hybrid)]
    public void TennisString_ShouldAcceptAllStringTypes(StringType type)
    {
        // Act
        var tennisString = new TennisString { Type = type };

        // Assert
        tennisString.Type.Should().Be(type);
    }
}
