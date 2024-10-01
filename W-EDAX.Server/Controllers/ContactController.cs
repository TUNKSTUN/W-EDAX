using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly EmailService _emailService;

    public ContactController(EmailService emailService)
    {
        _emailService = emailService;
    }

    // POST method for sending the contact form
    [HttpPost]
    public async Task<IActionResult> SendContactForm([FromBody] EmailRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Message) ||
            string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("All fields are required.");
        }

        try
        {
            await _emailService.SendEmailAsync(request.Email, $"Contact Form Submission from {request.Name}", request.Message);
            return Ok("Email sent successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception: {ex.ToString()}");
            return BadRequest($"Failed to send email: {ex.Message}");
        }
    }

    // New GET method to get email configuration details
    [HttpGet("details")]
    public async Task<IActionResult> GetEmailDetails()
    {
        try
        {
            // Get email details from the EmailService
            var emailDetails = await _emailService.GetEmailDetailsAsync();
            return Ok(emailDetails);
        }
        catch (Exception ex)
        {
            return BadRequest($"Failed to retrieve email details: {ex.Message}");
        }
    }
}
