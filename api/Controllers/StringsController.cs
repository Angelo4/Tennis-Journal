using Microsoft.AspNetCore.Mvc;
using TennisJournal.Api.Models;
using TennisJournal.Api.Models.DTOs;
using TennisJournal.Api.Services;

namespace TennisJournal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class StringsController : ControllerBase
{
    private readonly IDataService _dataService;

    public StringsController(IDataService dataService)
    {
        _dataService = dataService;
    }

    /// <summary>
    /// Get all tennis strings
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TennisString>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TennisString>>> GetAll()
    {
        var strings = await _dataService.GetAllStringsAsync();
        return Ok(strings);
    }

    /// <summary>
    /// Get a specific tennis string by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TennisString), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TennisString>> GetById(string id)
    {
        var tennisString = await _dataService.GetStringByIdAsync(id);
        if (tennisString == null)
            return NotFound();
        
        return Ok(tennisString);
    }

    /// <summary>
    /// Get usage statistics for a specific string
    /// </summary>
    [HttpGet("{id}/usage")]
    [ProducesResponseType(typeof(StringUsageStats), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StringUsageStats>> GetUsageStats(string id)
    {
        var tennisString = await _dataService.GetStringByIdAsync(id);
        if (tennisString == null)
            return NotFound();

        var sessions = await _dataService.GetSessionsByStringIdAsync(id);
        var sessionList = sessions.ToList();

        var stats = new StringUsageStats
        {
            StringId = id,
            String = tennisString,
            TotalSessions = sessionList.Count,
            TotalMinutesPlayed = sessionList.Sum(s => s.DurationMinutes),
            AverageFeelingRating = sessionList
                .Where(s => s.StringFeelingRating.HasValue)
                .Select(s => s.StringFeelingRating!.Value)
                .DefaultIfEmpty(0)
                .Average(),
            DaysSinceStrung = (int)(DateTime.UtcNow - tennisString.DateStrung).TotalDays
        };

        return Ok(stats);
    }

    /// <summary>
    /// Create a new tennis string
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TennisString), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TennisString>> Create([FromBody] CreateTennisStringRequest request)
    {
        var tennisString = new TennisString
        {
            Brand = request.Brand,
            Model = request.Model,
            Gauge = request.Gauge,
            Type = request.Type,
            MainTension = request.MainTension,
            CrossTension = request.CrossTension,
            DateStrung = request.DateStrung,
            Notes = request.Notes
        };

        var created = await _dataService.CreateStringAsync(tennisString);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing tennis string
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TennisString), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TennisString>> Update(string id, [FromBody] UpdateTennisStringRequest request)
    {
        var existing = await _dataService.GetStringByIdAsync(id);
        if (existing == null)
            return NotFound();

        existing.Brand = request.Brand ?? existing.Brand;
        existing.Model = request.Model ?? existing.Model;
        existing.Gauge = request.Gauge ?? existing.Gauge;
        existing.Type = request.Type ?? existing.Type;
        existing.MainTension = request.MainTension ?? existing.MainTension;
        existing.CrossTension = request.CrossTension ?? existing.CrossTension;
        existing.DateStrung = request.DateStrung ?? existing.DateStrung;
        existing.Notes = request.Notes ?? existing.Notes;

        var updated = await _dataService.UpdateStringAsync(id, existing);
        return Ok(updated);
    }

    /// <summary>
    /// Delete a tennis string
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _dataService.DeleteStringAsync(id);
        if (!deleted)
            return NotFound();
        
        return NoContent();
    }
}
