using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FireSharp.Config;
using FireSharp.Interfaces;
using FireSharp.Response;

public class GuestBookService
{
    private readonly IFirebaseClient _firebaseClient;

    public GuestBookService()
    {
        IFirebaseConfig config = new FirebaseConfig
        {
            BasePath = "https://w-edax-b-default-rtdb.firebaseio.com/",
            AuthSecret = "AIzaSyDBK2cJVX4WsmwIoLxuykYk2NZiMj-TiyM" // Ensure this is a valid API key
        };

        _firebaseClient = new FireSharp.FirebaseClient(config);
    }

    public async Task AddGuestBookEntryAsync(string githubUsername, string uid, string message, string profilePicUrl)
    {
        try
        {
            var messageId = HasherIds.GenerateMessageId(); // Generate unique Message ID

            var entry = new GuestBookModel
            {
                GitHubUsername = githubUsername,
                UserId = uid,
                Message = message,
                MessageId = messageId,
                DatePosted = DateTime.UtcNow,
                ProfilePicUrl = profilePicUrl
            };

            var messagePath = $"GuestBook/Users/{uid}/Messages/{messageId}";
            await _firebaseClient.SetAsync(messagePath, entry);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding guest book entry: {ex.Message}");
            throw; // Re-throw to handle it in the controller
        }
    }

    public async Task<Dictionary<string, Dictionary<string, GuestBookModel>>> GetAllGuestBookEntriesAsync()
    {
        try
        {
            var path = "GuestBook/Users";
            FirebaseResponse response = await _firebaseClient.GetAsync(path);

            if (string.IsNullOrEmpty(response.Body) || response.Body == "null")
                return new Dictionary<string, Dictionary<string, GuestBookModel>>();

            var usersDict = response.ResultAs<Dictionary<string, UserMessages>>();

            var guestBookEntries = new Dictionary<string, Dictionary<string, GuestBookModel>>();

            foreach (var user in usersDict)
            {
                if (user.Value.Messages != null)
                {
                    guestBookEntries[user.Key] = user.Value.Messages;
                }
            }

            return guestBookEntries;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching guest book entries for all users: {ex.Message}");
            throw new Exception("Error fetching guest book entries for all users", ex);
        }
    }

    public async Task<Dictionary<string, GuestBookModel>> GetGuestBookEntriesAsync(string uid)
    {
        try
        {
            var path = $"GuestBook/Users/{uid}/Messages";
            FirebaseResponse response = await _firebaseClient.GetAsync(path);

            if (string.IsNullOrEmpty(response.Body) || response.Body == "null")
                return new Dictionary<string, GuestBookModel>();

            var entriesDict = response.ResultAs<Dictionary<string, GuestBookModel>>();
            return entriesDict ?? new Dictionary<string, GuestBookModel>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching guest book entries for user {uid}: {ex.Message}");
            throw new Exception($"Error fetching guest book entries for user {uid}", ex);
        }
    }

    public async Task DeleteGuestBookEntryAsync(string userId, string messageId)
    {
        try
        {
            var path = $"GuestBook/Users/{userId}/Messages/{messageId}";
            FirebaseResponse response = await _firebaseClient.DeleteAsync(path);

            if (response.StatusCode != System.Net.HttpStatusCode.OK)
            {
                throw new Exception("Failed to delete the message.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting guest book entry: {ex.Message}");
            throw;
        }
    }

    public async Task DeleteAllGuestBookEntriesAsync(string userId)
    {
        try
        {
            var messages = await GetGuestBookEntriesAsync(userId);

            foreach (var messageId in messages.Keys)
            {
                var path = $"GuestBook/Users/{userId}/Messages/{messageId}";
                var response = await _firebaseClient.DeleteAsync(path);

                if (response.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    Console.WriteLine($"Failed to delete message with ID {messageId}.");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting all guest book entries for user {userId}: {ex.Message}");
            throw;
        }
    }

    // A model class for deserializing the User -> Messages structure
    public class UserMessages
    {
        public Dictionary<string, GuestBookModel> Messages { get; set; }
    }
}
