using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Firebase.Storage;
using FireSharp.Interfaces;
using FireSharp.Response;
using Microsoft.Extensions.Logging;

public class ArticleService
{
    private readonly IFirebaseClient _firebaseClient;
    private readonly ILogger<ArticleService> _logger;

    public ArticleService(IFirebaseClient firebaseClient, ILogger<ArticleService> logger)
    {
        _firebaseClient = firebaseClient;
        _logger = logger;
    }

    // Fetch all articles
    public async Task<List<ArticleModel>> GetArticlesAsync()
    {
        try
        {
            FirebaseResponse response = await _firebaseClient.GetAsync("Articles");
            if (response.Body == "null") return new List<ArticleModel>();

            var articlesDict = response.ResultAs<Dictionary<string, ArticleModel>>();
            var articles = articlesDict?.Values.ToList() ?? new List<ArticleModel>();

            foreach (var article in articles)
            {
                article.MediaFileUrls = await GetMediaFileUrlsAsync(article.ArticleId, article.ArticleHeadline);
            }

            return articles;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching articles");
            throw;
        }
    }

    // Fetch article by ID
    public async Task<ArticleModel> GetArticleByIdAsync(string articleId)
    {
        try
        {
            FirebaseResponse response = await _firebaseClient.GetAsync($"Articles/{articleId}");
            var article = response.ResultAs<ArticleModel>();
            if (article != null)
            {
                article.MediaFileUrls = await GetMediaFileUrlsAsync(articleId, article.ArticleHeadline);
            }
            return article;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching article with ID {articleId}");
            throw;
        }
    }

    // Fetch media files for an article using metadata
    public async Task<List<string>> GetMediaFileUrlsAsync(string articleId, string articleHeadline)
    {
        var mediaFileUrls = new List<string>();
        try
        {
            // Fetch the list of file names from the metadata store
            var metadataResponse = await _firebaseClient.GetAsync($"Articles/{articleId}/MediaFiles");
            var fileNames = metadataResponse.ResultAs<List<string>>() ?? new List<string>();

            var storageReference = new FirebaseStorage("w-edax-b.appspot.com")
                .Child($"MediaFileUrls/Articles/{articleId}/{articleHeadline}/Assets");

            foreach (var fileName in fileNames)
            {
                var fileUrl = await storageReference.Child(fileName).GetDownloadUrlAsync();
                mediaFileUrls.Add(fileUrl);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching media files for article");
        }
        return mediaFileUrls;
    }

    // Add a new article (no media handling here)
    public async Task AddArticleAsync(ArticleModel article)
    {
        try
        {
            article.ArticleId = Guid.NewGuid().ToString(); // Assign a new ArticleId
            article.ArticleDate = DateTime.UtcNow; // Set current UTC time for the article date

            await _firebaseClient.SetAsync($"Articles/{article.ArticleId}", article);
            // Initialize media file metadata
            await _firebaseClient.SetAsync($"Articles/{article.ArticleId}/MediaFiles", new List<string>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding article");
            throw;
        }
    }

    // Update an article (no media handling here)
    public async Task UpdateArticleAsync(ArticleModel article)
    {
        try
        {
            await _firebaseClient.UpdateAsync($"Articles/{article.ArticleId}", article);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating article");
            throw;
        }
    }

    // Delete an article (no media handling here)
    public async Task DeleteArticleAsync(string articleId)
    {
        try
        {
            await _firebaseClient.DeleteAsync($"Articles/{articleId}");
            await DeleteAllMediaFilesMetadataAsync(articleId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting article with ID {articleId}");
            throw;
        }
    }

    // Media File CRUD Operations
    public async Task CreateMediaFolderAsync(string articleId, string articleHeadline, string path)
    {
        try
        {
            var storageReference = new FirebaseStorage("w-edax-b.appspot.com")
                .Child($"MediaFileUrls/Articles/{articleId}/{articleHeadline}/Assets")
                .Child(path);

            // Attempt to create the folder by uploading an empty file
            using (var stream = new MemoryStream(new byte[0])) // Creates an empty file
            {
                await storageReference.PutAsync(stream);
            }

            _logger.LogInformation($"Created media folder for article {articleId} with headline '{articleHeadline}' at path {path}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating media folder for article {articleId} with headline '{articleHeadline}' at path {path}");
            throw;
        }
    }

    // Upload media file to Firebase Storage
    public async Task<string> UploadMediaFileAsync(string articleId, string articleHeadline, Stream fileStream, string fileName)
    {
        try
        {
            var storageReference = new FirebaseStorage("w-edax-b.appspot.com")
                .Child($"MediaFileUrls/Articles/{articleId}/{articleHeadline}/Assets")
                .Child(fileName);

            var downloadUrl = await storageReference.PutAsync(fileStream);

            // Update metadata store with new file URL
            await UpdateMediaFileMetadataAsync(articleId, fileName);

            return downloadUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading media file");
            throw;
        }
    }

    // Delete a media file from Firebase Storage
    public async Task DeleteMediaFileAsync(string articleId, string articleHeadline, string fileName)
    {
        try
        {
            var storageReference = new FirebaseStorage("w-edax-b.appspot.com")
                .Child($"MediaFileUrls/Articles/{articleId}/{articleHeadline}/Assets")
                .Child(fileName);

            await storageReference.DeleteAsync();

            // Update metadata store to remove file entry
            await RemoveMediaFileMetadataAsync(articleId, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting media file: {fileName}");
            throw;
        }
    }

    // Delete all media files for an article
    public async Task DeleteAllMediaFilesAsync(string articleId, string articleHeadline)
    {
        try
        {
            // Fetch the list of file names from the metadata store
            var metadataResponse = await _firebaseClient.GetAsync($"Articles/{articleId}/MediaFiles");
            var fileNames = metadataResponse.ResultAs<List<string>>() ?? new List<string>();

            var storageReference = new FirebaseStorage("w-edax-b.appspot.com")
                .Child($"MediaFileUrls/Articles/{articleId}/{articleHeadline}/Assets");

            foreach (var fileName in fileNames)
            {
                await storageReference.Child(fileName).DeleteAsync();
            }

            // Clear metadata store
            await DeleteAllMediaFilesMetadataAsync(articleId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting all media files for article {articleId}");
            throw;
        }
    }

    // Update media files for an article (delete old files and upload new ones)
    public async Task UpdateMediaFilesAsync(string articleId, string articleHeadline, List<(Stream fileStream, string fileName)> newFiles)
    {
        try
        {
            // First delete all existing media files
            await DeleteAllMediaFilesAsync(articleId, articleHeadline);

            // Then upload new files
            foreach (var (fileStream, fileName) in newFiles)
            {
                await UploadMediaFileAsync(articleId, articleHeadline, fileStream, fileName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating media files");
            throw;
        }
    }

    // Update metadata store with new file URL
    private async Task UpdateMediaFileMetadataAsync(string articleId, string fileName)
    {
        try
        {
            var metadataResponse = await _firebaseClient.GetAsync($"Articles/{articleId}/MediaFiles");
            var fileNames = metadataResponse.ResultAs<List<string>>() ?? new List<string>();

            if (!fileNames.Contains(fileName))
            {
                fileNames.Add(fileName);
                await _firebaseClient.SetAsync($"Articles/{articleId}/MediaFiles", fileNames);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating media file metadata");
            throw;
        }
    }

    // Remove file entry from metadata store
    private async Task RemoveMediaFileMetadataAsync(string articleId, string fileName)
    {
        try
        {
            var metadataResponse = await _firebaseClient.GetAsync($"Articles/{articleId}/MediaFiles");
            var fileNames = metadataResponse.ResultAs<List<string>>() ?? new List<string>();

            if (fileNames.Contains(fileName))
            {
                fileNames.Remove(fileName);
                await _firebaseClient.SetAsync($"Articles/{articleId}/MediaFiles", fileNames);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing media file metadata");
            throw;
        }
    }

    // Clear all media file metadata for an article
    private async Task DeleteAllMediaFilesMetadataAsync(string articleId)
    {
        try
        {
            await _firebaseClient.DeleteAsync($"Articles/{articleId}/MediaFiles");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting media files metadata for article {articleId}");
            throw;
        }
    }
}
