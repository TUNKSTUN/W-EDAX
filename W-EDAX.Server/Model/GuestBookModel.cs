public class GuestBookModel
{
    public string UserId { get; set; }
    public string GitHubUsername { get; set; }
    public string MessageId { get; set; }
    public DateTime DatePosted { get; set; } // Use DateTime
    public string Message { get; set; }
    public bool IsApproved { get; set; }
    public string ProfilePicUrl { get; set; }
    public string Uid { get; set; }
}
