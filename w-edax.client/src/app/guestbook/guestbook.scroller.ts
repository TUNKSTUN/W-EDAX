import { Renderer2 } from '@angular/core';
import { GuestBookModel } from '../models/guestbook.model';

export class GuestbookScroller {
  private userIsInteracting: boolean = false;
  private interactionTimeout: any;
  private scrollDelay: number = 5000; // 3 seconds delay
  private chatbox: HTMLElement | null = null;

  public newMessageArrived: boolean = false;

  constructor(private renderer: Renderer2) { }

  public setChatbox(element: HTMLElement) {
    this.chatbox = element;
    this.renderer.listen(this.chatbox, 'scroll', () => this.handleScroll());
    this.renderer.listen(this.chatbox, 'mousemove', () => this.handleUserInteraction());
  }

  public handleUserInteraction(): void {
    this.userIsInteracting = true;
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }

    this.interactionTimeout = setTimeout(() => {
      this.userIsInteracting = false;
      if (this.newMessageArrived) {
        this.scrollToTop(); // Scroll to top
      }
    }, this.scrollDelay);
  }

  public smoothScrollTo(element: HTMLElement, target: number, duration: number): void {
    const start = element.scrollTop;
    const change = target - start;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Normalize to [0, 1]
      const easing = 0.5 - Math.cos(progress * Math.PI) / 2; // Easing function

      element.scrollTop = start + change * easing; // Apply easing to scroll

      if (progress < 1) {
        requestAnimationFrame(animateScroll); // Continue animating
      }
    };

    requestAnimationFrame(animateScroll);
  }

  public scrollToTop(): void {
    if (this.chatbox) {
      this.smoothScrollTo(this.chatbox, 0, 1000); // Scroll to top in 1 second
    }
  }

  public handleScroll(): void {
    if (this.chatbox) {
      const atTop = this.chatbox.scrollTop === 0;
      if (atTop && !this.userIsInteracting) {
        this.loadMoreMessages();
      }
    }
  }

  public loadMoreMessages(): void {
    // Implement logic to load more messages
  }

  public handleNewMessage(newMessage: GuestBookModel, messages: GuestBookModel[]): GuestBookModel[] {
    messages.push(newMessage);
    messages.sort((a, b) => {
      const dateA = a.DatePosted ? new Date(a.DatePosted).getTime() : 0;
      const dateB = b.DatePosted ? new Date(b.DatePosted).getTime() : 0;
      return dateB - dateA;
    });

    if (this.chatbox) {
      const lastMessageElement = this.chatbox.lastElementChild; 
      if (lastMessageElement) {
        this.smoothScrollTo(this.chatbox, lastMessageElement.getBoundingClientRect().top + this.chatbox.scrollTop, 100); // Smooth scroll to the last message in 1 second
      }
    }

    this.newMessageArrived = true; 
    return messages;
  }

  public reset(): void {
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }
  }
}
