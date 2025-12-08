using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Application.Services;
using TennisJournal.Domain.Enums;

namespace TennisJournal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class StringsController : ControllerBase
{
    private readonly IStringService _stringService;

    public StringsController(IStringService stringService)
    {
        _stringService = stringService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User ID not found in token");

    /// <summary>
    /// Get all tennis strings
    /// </summary>
    /// <param name="status">Filter by string status (0=Inventory, 1=Strung, 2=Removed). If null, returns all strings.</param>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<StringResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<StringResponse>>> GetAll([FromQuery] StringStatus? status = null)
    {
        var userId = GetUserId();
        var strings = await _stringService.GetAllAsync(userId, status);
        return Ok(strings);
    }

    /// <summary>
    /// Get a specific tennis string by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(StringResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StringResponse>> GetById(string id)
    {
        var userId = GetUserId();
        var result = await _stringService.GetByIdAsync(id, userId);
        if (result == null)
            return NotFound();
        
        return Ok(result);
    }

    /// <summary>
    /// Get usage statistics for a specific string
    /// </summary>
    [HttpGet("{id}/usage")]
    [ProducesResponseType(typeof(StringUsageStatsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StringUsageStatsResponse>> GetUsageStats(string id)
    {
        var userId = GetUserId();
        var result = await _stringService.GetUsageStatsAsync(id, userId);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Create a new tennis string
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(StringResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<StringResponse>> Create([FromBody] CreateStringRequest request)
    {
        var userId = GetUserId();
        var created = await _stringService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing tennis string
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(StringResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StringResponse>> Update(string id, [FromBody] UpdateStringRequest request)
    {
        var userId = GetUserId();
        var updated = await _stringService.UpdateAsync(id, request, userId);
        if (updated == null)
            return NotFound();

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
        var userId = GetUserId();
        var deleted = await _stringService.DeleteAsync(id, userId);
        if (!deleted)
            return NotFound();
        
        return NoContent();
    }

    /// <summary>
    /// Mark a string as removed (no longer on racquet)
    /// </summary>
    [HttpPost("{id}/remove")]
    [ProducesResponseType(typeof(StringResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StringResponse>> Remove(string id, [FromBody] RemoveStringRequest? request = null)
    {
        var userId = GetUserId();
        var result = await _stringService.RemoveAsync(id, userId, request?.DateRemoved);
        if (result == null)
            return NotFound();

        return Ok(result);
    }
}

public record RemoveStringRequest(DateTime? DateRemoved);
