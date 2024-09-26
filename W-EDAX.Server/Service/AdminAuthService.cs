using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Mail;
using System.Threading.Tasks;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;

public class AdminAuthService
{
    private readonly ILogger<AdminAuthService> _logger;
    private readonly FirebaseAuth _firebaseAuth;
    private const string AdminEmail = "admin@example.com"; // Admin's email address

    public AdminAuthService(ILogger<AdminAuthService> logger)
    {
        _logger = logger;

        // Initialize Firebase Auth
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile("path/to/your/serviceAccountKey.json"),
        });

        _firebaseAuth = FirebaseAuth.DefaultInstance;
    }

    // -----------------------------------
    // Admin Authentication with Email/Password
    // -----------------------------------

    public async Task<string> AdminSignInWithEmailAndPasswordAsync(string email, string password, string captchaToken)
    {
        try
        {
            // CAPTCHA validation
            bool captchaValid = await ValidateCaptchaAsync(captchaToken);
            if (!captchaValid)
            {
                throw new Exception("CAPTCHA validation failed.");
            }

            // Firebase Admin SDK does not provide email/password sign-in functionality directly.
            // This should be handled client-side and the token validated here.
            // For demonstration purposes, we assume a valid token is provided.
            var user = await _firebaseAuth.GetUserByEmailAsync(email);
            if (user != null && user.CustomClaims != null && user.CustomClaims.ContainsKey("admin") && (bool)user.CustomClaims["admin"])
            {
                return await _firebaseAuth.CreateCustomTokenAsync(user.Uid);
            }
            else
            {
                throw new UnauthorizedAccessException("Admin access required.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Admin email sign-in.");
            throw;
        }
    }

    // -----------------------------------
    // Admin Access Request
    // -----------------------------------

    public async Task RequestAdminAccessAsync(string userEmail, string captchaToken)
    {
        try
        {
            // CAPTCHA validation
            bool captchaValid = await ValidateCaptchaAsync(captchaToken);
            if (!captchaValid)
            {
                throw new Exception("CAPTCHA validation failed.");
            }

            // Send request email to admin
            await SendAdminAccessRequestEmailAsync(userEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Admin access request.");
            throw;
        }
    }

    // -----------------------------------
    // Send Admin Access Request Email
    // -----------------------------------

    private async Task SendAdminAccessRequestEmailAsync(string userEmail)
    {
        try
        {
            // Set up email content
            var fromAddress = new MailAddress("no-reply@yourdomain.com", "Your App");
            var toAddress = new MailAddress(AdminEmail);
            const string subject = "Admin Access Request";
            string body = $"User {userEmail} has requested access to the admin portal.";

            // SMTP client configuration
            var smtpClient = new SmtpClient("smtp.yourdomain.com")
            {
                Port = 587,
                Credentials = new System.Net.NetworkCredential("your-smtp-username", "your-smtp-password"),
                EnableSsl = true,
            };

            using (var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body
            })
            {
                await smtpClient.SendMailAsync(message);
            }

            _logger.LogInformation($"Admin access request sent to {AdminEmail}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending admin access request email.");
            throw;
        }
    }

    // -----------------------------------
    // CAPTCHA Verification
    // -----------------------------------

    private async Task<bool> ValidateCaptchaAsync(string captchaToken)
    {
        try
        {
            // CAPTCHA verification logic (e.g., reCAPTCHA v2)
            var recaptchaSecret = "YOUR_RECAPTCHA_SECRET_KEY";
            var recaptchaUrl = $"https://www.google.com/recaptcha/api/siteverify?secret={recaptchaSecret}&response={captchaToken}";

            using (var httpClient = new HttpClient())
            {
                var response = await httpClient.GetStringAsync(recaptchaUrl);
                var captchaResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<CaptchaResponse>(response);
                return captchaResponse.Success;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CAPTCHA validation error.");
            return false;
        }
    }

    // -----------------------------------
    // Manage Admin Users
    // -----------------------------------

    // Assign admin claims to a user
    public async Task AssignAdminRoleAsync(string userId)
    {
        try
        {
            var claims = new Dictionary<string, object>
            {
                { "admin", true }
            };

            await _firebaseAuth.SetCustomUserClaimsAsync(userId, claims);
            _logger.LogInformation($"Admin role assigned to user {userId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error assigning admin role to user {userId}.");
            throw;
        }
    }

    // Remove admin role from a user
    public async Task RemoveAdminRoleAsync(string userId)
    {
        try
        {
            var claims = new Dictionary<string, object>
            {
                { "admin", false }
            };

            await _firebaseAuth.SetCustomUserClaimsAsync(userId, claims);
            _logger.LogInformation($"Admin role removed from user {userId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error removing admin role from user {userId}.");
            throw;
        }
    }
}

// -----------------------------------
// CAPTCHA Response Model
// -----------------------------------
public class CaptchaResponse
{
    public bool Success { get; set; }
    public List<string> ErrorCodes { get; set; }
}
