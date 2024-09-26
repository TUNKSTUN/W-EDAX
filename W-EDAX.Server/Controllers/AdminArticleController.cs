using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")] // Restrict access to admin users
[EnableCors("AllowAll")]
public class AdminArticleController : ControllerBase
{
    private readonly ArticleService _articleService;
    private readonly ILogger<AdminArticleController> _logger;

    public AdminArticleController(ArticleService articleService, ILogger<AdminArticleController> logger)
    {
        _articleService = articleService;
        _logger = logger;
    }

    // -----------------------------------
    // CRUD Operations for Articles
    // -----------------------------------

    // Get all articles (admin access)
    [HttpGet]
    [EnableCors("AllowAngularApp")]
    public async Task<IActionResult> GetArticles()
    {
        try
        {
            var articles = await _articleService.GetArticlesAsync();
            return Ok(articles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching articles.");
            return StatusCode(500, "Internal server error.");
        }
    }

    // Get article by ID (admin access)
    [HttpGet("{id}")]
    [EnableCors("AllowAngularApp")]
    public async Task<IActionResult> GetArticleById(string id)
    {
        try
        {
            var article = await _articleService.GetArticleByIdAsync(id);
            if (article == null)
            {
                _logger.LogWarning("Article with ID {ArticleId} not found.", id);
                return NotFound();
            }
            return Ok(article);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while fetching the article with ID {id}.");
            return StatusCode(500, "Internal server error.");
        }
    }

    // Add a new article (admin access)
    [HttpPost]
    public async Task<IActionResult> AddArticle([FromBody] ArticleModel article)
    {
        if (article == null)
        {
            return BadRequest("Article data is required.");
        }

        try
        {
            article.ArticleId = Guid.NewGuid().ToString(); // Generate unique ID for the article
            await _articleService.AddArticleAsync(article);
            return Ok(new { message = "Article added successfully.", articleId = article.ArticleId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while adding the article.");
            return StatusCode(500, "Internal server error.");
        }
    }

    // Update an existing article (admin access)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArticle(string id, [FromBody] ArticleModel article)
    {
        if (article == null || id != article.ArticleId)
        {
            return BadRequest("Invalid article data.");
        }

        try
        {
            await _articleService.UpdateArticleAsync(article);
            return Ok(new { message = "Article updated successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while updating the article with ID {id}.");
            return StatusCode(500, "Internal server error.");
        }
    }

    // Delete an article (admin access)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(string id)
    {
        try
        {
            var article = await _articleService.GetArticleByIdAsync(id); // Fetch article to get the headline
            if (article == null)
            {
                return NotFound("Article not found.");
            }

            await _articleService.DeleteArticleAsync(id);
            await _articleService.DeleteAllMediaFilesAsync(id, article.ArticleHeadline); // Also delete associated media files
            return Ok(new { message = "Article and associated media deleted successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while deleting the article with ID {id}.");
            return StatusCode(500, "Internal server error.");
        }
    }

    // -----------------------------------
    // CRUD Operations for Media Files
    // -----------------------------------

    // Upload media files for an article
    [HttpPost("{id}/media/upload")]
    public async Task<IActionResult> UploadMediaFile(string id, [FromForm] List<IFormFile> files, [FromForm] string articleHeadline)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest("No media files provided.");
        }

        if (string.IsNullOrEmpty(articleHeadline))
        {
            return BadRequest("Article headline is required.");
        }

        try
        {
            var fileUrls = new List<string>();

            foreach (var file in files)
            {
                using (var stream = file.OpenReadStream())
                {
                    // Ensure you pass the article ID, headline, file stream, and file name correctly
                    var downloadUrl = await _articleService.UploadMediaFileAsync(id, articleHeadline, stream, file.FileName);
                    fileUrls.Add(downloadUrl);
                }
            }

            return Ok(new { message = "Media files uploaded successfully.", fileUrls });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while uploading media files for article {id}.");
            return StatusCode(500, "Internal server error.");
        }
    }


    // Delete a specific media file for an article
    [HttpDelete("{id}/media/delete")]
    public async Task<IActionResult> DeleteMediaFile(string id, [FromBody] string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
        {
            return BadRequest("File name is required.");
        }

        try
        {
            var article = await _articleService.GetArticleByIdAsync(id); // Fetch article to get the headline
            if (article == null)
            {
                return NotFound("Article not found.");
            }

            await _articleService.DeleteMediaFileAsync(id, article.ArticleHeadline, fileName);
            return Ok(new { message = $"Media file '{fileName}' deleted successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while deleting media file {fileName} for article {id}.");
            return StatusCode(500, "Internal server error.");
        }
    }

    // Delete all media files for an article
    [HttpDelete("{id}/media/delete-all")]
    public async Task<IActionResult> DeleteAllMediaFiles(string id)
    {
        try
        {
            var article = await _articleService.GetArticleByIdAsync(id); // Fetch article to get the headline
            if (article == null)
            {
                return NotFound("Article not found.");
            }

            await _articleService.DeleteAllMediaFilesAsync(id, article.ArticleHeadline);
            return Ok(new { message = "All media files deleted successfully for the article." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while deleting all media files for article {id}.");
            return StatusCode(500, "Internal server error.");
        }
    }

    // Update media files for an article
    [HttpPut("{id}/media/update")]
    public async Task<IActionResult> UpdateMediaFiles(string id, [FromForm] List<IFormFile> newFiles)
    {
        if (newFiles == null || newFiles.Count == 0)
        {
            return BadRequest("No new media files provided.");
        }

        try
        {
            var mediaFiles = new List<(Stream fileStream, string fileName)>();
            var article = await _articleService.GetArticleByIdAsync(id); // Fetch article to get the headline
            if (article == null)
            {
                return NotFound("Article not found.");
            }

            foreach (var file in newFiles)
            {
                using (var stream = file.OpenReadStream())
                {
                    mediaFiles.Add((stream, file.FileName));
                }
            }

            await _articleService.UpdateMediaFilesAsync(id, article.ArticleHeadline, mediaFiles);
            return Ok(new { message = "Media files updated successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while updating media files for article {id}.");
            return StatusCode(500, "Internal server error.");
        }
    }
}
