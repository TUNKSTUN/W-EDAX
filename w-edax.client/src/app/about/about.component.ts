import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, Renderer2, ElementRef, OnDestroy, OnInit } from '@angular/core';
import contentJson from '../assets/content.json';
import { CommonModule, NgFor } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faLinkedin, faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';
@Component({
  selector: 'app-about',
  imports: [NgFor, CommonModule, FontAwesomeModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
})
export class AboutComponent implements  AfterViewInit, OnDestroy {
  faLinkedin = faLinkedin;
  faGithub = faGithub;
  faTwitter = faTwitter;
  private scrollHandler: (() => void) | undefined;
  public content: any = contentJson;


  constructor(private library: FaIconLibrary, private renderer: Renderer2, private el: ElementRef, private http: HttpClient) {    this.library.addIcons(faLinkedin, faGithub, faTwitter);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      const aboutSection = this.el.nativeElement.querySelector('.about');
      if (aboutSection) {
        this.renderer.addClass(aboutSection, 'loaded');
      }
    }, 300);

    this.scrollHandler = this.handleScroll.bind(this);
    if (this.scrollHandler) {
      window.addEventListener('scroll', this.scrollHandler);
    }
  }

  handleScroll() {
    const scrollPosition = window.scrollY;
    const blocks = this.el.nativeElement.querySelectorAll('.wavy-grid-container > div');

    blocks.forEach((block: HTMLElement, index: number) => {
      const rotation = (scrollPosition / 1) + (index * 10);
      this.renderer.setStyle(block, 'transform', `rotate(${rotation}deg)`);
    });
  }

  ngOnDestroy() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  // Authors array with Firebase images
  authors = [
    {
      name: 'Yahya',
      image: 'https://firebasestorage.googleapis.com/v0/b/w-edax-b.appspot.com/o/Assets%2Fyahya_1.png?alt=media&token=75420c3e-edfe-4330-a137-9a9883f38a87',
      description: [
        'Yahya is an accomplished Network Engineer with a solid background in infrastructure. He is continuously expanding his expertise in development and cybersecurity. Learn more about his journey at tunkstun.web.app.'
      ],
      socials: [
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/yahya24' },
        { platform: 'GitHub', url: 'https://github.com/tunkstun' },
        { platform: 'Twitter', url: 'https://twitter.com/tunkstun' },
      ]
    }
  ];
}
