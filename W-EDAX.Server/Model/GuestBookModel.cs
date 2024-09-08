using System;
using System.Collections.Generic;

public class GuestBookModel
{
    public string GuestName { get; set; } = string.Empty; // GitHub username of the user
    public string Message { get; set; } = string.Empty;    // Message left by the user
    public DateTime DatePosted { get; set; } = DateTime.UtcNow; // Date the message was posted
    public string? Email { get; set; } = string.Empty; // Optional email field for the guest
    public bool? IsApproved { get; set; } = false; // Optional field to indicate if the message is approved for display
    public string? FirebaseUserId { get; set; } = string.Empty; // Firebase User ID for tracking
    public string? AccessToken { get; set; } = string.Empty; // Access token associated with the user (if needed)
}

public class GuestBook
{
    public List<GuestBookModel> Entries { get; set; } = new List<GuestBookModel>(); // List of guestbook entries

    // Method to remove messages older than a week
    public void RemoveOldMessages()
    {
        Entries.RemoveAll(entry => entry.DatePosted < DateTime.UtcNow.AddDays(-7));
    }
}
