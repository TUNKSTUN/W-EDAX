import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ArticleService } from '../Services/article.services'; // Ensure the path is correct
import { ArticleModel } from '../models/article.model'; // Import ArticleModel if using it
import { catchError, lastValueFrom, of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink, CommonModule],
  providers: [ArticleService]
})
export class HomeComponent implements OnInit {
  articles: ArticleModel[] = []; // Initialize with an empty array
  topArticles: ArticleModel[] = []; // Initialize with an empty array
  topicArticles: ArticleModel[] = []; // Additional array for topic-specific articles if needed

  constructor(public articleService: ArticleService) { }

  async ngOnInit(): Promise<void> {
    try {
      // Fetch articles and assign a default empty array if the API response is undefined
      this.articles = await this.fetchArticles() || [];
      this.selectRandomTopArticles();
      this.selectTopicSpecificArticles(); // Optional: Filter for topic-specific articles
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  }

  private async fetchArticles(): Promise<ArticleModel[]> {
    return lastValueFrom(
      this.articleService.getArticles().pipe(
        catchError(error => {
          console.error('Error in fetchArticles:', error);
          return of([]); // Return an empty array on error
        })
      )
    );
  }

  private selectRandomTopArticles(): void {
    const numberOfTopArticles = 3; // Number of top articles to select

    // Shuffle the articles array and select the first 'numberOfTopArticles' items
    this.topArticles = this.shuffleArray(this.articles).slice(0, numberOfTopArticles);
  }

  // Optional method to select topic-specific articles
  private selectTopicSpecificArticles(): void {
    // Example logic: filter articles based on certain keywords or categories
    this.topicArticles = this.articles.filter(article => 
      article.articleHeadline.includes('AI') || 
      article.articleHeadline.includes('Security')
    );
  }

  private shuffleArray(array: ArticleModel[]): ArticleModel[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }
}
