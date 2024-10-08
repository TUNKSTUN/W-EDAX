import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, Renderer2, ElementRef, OnDestroy, OnInit } from '@angular/core';
import contentJson from '../assets/content.json';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [NgFor, CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  private scrollHandler: (() => void) | undefined;
  public content: any = contentJson;
  public frontImageSrc: string = '';
  public backImageSrc: string = '';

  constructor(private renderer: Renderer2, private el: ElementRef, private http: HttpClient) { }

  ngOnInit() {
    this.loadImages();
  }

  private loadImages() {
    // Load front image
    this.http.get('assets/images/yahya-pix.png', { responseType: 'blob' })
      .subscribe(blob => {
        this.frontImageSrc = URL.createObjectURL(blob);
      });

    // Load back image (Signal icon)
    this.http.get('assets/images/signal.png', { responseType: 'blob' })
      .subscribe(blob => {
        this.backImageSrc = URL.createObjectURL(blob);
      });
  }

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
