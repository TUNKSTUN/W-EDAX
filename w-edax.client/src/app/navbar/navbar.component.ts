import { Component, HostListener, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { TypewriterService } from './typewriter.service'; // Adjust path as needed

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isSticky: boolean = false;
  isHidden: boolean = false; // Keep track of navbar visibility
  private lastScrollTop: number = 0; // Last scroll position
  private scrollThreshold: number = 50; // Set a threshold to control navbar behavior

  constructor(
    private typewriterService: TypewriterService,
    private elementRef: ElementRef
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbarHeight = document.querySelector('.navbar-top')?.clientHeight || 0;
    const offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Scrolling down
    if (offset > this.lastScrollTop && offset > navbarHeight) {
      this.isSticky = true;
      this.isHidden = false; // Show navbar when scrolling down
      document.querySelector('.navbar-bottom')?.classList.add('sticky');
      document.querySelector('.navbar-bottom')?.classList.remove('hidden');
    }
    // Scrolling up and past threshold
    else if (offset < this.lastScrollTop && offset > this.scrollThreshold) {
      this.isSticky = true;
      this.isHidden = false; // Keep navbar visible when scrolling up but not hiding it too soon
      document.querySelector('.navbar-bottom')?.classList.add('sticky');
      document.querySelector('.navbar-bottom')?.classList.remove('hidden');
    }
    // Near the top of the page
    else if (offset < this.scrollThreshold) {
      this.isSticky = false;
      this.isHidden = false; // Ensure navbar is visible when near the top
      document.querySelector('.navbar-bottom')?.classList.remove('sticky');
      document.querySelector('.navbar-bottom')?.classList.remove('hidden');
    }

    this.lastScrollTop = offset <= 0 ? 0 : offset; // Update scroll position
  }

  ngOnInit() {
    const typewriterElement = this.elementRef.nativeElement.querySelector('.typewriter-text');
    if (typewriterElement) {
      this.typewriterService.startTypewriterEffect(typewriterElement);
    }
    this.initializeTheme();
  }

  ngOnDestroy() {
    // Clean up resources
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isDarkTheme = savedTheme === 'dark';
    document.body.classList.add(isDarkTheme ? 'dark-theme' : 'light-theme');
  }

  toggleTheme() {
    const isDarkTheme = !document.body.classList.contains('dark-theme');
    document.body.classList.toggle('dark-theme', isDarkTheme);
    document.body.classList.toggle('light-theme', !isDarkTheme);
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }
}
