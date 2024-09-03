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
}
