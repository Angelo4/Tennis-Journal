using Microsoft.AspNetCore.Mvc;
using TennisJournal.Application.DTOs.Strings;
using TennisJournal.Application.Services;

namespace TennisJournal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class StringsController : ControllerBase
{
    private readonly IStringService _stringService;

    public StringsController(IStringService stringService)
    {
        _stringService = stringService;
    }

    /// <summary>
    /// Get all tennis strings
    /// </summary>
    /// <param name="isActive">Filter by active status. If null, returns all strings.</param>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<StringResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<StringResponse>>> GetAll([FromQuery] bool? isActive = null)
    {
        var strings = await _stringService.GetAllAsync(isActive);
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
        var result = await _stringService.GetByIdAsync(id);
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
        var result = await _stringService.GetUsageStatsAsync(id);
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
        var created = await _stringService.CreateAsync(request);
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
        var updated = await _stringService.UpdateAsync(id, request);
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
        var deleted = await _stringService.DeleteAsync(id);
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
    public async Task<ActionResult<StringResponse>> Remove(string id)
    {
        var result = await _stringService.RemoveAsync(id);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Restore a removed string (mark as active again)
    /// </summary>
    [HttpPost("{id}/restore")]
    [ProducesResponseType(typeof(StringResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StringResponse>> Restore(string id)
    {
        var result = await _stringService.RestoreAsync(id);
        if (result == null)
            return NotFound();

        return Ok(result);
    }
}
