import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarqueeService {
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  setupMarquee(): void {
    const marquee = document.querySelector('.marquee') as HTMLElement;
    const slider = document.querySelector('.marquee__slider') as HTMLElement;

    if (!marquee || !slider) return;

    const sliderContent = slider.innerHTML;
    slider.innerHTML = sliderContent + sliderContent; // Duplicate content

    let scrollSpeed = 1; // Adjust this value to change the speed
    let scrollPos = 0;

    const scrollMarquee = () => {
      scrollPos += scrollSpeed;
      if (scrollPos >= slider.scrollWidth / 2) {
        scrollPos = 0;
      }
      marquee.scrollLeft = scrollPos;
      requestAnimationFrame(scrollMarquee);
    };

    scrollMarquee();
  }
}
