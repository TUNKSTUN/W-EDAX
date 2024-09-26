import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import the JSON data
import * as InspireJson from '../assets/Inspire.json';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {
  quotes: { text: string, author: string, pic: string }[] = [];
  currentQuote!: { text: string, author: string, pic: string };
  private quoteIndex = 0;
  private interval: any;

  ngOnInit() {
    // Access the quotes array from the `currentQuote` property
    this.quotes = InspireJson.currentQuote; // Fix the structure here
    if (this.quotes.length > 0) {
      this.currentQuote = this.quotes[0];
      this.preloadImages(); // Preload images
      this.startQuoteCycle();
    }
  }

  preloadImages() {
    this.quotes.forEach(quote => {
      const img = new Image();
      img.src = quote.pic;
    });
  }

  startQuoteCycle() {
    this.interval = setInterval(() => {
      this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
      this.currentQuote = this.quotes[this.quoteIndex];
    }, 6000); // Cycle every 6 seconds
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
