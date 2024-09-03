using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly FirebaseService _firebaseService;

    public ArticlesController(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    // Get all articles
    [HttpGet]
    public async Task<IActionResult> GetArticles()
    {
        var articles = await _firebaseService.GetArticlesAsync();
        return Ok(articles);
    }

    // Get a specific article by its ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetArticleById(string id)
    {
        var article = await _firebaseService.GetArticleByIdAsync(id);
        if (article == null) return NotFound();
        return Ok(article);
    }

    // Add a new article with media files
    [HttpPost]
    public async Task<IActionResult> AddArticle([FromForm] ArticleModel article, [FromForm] List<IFormFile> mediaFiles)
    {
        if (article == null)
        {
            return BadRequest("Article cannot be null.");
        }

        await _firebaseService.AddArticleAsync(article, mediaFiles);
        return CreatedAtAction(nameof(GetArticleById), new { id = article.ArticleId }, article);
    }


    // Update an existing article
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArticle(string id, [FromBody] ArticleModel article)
    {
        if (article == null || article.ArticleId != id)
            return BadRequest("Invalid article data.");

        var existingArticle = await _firebaseService.GetArticleByIdAsync(id);
        if (existingArticle == null) return NotFound();

        await _firebaseService.UpdateArticleAsync(article);
        return NoContent();
    }

    // Delete an article by its ID
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(string id)
    {
        var article = await _firebaseService.GetArticleByIdAsync(id);
        if (article == null) return NotFound();

        await _firebaseService.DeleteArticleAsync(id);
        return NoContent();
    }
}
