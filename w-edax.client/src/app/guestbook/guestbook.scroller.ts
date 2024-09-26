import { Renderer2, ElementRef } from '@angular/core';
import { GuestBookModel } from '../models/guestbook.model';

export class GuestbookScroller {
  private userIsInteracting: boolean = false;
  private interactionTimeout: any;
  private newMessageArrived: boolean = false;
  private scrollDelay: number = 3000; // 5 seconds delay
  private chatbox: HTMLElement | null = null;

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

  public scrollToTop(): void {
    if (this.chatbox) {
      this.chatbox.scrollTop = 0; // Scroll to the top of the chatbox
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
    // Call method to fetch more messages from the service
  }

  handleNewMessage(newMessage: GuestBookModel, messages: GuestBookModel[]): GuestBookModel[] {
    messages.push(newMessage);
    messages.sort((a, b) => {
      const dateA = a.DatePosted ? new Date(a.DatePosted).getTime() : 0; // Fallback to 0 if undefined
      const dateB = b.DatePosted ? new Date(b.DatePosted).getTime() : 0; // Fallback to 0 if undefined
      return dateB - dateA; // Sort descending
    });
    return messages;
  }


  public reset(): void {
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }
  }
}
