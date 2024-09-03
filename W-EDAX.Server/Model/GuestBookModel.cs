using System;
using System.Collections.Generic;

public class GuestBookModel
{
    public string UserName { get; set; } = string.Empty;               // GitHub username of the user
    public string Message { get; set; } = string.Empty;                // Message left by the user
    public DateTime DatePosted { get; set; } = DateTime.UtcNow;        // Date the message was posted
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
public class GuestBookEntry
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}


