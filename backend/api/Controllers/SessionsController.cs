using Microsoft.AspNetCore.Mvc;
using TennisJournal.Api.Models;
using TennisJournal.Api.Models.DTOs;
using TennisJournal.Api.Services;

namespace TennisJournal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class SessionsController : ControllerBase
{
    private readonly IDataService _dataService;

    public SessionsController(IDataService dataService)
    {
        _dataService = dataService;
    }

    /// <summary>
    /// Get all tennis sessions
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TennisSession>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TennisSession>>> GetAll()
    {
        var sessions = await _dataService.GetAllSessionsAsync();
        return Ok(sessions);
    }

    /// <summary>
    /// Get a specific tennis session by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TennisSession), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TennisSession>> GetById(string id)
    {
        var session = await _dataService.GetSessionByIdAsync(id);
        if (session == null)
            return NotFound();
        
        return Ok(session);
    }

    /// <summary>
    /// Get a tennis session with its associated string details
    /// </summary>
    [HttpGet("{id}/with-string")]
    [ProducesResponseType(typeof(TennisSessionWithString), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TennisSessionWithString>> GetWithString(string id)
    {
        var session = await _dataService.GetSessionByIdAsync(id);
        if (session == null)
            return NotFound();

        TennisString? tennisString = null;
        if (!string.IsNullOrEmpty(session.StringId))
        {
            tennisString = await _dataService.GetStringByIdAsync(session.StringId);
        }

        return Ok(new TennisSessionWithString
        {
            Session = session,
            String = tennisString
        });
    }

    /// <summary>
    /// Create a new tennis session
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TennisSession), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TennisSession>> Create([FromBody] CreateTennisSessionRequest request)
    {
        // Validate string ID if provided
        if (!string.IsNullOrEmpty(request.StringId))
        {
            var tennisString = await _dataService.GetStringByIdAsync(request.StringId);
            if (tennisString == null)
                return BadRequest($"String with ID '{request.StringId}' not found");
        }

        var session = new TennisSession
        {
            SessionDate = request.SessionDate,
            Type = request.Type,
            DurationMinutes = request.DurationMinutes,
            Location = request.Location,
            Surface = request.Surface,
            StringId = request.StringId,
            StringFeelingRating = request.StringFeelingRating,
            StringNotes = request.StringNotes,
            Notes = request.Notes
        };

        var created = await _dataService.CreateSessionAsync(session);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing tennis session
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TennisSession), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TennisSession>> Update(string id, [FromBody] UpdateTennisSessionRequest request)
    {
        var existing = await _dataService.GetSessionByIdAsync(id);
        if (existing == null)
            return NotFound();

        // Validate string ID if being updated
        if (!string.IsNullOrEmpty(request.StringId))
        {
            var tennisString = await _dataService.GetStringByIdAsync(request.StringId);
            if (tennisString == null)
                return BadRequest($"String with ID '{request.StringId}' not found");
        }

        existing.SessionDate = request.SessionDate ?? existing.SessionDate;
        existing.Type = request.Type ?? existing.Type;
        existing.DurationMinutes = request.DurationMinutes ?? existing.DurationMinutes;
        existing.Location = request.Location ?? existing.Location;
        existing.Surface = request.Surface ?? existing.Surface;
        existing.StringId = request.StringId ?? existing.StringId;
        existing.StringFeelingRating = request.StringFeelingRating ?? existing.StringFeelingRating;
        existing.StringNotes = request.StringNotes ?? existing.StringNotes;
        existing.Notes = request.Notes ?? existing.Notes;

        var updated = await _dataService.UpdateSessionAsync(id, existing);
        return Ok(updated);
    }

    /// <summary>
    /// Delete a tennis session
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _dataService.DeleteSessionAsync(id);
        if (!deleted)
            return NotFound();
        
        return NoContent();
    }
}
