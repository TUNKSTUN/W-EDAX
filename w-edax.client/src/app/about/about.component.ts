import { Component, AfterViewInit, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
})
export class AboutComponent implements AfterViewInit {

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  ngAfterViewInit() {
    setTimeout(() => {
      const aboutSection = this.el.nativeElement.querySelector('.about');
      this.renderer.addClass(aboutSection, 'loaded');
    }, 300); // Adjust the delay as needed
  }
}
