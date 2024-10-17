import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ArticleModel } from '../models/article.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private storage: AngularFireStorage) {}

  // Fetch all articles and their corresponding images
  getArticles(): Observable<ArticleModel[]> {
    return this.http.get<ArticleModel[]>(`${this.apiUrl}/Articles`).pipe(
      switchMap(articles => {
        if (articles && articles.length > 0) {
          return this.fetchImagesForArticles(articles).pipe(
            map(fetchedArticles => fetchedArticles)
          );
        } else {
          return of([]);  // Return empty array if no articles found
        }
      }),
      catchError(this.handleError<ArticleModel[]>('getArticles', []))
    );
  }


  getImageUrl(imagePath: string): Observable<string | null> {
    const imageRef = this.storage.ref(imagePath);
    return imageRef.getDownloadURL(); // Ensure this returns an Observable<string | null>
  }

  getPreloadedImage(articleId: string): Observable<string | null> {
    // Define the path to the images based on articleId
    const imagePath = `MediaFileUrls/Articles/${articleId}/Assets/`;

    // List all assets in the path and return the first image's download URL
    return this.storage.ref(imagePath).listAll().pipe(
      switchMap((result) => {
        if (result.items.length > 0) {
          // If there are assets, get the download URL for the first image
          return result.items[0].getDownloadURL();
        } else {
          return of(null);  // Return null if no images are found
        }
      }),
      catchError((error) => {
        console.error(`Error fetching image for article ${articleId}:`, error);
        return of(null);  // Return null on error
      })
    );
  }

  // Fetch images for all articles
  private fetchImagesForArticles(articles: ArticleModel[]): Observable<ArticleModel[]> {
    const fetchImageTasks = articles.map(article => this.fetchImageForArticle(article));
    return forkJoin(fetchImageTasks); // Wait for all image fetching tasks to finish
  }

  // Fetch image for a single article
  private fetchImageForArticle(article: ArticleModel): Observable<ArticleModel> {
    return this.getPreloadedImage(article.articleId).pipe(
      map((imageUrl) => {
        if (imageUrl) {
          // If an image URL is found, assign it to the article's mediaFileUrls
          article.mediaFileUrls = [imageUrl];
        } else {
          // Otherwise, set mediaFileUrls to an empty array
          article.mediaFileUrls = [];
        }
        return article;
      }),
      catchError(() => {
        // Handle errors gracefully by setting an empty array and returning the article
        article.mediaFileUrls = [];
        return of(article);
      })
    );
  }


  // Get the image from Firebase Storage
  private getArticleImage(articleId: string): Observable<string | null> {
    const imagePath = `MediaFileUrls/Articles/${articleId}/Assets/`;

    const imageRef = this.storage.ref(imagePath);
    return imageRef.listAll().pipe(
      switchMap(res => {
        if (res.items.length > 0) {
          // Convert the Promise returned by `getDownloadURL` to an Observable using `from()`
          return from(res.items[0].getDownloadURL());
        } else {
          return of(null);  // Return Observable of null if no images found
        }
      }),
      catchError(err => {
        console.error('Error fetching images from Firebase Storage:', err);
        return of(null);  // Return Observable of null on error
      })
    );
  }


  // Fetch a specific article by ID
  getArticleById(articleId: string): Observable<ArticleModel | null> {
    return this.http.get<ArticleModel>(`${this.apiUrl}/Articles/${articleId}`).pipe(
      switchMap(article => this.fetchImageForArticle(article)),  // Fetch image while getting article
      catchError(this.handleError<ArticleModel | null>(`getArticleById id=${articleId}`, null))
    );
  }

  // Error handling helper
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
