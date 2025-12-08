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
        tennisString.Status.Should().Be(StringStatus.Inventory);
        tennisString.DateRemoved.Should().BeNull();
    }

    [Fact]
    public void MarkAsRemoved_ShouldSetStatusToRemoved_AndSetDateRemoved()
    {
        // Arrange
        var tennisString = new TennisString
        {
            Brand = "Luxilon",
            Model = "ALU Power",
            Status = StringStatus.Strung
        };
        var beforeUpdate = tennisString.UpdatedAt;

        // Act
        tennisString.MarkAsRemoved();

        // Assert
        tennisString.Status.Should().Be(StringStatus.Removed);
        tennisString.DateRemoved.Should().NotBeNull();
        tennisString.DateRemoved.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        tennisString.UpdatedAt.Should().BeOnOrAfter(beforeUpdate);
    }

    [Fact]
    public void ReturnToInventory_ShouldSetStatusToInventory_AndClearDates()
    {
        // Arrange
        var tennisString = new TennisString
        {
            Brand = "Luxilon",
            Model = "ALU Power",
            Status = StringStatus.Removed,
            DateStrung = DateTime.UtcNow.AddDays(-30),
            DateRemoved = DateTime.UtcNow.AddDays(-7)
        };

        // Act
        tennisString.ReturnToInventory();

        // Assert
        tennisString.Status.Should().Be(StringStatus.Inventory);
        tennisString.DateStrung.Should().BeNull();
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
            Status = StringStatus.Removed,
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
        tennisString.Status.Should().Be(StringStatus.Removed);
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
