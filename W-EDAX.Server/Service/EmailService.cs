using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // Method to send an email
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpServer = _configuration["Mailgun:SmtpServer"];
        var username = _configuration["Mailgun:Username"];
        var password = _configuration["Mailgun:Password"];
        var port = int.Parse(_configuration["Mailgun:Port"]);

        using (var client = new SmtpClient(smtpServer, port))
        {
            client.Credentials = new NetworkCredential(username, password);
            client.EnableSsl = true; // Ensure SSL is enabled

            var mailMessage = new MailMessage
            {
                From = new MailAddress(username),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage);
        }
    }

    // New method to get email details (e.g., server, port, username) before sending
    public Task<string> GetEmailDetailsAsync()
    {
        var smtpServer = _configuration["Mailgun:SmtpServer"];
        var username = _configuration["Mailgun:Username"];
        var port = _configuration["Mailgun:Port"];

        string details = $@"
            SMTP Server: {smtpServer}
            Port: {port}
            Username: {username}";

        return Task.FromResult(details);
    }
}
