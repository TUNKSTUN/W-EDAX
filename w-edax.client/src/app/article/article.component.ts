import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ArticleService } from '../Services/article.services';
import { ArticleModel } from '../models/article.model'; // Define this model as per your structure
import { CommonModule } from '@angular/common';
import { delay, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class ArticlesComponent implements OnInit {
  articleId: string | null = null;
  article: ArticleModel | null = null; // Article data will be stored here
  error: string | null = null; // Store error messages
  loading: boolean = true; // Loading state for UI indication

  constructor(private route: ActivatedRoute, private apiService: ArticleService) { }

  ngOnInit(): void {
    setTimeout(() => {
      document.querySelector('.article-page')?.classList.add('loaded');
    },100);

    // Fetch article data based on route param (id)
    this.route.paramMap.pipe(
      switchMap(params => {
        this.articleId = params.get('id'); // Retrieve the article ID from route
        console.log('Article ID from route:', this.articleId); // Log the ID for debugging
        if (this.articleId) {
          this.loading = true;
          return this.apiService.getArticleById(this.articleId).pipe(
            delay(100) // Optional delay for smoother UX
          );
        } else {
          this.error = 'Article ID is missing in the URL'; // Show error if ID is missing
          return of(null).pipe(delay(500));
        }
      })
    ).subscribe(
      (data: ArticleModel | null) => {
        if (data) {
          this.article = data; // Set fetched article data
        } else {
          this.error = 'Article not found'; // Handle case where article is not found
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching article:', error);
        this.error = 'Error fetching article'; // Set error message
        this.loading = false;
      }
    );
  }
}
