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
    private readonly string _storageBucketUrl = "w-edax-b.appspot.com"; // The Firebase Storage bucket URL

    public FirebaseService()
    {
        // Initialize the Firebase client with your Firebase URL and secret key
        IFirebaseConfig config = new FirebaseConfig
        {
            BasePath = "https://w-edax-b-default-rtdb.firebaseio.com/",
            AuthSecret = "your_firebase_secret_key" // Replace with your actual Firebase secret
        };

        _firebaseClient = new FireSharp.FirebaseClient(config);
    }

    // Method to fetch all articles
    public async Task<List<ArticleModel>> GetArticlesAsync()
    {
        try
        {
            FirebaseResponse response = await _firebaseClient.GetAsync("Articles");
            var articlesDict = response.ResultAs<Dictionary<string, ArticleModel>>();
            return articlesDict?.Values.ToList() ?? new List<ArticleModel>();
        }
        catch (Exception ex)
        {
            throw new Exception("Error fetching articles", ex);
        }
    }

    // Method to fetch a single article by ID
    public async Task<ArticleModel> GetArticleByIdAsync(string articleId)
    {
        try
        {
            FirebaseResponse response = await _firebaseClient.GetAsync($"Articles/{articleId}");
            return response.ResultAs<ArticleModel>();
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching article with ID {articleId}", ex);
        }
    }

    // Method to update an article
    public async Task UpdateArticleAsync(ArticleModel article)
    {
        try
        {
            await _firebaseClient.UpdateAsync($"Articles/{article.ArticleId}", article);
        }
        catch (Exception ex)
        {
            throw new Exception("Error updating article", ex);
        }
    }

    // Method to delete an article
    public async Task DeleteArticleAsync(string articleId)
    {
        try
        {
            await _firebaseClient.DeleteAsync($"Articles/{articleId}");
        }
        catch (Exception ex)
        {
            throw new Exception($"Error deleting article with ID {articleId}", ex);
        }
    }

    // Method to add an article with media files
    public async Task AddArticleAsync(ArticleModel article, List<IFormFile> mediaFiles)
    {
        try
        {
            // Upload media files and get their URLs
            var mediaFileUrls = await UploadMediaFilesAsync(mediaFiles);

            // Add media file URLs to the article model
            article.MediaFileUrls = mediaFileUrls;

            // Add article to Firebase Realtime Database
            await _firebaseClient.SetAsync($"Articles/{article.ArticleId}", article);
        }
        catch (Exception ex)
        {
            throw new Exception("Error adding article", ex);
        }
    }
    public async Task<List<GuestBookEntry>> GetGuestBookEntriesAsync()
    {
        try
        {
            FirebaseResponse response = await _firebaseClient.GetAsync("GuestBookEntries");
            var entriesDict = response.ResultAs<Dictionary<string, GuestBookEntry>>();
            return entriesDict?.Values.ToList() ?? new List<GuestBookEntry>();
        }
        catch (Exception ex)
        {
            throw new Exception("Error fetching guest book entries", ex);
        }
    }

    // Method to upload media files to Firebase Storage
    public async Task<List<string>> UploadMediaFilesAsync(List<IFormFile> mediaFiles)
    {
        var fileUrls = new List<string>();

        foreach (var file in mediaFiles)
        {
            if (file.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = fileName; // Path within Firebase Storage

                var firebaseStorage = new FirebaseStorage(_storageBucketUrl, new FirebaseStorageOptions
                {
                    AuthTokenAsyncFactory = () => Task.FromResult("your_firebase_secret_key"), // Replace with your actual Firebase secret
                });

                using (var stream = file.OpenReadStream())
                {
                    var uploadTask = firebaseStorage.Child("media").Child(filePath).PutAsync(stream);
                    var uploadUrl = await uploadTask;
                    fileUrls.Add(uploadUrl);
                }
            }
        }

        return fileUrls;
    }
}
