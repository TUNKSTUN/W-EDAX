using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Cors;

[ApiController]
[Route("api/[controller]")]
[EnableCors("AllowAll")]
public class ArticlesController : ControllerBase
{
    private readonly ArticleService _articleService;
    private readonly ILogger<ArticlesController> _logger;

    public ArticlesController(ArticleService articleService, ILogger<ArticlesController> logger)
    {
        _articleService = articleService;
        _logger = logger;
    }

    // Get all articles (read-only)
    [HttpGet]
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

    // Get article by ID (read-only)
    [HttpGet("{id}")]
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

    // Get media files for an article (read-only)
    [HttpGet("{id}/media")]
    public async Task<IActionResult> GetMediaFilesByArticleId(string id)
    {
        try
        {
            // Fetch the article to get the headline
            var article = await _articleService.GetArticleByIdAsync(id);
            if (article == null)
            {
                _logger.LogWarning("Article with ID {ArticleId} not found.", id);
                return NotFound();
            }

            // Now that we have the article, get the media files using the headline
            var mediaFiles = await _articleService.GetMediaFileUrlsAsync(id, article.ArticleHeadline);
            return Ok(mediaFiles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while fetching media files for article {id}.");
            return StatusCode(500, "Internal server error.");
        }
    }


    // Create media folder for an article
    [HttpPost("{articleId}/{articleHeadline}/createMediaFolder")]
    public async Task<IActionResult> CreateMediaFolder(string articleId, string articleHeadline, [FromBody] CreateFolderRequest request)
    {
        try
        {
            _logger.LogInformation($"Creating media folder for article ID: {articleId}, Headline: {articleHeadline}, Path: {request.Path}");
            await _articleService.CreateMediaFolderAsync(articleId, articleHeadline, request.Path);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating media folder");
            return StatusCode(500, "Internal server error");
        }
    }
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
                    // Now passing the articleHeadline along with the other parameters
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


    // DTO for request
    public class CreateFolderRequest
    {
        public string Path { get; set; }
    }

    // Block Add Article (POST)
    [HttpPost]
    public IActionResult AddArticle()
    {
        _logger.LogWarning("POST operation is not allowed.");
        return StatusCode(403, "Write operations are forbidden.");
    }

    // Block Update Article (PUT)
    [HttpPut("{id}")]
    public IActionResult UpdateArticle(string id)
    {
        _logger.LogWarning("PUT operation is not allowed.");
        return StatusCode(403, "Write operations are forbidden.");
    }

    // Block Delete Article (DELETE)
    [HttpDelete("{id}")]
    public IActionResult DeleteArticle(string id)
    {
        _logger.LogWarning("DELETE operation is not allowed.");
        return StatusCode(403, "Delete operations are forbidden.");
    }

    // Block Delete Media (DELETE)
    [HttpDelete("{id}/media")]
    public IActionResult DeleteMediaFiles(string id)
    {
        _logger.LogWarning("DELETE operation is not allowed.");
        return StatusCode(403, "Delete operations are forbidden.");
    }


}
