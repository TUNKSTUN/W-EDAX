using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly FirebaseService _firebaseService;
    private readonly CachingService _cachingService;
    private readonly ILogger<ArticlesController> _logger;

    public ArticlesController(FirebaseService firebaseService, CachingService cachingService, ILogger<ArticlesController> logger)
    {
        _firebaseService = firebaseService;
        _cachingService = cachingService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetArticles()
    {
        try
        {
            var articles = await _cachingService.GetArticlesAsync();
            return Ok(articles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching articles.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetArticleById(string id)
    {
        try
        {
            var article = await _cachingService.GetArticleByIdAsync(id);
            if (article == null)
            {
                _logger.LogWarning("Article with ID {ArticleId} not found.", id);
                return NotFound();
            }
            return Ok(article);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching the article by ID {ArticleId}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddArticle([FromForm] ArticleModel article, [FromForm] List<IFormFile> mediaFiles)
    {
        try
        {
            if (article == null)
            {
                _logger.LogWarning("Article cannot be null.");
                return BadRequest("Article cannot be null.");
            }

            await _firebaseService.AddArticleAsync(article, mediaFiles);
            _cachingService.InvalidateArticleCache();

            return CreatedAtAction(nameof(GetArticleById), new { id = article.ArticleId }, article);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while processing the request. Details: {Message}", ex.Message);
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArticle(string id, [FromBody] ArticleModel article)
    {
        try
        {
            if (article == null || article.ArticleId != id)
            {
                _logger.LogWarning("Invalid article data or mismatched ID. ID: {ArticleId}", id);
                return BadRequest("Invalid article data.");
            }

            var existingArticle = await _firebaseService.GetArticleByIdAsync(id);
            if (existingArticle == null)
            {
                _logger.LogWarning("Article with ID {ArticleId} not found.", id);
                return NotFound();
            }

            await _firebaseService.UpdateArticleAsync(article);
            _cachingService.InvalidateArticleCache();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating the article with ID {ArticleId}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(string id)
    {
        try
        {
            var existingArticle = await _firebaseService.GetArticleByIdAsync(id);
            if (existingArticle == null)
            {
                _logger.LogWarning("Article with ID {ArticleId} not found.", id);
                return NotFound();
            }

            await _firebaseService.DeleteArticleAsync(id);
            _cachingService.InvalidateArticleCache();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting the article with ID {ArticleId}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
}
