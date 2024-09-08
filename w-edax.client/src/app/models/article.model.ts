export class ArticleModel {
  articleId: string = '';
  articleHeadline: string = '';
  articleDescription: string = '';
  articleContent?: { Content: string };
  mediaFileUrls: string[] = [];
  articleDate: Date = new Date();
  category: string = '';
  keywords: string[] = [];
}
