import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import contentJson from '../assets/content.json'; // Use default import for JSON
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-about',
  imports:[NgFor],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private scrollHandler: (() => void) | undefined;
  public content: any = contentJson; // Bind the JSON content here

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  ngAfterViewInit() {
    // Add class after a short delay
    setTimeout(() => {
      const aboutSection = this.el.nativeElement.querySelector('.about');
      if (aboutSection) {
        this.renderer.addClass(aboutSection, 'loaded');
      }
    }, 300); // Adjust the delay as needed

    // Add scroll event listener
    this.scrollHandler = this.handleScroll.bind(this);
    if (this.scrollHandler) {
      window.addEventListener('scroll', this.scrollHandler);
    }
  }

  public flipImage(): void {
    const image = this.el.nativeElement.querySelector('.image');
    this.renderer.addClass(image, 'flipped'); // Add the flip class to start the animation
  }

  public resetImage(): void {
    const image = this.el.nativeElement.querySelector('.image');
    this.renderer.removeClass(image, 'flipped'); // Remove the flip class to reset the animation
  }

  handleScroll() {
    const scrollPosition = window.scrollY;
    const blocks = this.el.nativeElement.querySelectorAll('.wavy-grid-container > div');

    blocks.forEach((block: HTMLElement, index: number) => {
      const rotation = (scrollPosition / 1) + (index * 10); // Adjust values as needed
      this.renderer.setStyle(block, 'transform', `rotate(${rotation}deg)`);
    });
  }

  ngOnDestroy() {
    // Clean up event listener on component destroy
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }
}
