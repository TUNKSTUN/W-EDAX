import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookService, Book } from '../Services/book.service'; // Ensure correct path
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { delay } from 'rxjs/operators'; // Import delay operator

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
})
export class BookComponent implements OnInit, OnDestroy {
  public books: Book[] = [];
  public selectedBook: Book | null = null;
  public loading: boolean = true;
  public error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadBooks(): void {
    this.loading = true;
    const booksSubscription = this.bookService.getBooks()
      .pipe(
        delay(500) // Add a delay of 2 seconds
      )
      .subscribe({
        next: (books: Book[]) => {
          this.books = books;
          this.selectedBook = this.books[0] || null;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'Failed to load books.';
          this.loading = false;
        },
      });

    this.subscription.add(booksSubscription);
  }

  selectBook(book: Book): void {
    this.selectedBook = book;
  }
}
