import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Define the structure of the Book and Metadata according to your JSON
export interface BookMetaData {
  publisher: string;
  year: number;
  genre: string;
}

export interface Book {
  title: string;
  author: string; // Add the author property
  review: string[]; // Assume review is an array of strings
  image: string;
  metadata: BookMetaData; // Include metadata property
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = environment.apiUrl; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  // Method to fetch all books
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/Books`);
  }

  // Method to fetch a book by title (consider changing this to fetch by ID if necessary)
  getBookByTitle(title: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/Books/${title}`);
  }
}
