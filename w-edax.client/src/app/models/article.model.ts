export class ArticleModel {
  articleId: string = '';
  articleHeadline: string = '';
  articleDescription: string = '';
  articleContent?: { content: string };
  mediaFileUrls: string[] = [];
  articleDate: Date = new Date();
  articleAuthor: string = 'Yahya';
  category: string = '';
  keywords?: string[] = [];
}
