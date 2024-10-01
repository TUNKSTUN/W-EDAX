import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as InspireJson from '../assets/Inspire.json';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {
  quotes: { text: string, author: string, pic: string }[] = [];
  currentQuote!: { text: string, author: string, pic: string };
  private quoteIndex = 0;
  private interval: any;
  public fadeOut: boolean = false;
  public fadeIn: boolean = true;

  // Form model
  public name: string = '';
  public email: string = '';
  public message: string = '';

  // Success and error message visibility
  public showSuccessMessage: boolean = false;
  public showErrorMessage: boolean = false;
  public errorMessage: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.quotes = InspireJson.currentQuote;
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
      this.fadeOut = true;
      setTimeout(() => {
        this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
        this.currentQuote = this.quotes[this.quoteIndex];

        this.fadeOut = false;
        this.fadeIn = true;
        setTimeout(() => {
          this.fadeIn = false;
        }, 1000);
      }, 1000);
    }, 6000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  // Method to handle form submission
  onSubmit() {
    const contactData = {
      name: this.name,
      email: this.email,
      message: this.message,
      timestamp: new Date().toISOString() // Optional: Add a timestamp
    };

    // Send contact data to the server via HTTP POST request
    this.http.post('/api/Contact', contactData)
      .subscribe({
        next: () => {
          console.log('Contact data sent successfully');
          this.showSuccessMessage = true; // Show success message

          // Hide the success message after 3 seconds
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);

          // Reset the form
          this.name = '';
          this.email = '';
          this.message = '';
        },
        error: (error) => {
          console.error('Error sending contact data:', error);
          this.showErrorMessage = true; // Show error message
          this.errorMessage = 'Failed to send message. Please try again.'; // Set the error message

          // Hide the error message after 3 seconds
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 3000);
        }
      });
  }
}
