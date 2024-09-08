using System;
using System.Collections.Generic;

public class ArticleModel
{
    public string ArticleId { get; set; } = Guid.NewGuid().ToString(); // Unique identifier for the article
    public DateTime ArticleDate { get; set; } = DateTime.UtcNow; // Date the article was created
    public string ArticleHeadline { get; set; } = string.Empty; // Title of the article
    public string ArticleDescription { get; set; } = string.Empty; // Brief description of the article
    public ArticleContentModel ArticleContent { get; set; } = new ArticleContentModel(); // Content of the article
    public List<string> MediaFileUrls { get; set; } = new List<string>(); // URLs of media files associated with the article
    public string Category { get; set; } = string.Empty; // Category of the article
    public List<string> Keywords { get; set; } = new List<string>(); // Keywords related to the article

    // Constructor to initialize default values

    public class ArticleContentModel
    {
        public string Content { get; set; } = string.Empty;
    }

}
