import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ArticleModel } from '../models/article.model';
import { environment } from '../../environments/environment'; // This will be replaced by environment.prod.ts in production builds

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = environment.apiUrl; // URL will be set based on the environment

  constructor(private http: HttpClient) { }

  // Fetch all articles
  getArticles(): Observable<ArticleModel[]> {
    return this.http.get<ArticleModel[]>(`${this.apiUrl}/Articles`).pipe(
      catchError(this.handleError<ArticleModel[]>('getArticles', []))
    );
  }

  // Fetch article by ID
  getArticleById(id: string): Observable<ArticleModel> {
    console.log(`Fetching article with ID: ${id}`); // Log the request URL
    return this.http.get<ArticleModel>(`${this.apiUrl}/Articles/${id}`).pipe(
      catchError(this.handleError<ArticleModel>('getArticleById'))
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
