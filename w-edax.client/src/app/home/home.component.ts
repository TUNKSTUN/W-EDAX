import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ArticleService } from '../Services/article.services';
import { ArticleModel } from '../models/article.model';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterModule, CommonModule],
  providers: [ArticleService]
})
export class HomeComponent implements OnInit {
  articles: ArticleModel[] = [];
  topArticles: ArticleModel[] = [];
  topicArticles: ArticleModel[] = [];
  bigArticle: ArticleModel | undefined;
  smallArticles: ArticleModel[] = [];
  isLoading = true;

  constructor(private articleService: ArticleService, private router: Router) { }

  ngOnInit(): void {
    this.isLoading = true; // Start loading

    // Attempt to load articles from localStorage
    const storedArticles = localStorage.getItem('articles');
    if (storedArticles) {
      this.articles = JSON.parse(storedArticles);
      this.processArticles(); // Process articles after loading from localStorage
    } else {
      // Fetch articles if not in localStorage
      this.articleService.getArticles().subscribe({
        next: (articles: ArticleModel[]) => {
          this.articles = articles;
          localStorage.setItem('articles', JSON.stringify(articles)); // Store articles in localStorage
          this.processArticles(); // Process articles after fetching from API
        },
        error: (error) => {
          console.error('Error processing articles:', error);
          this.showErrorNotification('Failed to process articles. Please try again later.');
          this.isLoading = false; // Ensure loading is set to false even on error
        }
      });
    }

    // For animation
    setTimeout(() => {
      document.querySelector('.home-page')?.classList.add('loaded');
      document.querySelectorAll('.article-card, .hot-articles-container, .topic-articles-section, .banner')
        .forEach(element => element?.classList.add('loaded'));
    }, 100);
  }

  private processArticles(): void {
    this.loadArticleImages();
    this.selectRandomTopArticles();
    this.selectTopicSpecificArticles();
    this.selectBigAndSmallArticles();
    this.isLoading = false; // Stop loading after processing articles
  }

  private loadArticleImages(): void {
    this.articles.forEach(article => {
      // Fetch the media URL for existing articles
      if (article.mediaFileUrls && article.mediaFileUrls.length > 0) {
        this.fetchMediaUrl(article);
      }
    }); 
  }

  private fetchMediaUrl(article: ArticleModel): void {
    this.articleService.getMediaUrl(article.articleId, article.articleHeadline).subscribe({ 
      next: (url: string) => {
        if (article.mediaFileUrls && Array.isArray(article.mediaFileUrls)) {
          article.mediaFileUrls.push(url); // Append to the existing array
        } else {
          article.mediaFileUrls = [url]; // Create a new array with the URL
        }
      },
      error: (error) => console.error(`Error fetching image for article ${article.articleId}:`, error)
    });
  }

  private selectBigAndSmallArticles(): void {
    if (this.articles.length > 0) {
      this.bigArticle = this.articles[0]; // Select the first article as bigArticle
      this.smallArticles = this.articles.slice(1, 10); // Select the next 9 articles as smallArticles
    }
  }

  private selectRandomTopArticles(): void {
    const numberOfTopArticles = 2;
    this.topArticles = this.shuffleArray(this.articles).slice(0, numberOfTopArticles);
  }

  private selectTopicSpecificArticles(): void {
    const keywords = ['Cloud', 'Security'];
    this.topicArticles = this.articles.filter(article =>
      article.articleHeadline?.trim() &&
      keywords.some(keyword => article.articleHeadline.includes(keyword))
    );
  }

  private shuffleArray(array: ArticleModel[]): ArticleModel[] {
    return array.sort(() => Math.random() - 0.5);
  }

  private showErrorNotification(message: string): void {
    console.error(message);
    alert(message);
  }
}
