import { Component, HostListener, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { TypewriterService } from './typewriter.service'; // Adjust path as needed
import { Router, NavigationEnd } from '@angular/router'; // Correct import
import { RouterLink } from '@angular/router';
import { NgClass, ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isOpen: Boolean = false;  // Unused but kept for collapsible navbar
  currentUrl: string = '';  // Tracks the current URL
  isSticky: boolean = false;
  isHidden: boolean = false;
  isNavbarOpen: boolean = false;
  isDropdownOpen: boolean = false;  // Tracks if dropdown menu is open (mobile)
  private lastScrollTop: number = 0;
  private scrollThreshold: number = 50;

  constructor(
    private typewriterService: TypewriterService,
    private elementRef: ElementRef,
    private router: Router, private viewportScroller: ViewportScroller
  ) {
    // Subscribe to router events to set the current URL
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = this.router.url;
        this.isDropdownOpen = false;
      }
    });
  }


  // Toggle the mobile dropdown menu
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbarHeight = document.querySelector('.navbar-top')?.clientHeight || 0;
    const offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (offset > this.lastScrollTop && offset > navbarHeight) {
      this.isSticky = true;
      this.isHidden = false;
      document.querySelector('.navbar-bottom')?.classList.add('sticky');
      document.querySelector('.navbar-bottom')?.classList.remove('hidden');
    } else if (offset < this.lastScrollTop && offset > this.scrollThreshold) {
      this.isSticky = true;
      this.isHidden = false;
      document.querySelector('.navbar-bottom')?.classList.add('sticky');
      document.querySelector('.navbar-bottom')?.classList.remove('hidden');
    } else if (offset < this.scrollThreshold) {
      this.isSticky = false;
      this.isHidden = false;
      document.querySelector('.navbar-bottom')?.classList.remove('sticky');
      document.querySelector('.navbar-bottom')?.classList.remove('hidden');
    }

    this.lastScrollTop = offset <= 0 ? 0 : offset;
  }

  ngOnInit() {
    const typewriterElement = this.elementRef.nativeElement.querySelector('.typewriter-text');
    if (typewriterElement) {
      this.typewriterService.startTypewriterEffect(typewriterElement);
    }
    this.initializeTheme();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.viewportScroller.scrollToPosition([0, 0]); // Scroll to top
      }
    });
  }

  ngOnDestroy() {
    // Clean up resources if necessary
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

  isActive(path: string): boolean {
    return this.currentUrl === path;
  }
}
