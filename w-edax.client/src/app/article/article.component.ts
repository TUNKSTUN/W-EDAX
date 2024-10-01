import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArticleService } from '../Services/article.services';
import { ArticleModel } from '../models/article.model';
import { CommonModule } from '@angular/common';
import { catchError, of, switchMap, tap, finalize, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ArticlesComponent implements OnInit, OnDestroy {
  articleId: string | null = null;
  article: ArticleModel | null = null;
  error: string | null = null;
  relatedArticles1: ArticleModel[] = [];
  relatedArticles2: ArticleModel[] = [];
  preloadedArticles: { [id: string]: ArticleModel } = {};
  safeContent: SafeHtml = '';
  isLoading: boolean = true; // Start with loading true
  relatedArticlesLoading: boolean = true; // Manage loading state for related articles
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private apiService: ArticleService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadArticleData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadArticleData() {
    this.isLoading = true; // Ensure loading is set true when fetching starts

    this.route.paramMap.pipe(
      takeUntil(this.unsubscribe$),
      switchMap(params => {
        this.articleId = params.get('id');

        if (this.articleId) {
          const cachedArticle = this.getCachedArticle(this.articleId);

          if (cachedArticle) {
            // Use cached article from local storage
            this.article = cachedArticle;
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.articleContent?.content || '');
            return this.loadArticleFromRTDB(); // Continue loading from RTDB
          } else {
            // No cached article, directly try fetching from RTDB
            return this.loadArticleFromRTDB(); // Keep loading true
          }
        } else {
          this.error = 'Article ID is missing in the URL';
          this.isLoading = false; // Stop loading as there is no valid ID
          return of(null); // Stop the observable chain but keep loading true
        }
      }),
      finalize(() => {
        console.log('Loading complete'); // This will log when loading is complete, but will not control loading state
      })
    ).subscribe(
      (data: ArticleModel | null) => {
        if (data) {
          this.article = data;
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.articleContent?.content || '');
          this.preloadRelatedArticles(); // Fetch related articles
        } else {
          this.error = 'Article not found'; // Handle if no article found
        }
        // Do not set isLoading to false here
      },
      (error) => {
        console.error('Error fetching article:', error);
        this.error = 'Error fetching article'; // Set error message
        // Keep isLoading true to show loading indicator
      }
    );
  }

  private loadArticleFromRTDB() {
    return this.apiService.getArticleById(this.articleId || '').pipe(
      takeUntil(this.unsubscribe$),
      tap(article => {
        if (article) {
          this.cacheArticle(this.articleId as string, article); // Cache the fetched article
          this.preloadedArticles[article.articleId] = article; // Preload the article
          this.isLoading = false; // Stop loading only when article is fetched successfully
        }
      }),
      catchError(error => {
        console.error('Error fetching article from RTDB:', error);
        this.error = 'Failed to load article from RTDB'; // Set error for user feedback
        return of(null); // Return null to indicate failure
      })
    );
  }

  private cacheArticle(id: string, article: ArticleModel) {
    // Only cache non-empty articles
    if (article && Object.keys(article).length > 0) {
      localStorage.setItem(`article_${id}`, JSON.stringify(article));
    }
  }

  private getCachedArticle(id: string): ArticleModel | null {
    const cached = localStorage.getItem(`article_${id}`);
    return cached ? JSON.parse(cached) : null;
  }

  private preloadRelatedArticles() {
    this.relatedArticlesLoading = true; // Start loading related articles

    this.apiService.getArticles().pipe(
      takeUntil(this.unsubscribe$),
      catchError(error => {
        console.error('Error fetching related articles:', error);
        this.error = 'Error loading related articles. Please try again later.';
        this.relatedArticlesLoading = false; // Stop loading related articles
        return of([]); // Return an empty array to avoid breaking the app
      })
    ).subscribe(
      (articles: ArticleModel[]) => {
        if (articles && articles.length > 0) {
          this.relatedArticles1 = articles
            .filter(article => article.category === this.article?.category && article.articleId !== this.article?.articleId)
            .slice(0, 2);

          this.relatedArticles2 = articles
            .filter(article => article.articleId !== this.article?.articleId)
            .slice(2, 6);

          [...this.relatedArticles1, ...this.relatedArticles2].forEach(article => {
            this.preloadedArticles[article.articleId] = article;
          });
        } else {
          this.error = 'No related articles found'; // Throw an error if no articles found
          this.relatedArticlesLoading = false; // Stop loading related articles
        }
      },
      (error) => {
        console.error('Error fetching related articles:', error);
        this.error = 'Error loading related articles. Please try again later.'; // Handle related article fetch error
      }
    );
  }

  onArticleClick(relatedArticleId: string) {
    this.isLoading = true;
    window.scrollTo(0, 0); // Reset scroll position when clicking on a related article
    if (this.preloadedArticles[relatedArticleId]) {
      this.article = this.preloadedArticles[relatedArticleId];
      this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.articleContent?.content || '');
      this.isLoading = false;
    } else {
      this.articleId = relatedArticleId;
      this.loadArticleData();
    }
  }

  scroll_up() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
