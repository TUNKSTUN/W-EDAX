import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ArticleModel } from '../models/article.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = environment.apiUrl; // Base URL for the API
  private articlesCache: ArticleModel[] | null = null; // Cache for articles
  private articlesSubject = new BehaviorSubject<ArticleModel[] | null>(null); // Subject to hold articles

  constructor(private http: HttpClient) { }

  // Fetch all articles with caching
  getArticles(): Observable<ArticleModel[]> {
    if (this.articlesCache) {
      console.log('Returning cached articles');
      return of(this.articlesCache);
    }

    console.log('Fetching articles from API');
    return this.http.get<ArticleModel[]>(`${this.apiUrl}/Articles`).pipe(
      tap(articles => {
        // Only cache articles if they are not undefined or empty
        if (articles && articles.length > 0) {
          console.log('Fetched articles from API:', articles);
          this.articlesCache = articles; // Cache the fetched articles
          this.articlesSubject.next(articles); // Update the observable with new articles
        } else {
          console.error('No articles found or the fetched articles are empty.');
          this.articlesCache = null; // Ensure cache is cleared if no articles are found
          this.articlesSubject.next(null); // Emit null to indicate no articles
        }
      }),
      catchError(this.handleError<ArticleModel[]>('getArticles', [])) // Return an empty array on error
    );
  }

  // Fetch media URL for a specific article
  getMediaUrl(articleId: string, articleHeadline: string): Observable<string> {
    const mediaFileUrl = `gs://w-edax-b.appspot.com/MediaFileUrls/Articles/${articleId}/${articleHeadline}/Assets/`;
    console.log(`Retrieved media URL for article ${articleId}: ${mediaFileUrl}`);
    return of(mediaFileUrl); // Simulate getting the media URL from Firebase
  }

  // Create a folder in Firebase Storage if no media is present
  createMediaFolder(articleId: string, path: string, articleHeadline: string): Observable<void> {
    console.log(`Creating folder for article ${articleId} at path ${path}`);
    return this.http.post<void>(`${this.apiUrl}/Articles/${articleId}/${articleHeadline}/createMediaFolder`, { path }).pipe(
      tap(() => console.log(`Folder created for article ${articleHeadline} at path ${path}`)),
      catchError(this.handleError<void>('createMediaFolder'))
    );
  }

  // Fetch article by ID
  getArticleById(id: string): Observable<ArticleModel> {
    console.log(`Fetching article with ID: ${id}`);
    return this.http.get<ArticleModel>(`${this.apiUrl}/Articles/${id}`).pipe(
      tap(article => console.log('Fetched article:', article)),
      catchError(this.handleError<ArticleModel>('getArticleById'))
    );
  }

  // Fetch author by article ID (mock example, replace with actual implementation)
  getAuthorByArticleId(id: string): Observable<string> {
    console.log(`Fetching author for article ID: ${id}`);
    return this.http.get<string>(`${this.apiUrl}/Articles/${id}/author`).pipe(
      tap(author => console.log('Fetched author:', author)),
      catchError(this.handleError<string>('getAuthorByArticleId', 'Unknown Author'))
    );
  }

  // Generic error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T); // Return a safe fallback value
    };
  }
}
