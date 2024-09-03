// article.model.ts
export interface ArticleContent {
  introduction: string;  // Introduction section
  content: string;       // Main content section
  conclusion: string;    // Conclusion section
}

export interface ArticleModel {
  articleId: string;            // Unique identifier for the article
  articleDate: string;          // Date the article was created (ISO 8601 format)
  articleHeadline: string;      // Title of the article
  articleDescription: string;   // Brief description of the article
  articleContent: ArticleContent; // Content of the article divided into sections
  mediaFileUrls: string[];      // URLs of media files associated with the article
}
