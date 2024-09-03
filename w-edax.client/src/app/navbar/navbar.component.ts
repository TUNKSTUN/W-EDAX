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
  isDarkTheme: boolean = false;
  private typewriterElement: HTMLElement | null = null;
  private lastScrollTop: number = 0;

  constructor(
    private typewriterService: TypewriterService,
    private elementRef: ElementRef
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbarHeight = document.querySelector('.navbar')?.clientHeight || 0;
    const offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (offset > this.lastScrollTop && offset > navbarHeight) {
      // Scroll Down - Make navbar sticky and move it up
      this.isSticky = true;
      document.querySelector('.navbar')?.classList.add('sticky');
      document.querySelector('.navbar')?.classList.add('scroll-down');
      document.querySelector('.navbar-bottom')?.classList.add('sticky');
    } else {
      // Scroll Up - Make navbar visible and move it down
      document.querySelector('.navbar')?.classList.remove('scroll-down');
      this.isSticky = offset > navbarHeight;
      document.querySelector('.navbar-bottom')?.classList.add('sticky');
    }

    this.lastScrollTop = offset <= 0 ? 0 : offset; // For Mobile or negative scrolling
  }

  ngOnInit() {
    this.typewriterElement = this.elementRef.nativeElement.querySelector('.typewriter-text');
    if (this.typewriterElement) {
      this.typewriterService.startTypewriterEffect(this.typewriterElement);
    }
    this.initializeTheme();
  }

  ngOnDestroy() {
    // Clean up any resources if necessary
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    document.body.classList.add(this.isDarkTheme ? 'dark-theme' : 'light-theme');
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
    document.body.classList.toggle('light-theme', !this.isDarkTheme);
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }
}
