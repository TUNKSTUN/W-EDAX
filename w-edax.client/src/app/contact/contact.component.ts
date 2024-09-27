import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  public fadeOut: boolean = false; // Control fade-out state
  public fadeIn: boolean = true; // Control fade-in state

  ngOnInit() {
    this.quotes = InspireJson.currentQuote; // Ensure this points to the correct array
    if (this.quotes.length > 0) {
      this.currentQuote = this.quotes[0];
      this.preloadImages();
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
      this.fadeOut = true; // Trigger fade-out

      // Delay to allow for fade-out duration
      setTimeout(() => {
        this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
        this.currentQuote = this.quotes[this.quoteIndex];

        this.fadeOut = false; // Reset fade-out
        this.fadeIn = true; // Trigger fade-in

        // Delay to allow for fade-in duration
        setTimeout(() => {
          this.fadeIn = false; // Reset fade-in
        }, 1000); // Delay for fade-in duration
      }, 1000); // Delay for fade-out duration
    }, 6000); // Change quote every 6 seconds
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
