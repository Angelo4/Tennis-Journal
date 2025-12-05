using Microsoft.AspNetCore.Mvc;
using TennisJournal.Application.DTOs.Sessions;
using TennisJournal.Application.Services;

namespace TennisJournal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    /// <summary>
    /// Get all tennis sessions
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SessionResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<SessionResponse>>> GetAll()
    {
        var sessions = await _sessionService.GetAllAsync();
        return Ok(sessions);
    }

    /// <summary>
    /// Get a specific tennis session by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SessionResponse>> GetById(string id)
    {
        var session = await _sessionService.GetByIdAsync(id);
        if (session == null)
            return NotFound();
        
        return Ok(session);
    }

    /// <summary>
    /// Get a tennis session with its associated string details
    /// </summary>
    [HttpGet("{id}/with-string")]
    [ProducesResponseType(typeof(SessionWithStringResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SessionWithStringResponse>> GetWithString(string id)
    {
        var result = await _sessionService.GetWithStringAsync(id);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Create a new tennis session
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SessionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SessionResponse>> Create([FromBody] CreateSessionRequest request)
    {
        // Validate string ID if provided
        if (!string.IsNullOrEmpty(request.StringId))
        {
            var stringExists = await _sessionService.StringExistsAsync(request.StringId);
            if (!stringExists)
                return BadRequest($"String with ID '{request.StringId}' not found");
        }

        var created = await _sessionService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing tennis session
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(SessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SessionResponse>> Update(string id, [FromBody] UpdateSessionRequest request)
    {
        // Validate string ID if being updated
        if (!string.IsNullOrEmpty(request.StringId))
        {
            var stringExists = await _sessionService.StringExistsAsync(request.StringId);
            if (!stringExists)
                return BadRequest($"String with ID '{request.StringId}' not found");
        }

        var updated = await _sessionService.UpdateAsync(id, request);
        if (updated == null)
            return NotFound();

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
        var deleted = await _sessionService.DeleteAsync(id);
        if (!deleted)
            return NotFound();
        
        return NoContent();
    }
}
