using System;
using System.Collections.Generic;

public class ArticleModel
{
    public string ArticleId { get; set; } = Guid.NewGuid().ToString(); // Unique identifier for the article
    public DateTime ArticleDate { get; set; } = DateTime.UtcNow; // Date the article was created
    public string ArticleHeadline { get; set; } = string.Empty; // Title of the article
    public string ArticleDescription { get; set; } = string.Empty; // Brief description of the article
    public ArticleContent ArticleContent { get; set; } = new ArticleContent(); // Content of the article divided into sections
    public List<string> MediaFileUrls { get; set; } = new List<string>(); // URLs of media files associated with the article

    // Constructor to initialize default values
    public ArticleModel()
    {
        // All properties are already initialized with default values upon declaration
    }
}

public class ArticleContent
{
    public string Introduction { get; set; } = string.Empty; // Introduction section
    public string Content { get; set; } = string.Empty; // Main content section
    public string Conclusion { get; set; } = string.Empty; // Conclusion section
}
