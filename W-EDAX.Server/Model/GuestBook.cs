using System;
using System.Collections.Generic;

public class GuestBook
{
    // Dictionary structure for GuestBook: UserName -> userId -> DatePosted -> GuestBookModel
    public Dictionary<string, Dictionary<string, Dictionary<string, GuestBookModel>>> Users { get; set; }
        = new Dictionary<string, Dictionary<string, Dictionary<string, GuestBookModel>>>();

    // Method to remove messages older than a week
    public void RemoveOldMessages()
    {
        foreach (var userEntries in Users.Values)
        {
            foreach (var userIdEntries in userEntries.Values)
            {
                var keysToRemove = new List<string>();

                foreach (var entry in userIdEntries)
                {
                    if (DateTime.Parse(entry.Value.DatePosted.ToString()) < DateTime.UtcNow.AddDays(-7))
                    {
                        keysToRemove.Add(entry.Key);
                    }
                }

                foreach (var key in keysToRemove)
                {
                    userIdEntries.Remove(key);
                }
            }
        }
    }
}

