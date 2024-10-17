import { Component, OnInit } from '@angular/core';
import booksJson from '../assets/books.json'; // Import the JSON file directly
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
})
export class BookComponent implements OnInit {
  public books = booksJson; // Directly assign the imported JSON
  public selectedBook: any; // Variable to hold the selected book details

  constructor() {
    // Set the initial selected book to the first one
    this.selectedBook = this.books[0]; // Ensure this is the book you want as the featured one
  }

  ngOnInit(): void {
      }

  // Method to handle book selection
  selectBook(book: any): void {
    this.selectedBook = book; // Update selectedBook to the clicked book
  }
}
