using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class GuestBookController : ControllerBase
{
    private readonly FirebaseService _firebaseService;

    public GuestBookController(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    // Get all guest book entries
    [HttpGet]
    public async Task<IActionResult> GetGuestBookEntries()
    {
        var entries = await _firebaseService.GetGuestBookEntriesAsync();
        return Ok(entries);
    }

    // Add a new guest book entry
    [HttpPost]
    public async Task<IActionResult> AddGuestBookEntry([FromBody] GuestBookModel entry)
    {
        if (entry == null || string.IsNullOrEmpty(entry.GuestName) || string.IsNullOrEmpty(entry.Message))
        {
            return BadRequest("Invalid guest book entry data.");
        }

        await _firebaseService.AddGuestBookEntryAsync(entry);
        return CreatedAtAction(nameof(GetGuestBookEntries), new { id = entry.GuestName }, entry);
    }
}
