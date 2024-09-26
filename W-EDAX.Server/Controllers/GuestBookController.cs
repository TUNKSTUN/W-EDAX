using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[EnableCors("AllowAll")]
public class GuestBookController : ControllerBase
{
    private readonly GuestBookService _guestBookService;

    public GuestBookController(GuestBookService guestBookService)
    {
        _guestBookService = guestBookService;
    }

    [HttpPost("Users/{userId}/Messages/{messageId}")]
    public async Task<IActionResult> AddGuestBookEntry(string userId, string messageId, [FromBody] GuestBookModel entry)
    {
        if (entry == null || string.IsNullOrEmpty(entry.Message))
        {
            return BadRequest("Invalid guest book entry data.");
        }

        try
        {
            await _guestBookService.AddGuestBookEntryAsync(entry.GitHubUsername, userId, entry.Message, entry.ProfilePicUrl);
            return CreatedAtAction(nameof(GetGuestBookEntries), new { userId }, entry);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("Users/{userId}/Messages")]
    public async Task<IActionResult> GetGuestBookEntries(string userId)
    {
        try
        {
            var entries = await _guestBookService.GetGuestBookEntriesAsync(userId);
            if (entries == null || entries.Count == 0)
                return NotFound($"No messages found for user '{userId}'.");

            return Ok(entries);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("Allmessages")]
    public async Task<IActionResult> GetAllGuestBookEntries()
    {
        try
        {
            var entries = await _guestBookService.GetAllGuestBookEntriesAsync();
            if (entries == null || entries.Count == 0)
                return NotFound("No messages found.");

            return Ok(entries);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }


    [HttpDelete("Users/{userId}/Messages/{messageId}")]
    public async Task<IActionResult> DeleteGuestBookEntry(string userId, string messageId)
    {
        try
        {
            await _guestBookService.DeleteGuestBookEntryAsync(userId, messageId);
            return NoContent(); // Return 204 No Content on successful deletion
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // New method to delete all messages for a specific user
    [HttpDelete("Users/{userId}/Messages")]
    public async Task<IActionResult> DeleteAllGuestBookEntries(string userId)
    {
        try
        {
            await _guestBookService.DeleteAllGuestBookEntriesAsync(userId);
            return NoContent(); // Return 204 No Content on successful deletion
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }


}
