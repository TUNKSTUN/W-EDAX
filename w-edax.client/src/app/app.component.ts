// app.component.ts

import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { GuestbookComponent } from './guestbook/guestbook.component';
import { FooterComponent } from './footer/footer.component';
import { KeywordSearchComponent } from '../app/keyword-seach/keyword-search.component'; // Import the component


@Component({
  selector: 'app-root',
  templateUrl: `./app.component.html`,
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [ NavbarComponent, RouterModule, HomeComponent, AboutComponent, ContactComponent, GuestbookComponent, FooterComponent, RouterOutlet, KeywordSearchComponent],
})
export class AppComponent {
  title: any;

  // Property to keep track of dark mode
  isDarkTheme: boolean = false;

  // Method to toggle dark mode
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  // Initialize the theme based on user preference
  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }
}
