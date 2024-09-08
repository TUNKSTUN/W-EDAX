using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FireSharp.Config;
using FireSharp.Interfaces;
using FireSharp.Response;
using Firebase.Storage;
using System.IO;
using Microsoft.AspNetCore.Http;

public class FirebaseService
{
    private readonly IFirebaseClient _firebaseClient;
    private readonly string _storageBucketUrl = "w-edax-b.appspot.com"; // Firebase Storage bucket URL
    private readonly string _authkey = "AIzaSyDBK2cJVX4WsmwIoLxuykYk2NZiMj-TiyM";

    public FirebaseService()
    {
        // Initialize Firebase client with your Firebase URL and API key
        IFirebaseConfig config = new FirebaseConfig
        {
            BasePath = "https://w-edax-b-default-rtdb.firebaseio.com/",
            AuthSecret = _authkey // Replace with actual Firebase API key
        };

        _firebaseClient = new FireSharp.FirebaseClient(config);
    }

    // Fetch all articles
    public async Task<List<ArticleModel>> GetArticlesAsync()
    {
        try
        {
            FirebaseResponse response = await _firebaseClient.GetAsync("Articles");
            if (response.Body == "null") return new List<ArticleModel>();

            var articlesDict = response.ResultAs<Dictionary<string, ArticleModel>>();
            return articlesDict?.Values.ToList() ?? new List<ArticleModel>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching articles: {ex.Message}");
            throw new Exception("Error fetching articles", ex);
        }
    }

    // Fetch article by ID
    public async Task<ArticleModel> GetArticleByIdAsync(string articleId)
    {
        try
        {
            FirebaseResponse response = await _firebaseClient.GetAsync($"Articles/{articleId}");
            return response.ResultAs<ArticleModel>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching article with ID {articleId}: {ex.Message}");
            throw new Exception($"Error fetching article with ID {articleId}", ex);
        }
    }

    // Update an article
    public async Task UpdateArticleAsync(ArticleModel article)
    {
        try
        {
            await _firebaseClient.UpdateAsync($"Articles/{article.ArticleId}", article);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating article: {ex.Message}");
            throw new Exception("Error updating article", ex);
        }
    }

    // Delete an article
    public async Task DeleteArticleAsync(string articleId)
    {
        try
        {
            await _firebaseClient.DeleteAsync($"Articles/{articleId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting article with ID {articleId}: {ex.Message}");
            throw new Exception($"Error deleting article with ID {articleId}", ex);
        }
    }

    // Add an article with media files
    public async Task AddArticleAsync(ArticleModel article, List<IFormFile> mediaFiles)
    {
        try
        {
            // Upload media files and get their URLs
            var mediaFileUrls = await UploadMediaFilesAsync(mediaFiles);
            article.MediaFileUrls = mediaFileUrls;

            // Add article to Firebase Realtime Database
            await _firebaseClient.SetAsync($"Articles/{article.ArticleId}", article);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding article: {ex.Message}");
            throw new Exception("Error adding article", ex);
        }
    }

    // Fetch all guest book entries
    public async Task<List<GuestBookModel>> GetGuestBookEntriesAsync()
    {
        try
        {
            FirebaseResponse response = await _firebaseClient.GetAsync("GuestBookEntries");
            if (response.Body == "null") return new List<GuestBookModel>();

            var entriesDict = response.ResultAs<Dictionary<string, GuestBookModel>>();
            return entriesDict?.Values.ToList() ?? new List<GuestBookModel>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching guest book entries: {ex.Message}");
            throw new Exception("Error fetching guest book entries", ex);
        }
    }

    // Add a new guest book entry
    public async Task AddGuestBookEntryAsync(GuestBookModel entry)
    {
        try
        {
            var newId = Guid.NewGuid().ToString();
            await _firebaseClient.SetAsync($"GuestBookEntries/{newId}", entry);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding guest book entry: {ex.Message}");
            throw new Exception("Error adding guest book entry", ex);
        }
    }

    // Upload media files to Firebase Storage
    public async Task<List<string>> UploadMediaFilesAsync(List<IFormFile> mediaFiles)
    {
        var fileUrls = new List<string>();
        var firebaseStorage = new FirebaseStorage(_storageBucketUrl, new FirebaseStorageOptions
        {
            AuthTokenAsyncFactory = () => Task.FromResult(_authkey) // Replace with Firebase API key
        });

        foreach (var file in mediaFiles)
        {
            if (file.Length > 0)
            {
                var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
                var filePath = $"media/{fileName}";

                using (var stream = file.OpenReadStream())
                {
                    try
                    {
                        var uploadTask = firebaseStorage.Child(filePath).PutAsync(stream);
                        var uploadUrl = await uploadTask;
                        fileUrls.Add(uploadUrl);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error uploading file {fileName}: {ex.Message}");
                        throw new Exception($"Error uploading file {fileName}", ex);
                    }
                }
            }
        }

        return fileUrls;
    }
}
