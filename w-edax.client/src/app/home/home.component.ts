import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../Services/article.services'; // Updated path to lowercase
import { ArticleModel } from '../models/article.model';
import { catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink, CommonModule],
  providers: [ArticleService]
})
export class HomeComponent implements OnInit {
  articles: ArticleModel[] = [];
  topArticles: ArticleModel[] = [];
  topicArticles: ArticleModel[] = [];
  selectedArticle: ArticleModel | null = null;

  constructor(private articleService: ArticleService, private router: Router) { }

  ngOnInit(): void {
    this.loadArticles();
  }

  private loadArticles(): void {
    this.articleService.getArticles().pipe(
      catchError(error => {
        console.error('Error fetching articles:', error);
        this.showErrorNotification('Failed to fetch articles. Please try again later.');
        return of([]); // Return an empty array on error
      }),
      map((articles: ArticleModel[]) => {
        this.articles = articles;
        this.selectRandomTopArticles();
        this.selectTopicSpecificArticles();
      })
    ).subscribe();
  }

  private selectRandomTopArticles(): void {
    const numberOfTopArticles = 3;
    this.topArticles = this.shuffleArray(this.articles).slice(0, numberOfTopArticles);
  }

  private selectTopicSpecificArticles(): void {
    const keywords = ['Cloud', 'Security'];

    this.topicArticles = this.articles.filter(article =>
      article.articleHeadline?.trim() // Ensure ArticleHeadline is defined and not empty
      && keywords.some(keyword => article.articleHeadline.includes(keyword))
    );
  }

  private shuffleArray(array: ArticleModel[]): ArticleModel[] {
    return array.sort(() => Math.random() - 0.5); // Simplified shuffling
  }

  private showErrorNotification(message: string): void {
    // Replace with a proper UI notification system
    console.error(message);
    alert(message);
  }
  // Inside your component.ts file
loadArticleDetails(articleId: string) {
  // Find the selected article by ID
  this.selectedArticle = this.articles.find(article => article.articleId === articleId) || null;

  // Log article for debugging
  console.log(this.selectedArticle); // Instead of just logging the articleId

  // If using routing to show the article details page, navigate there
  // Example:
  this.router.navigate(['/article', articleId]);
}


}
