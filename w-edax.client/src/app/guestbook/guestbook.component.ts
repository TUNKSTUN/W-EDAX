import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Services/auth.service';
import { GuestBookModel } from '../models/guestbook.model';
import { GuestbookScroller } from './guestbook.scroller';
import { IdGeneratorService } from '../Services/id-gen.service';
import { GuestBookService } from '../Services/guestbook.service';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { format } from 'date-fns';

@Component({
  selector: 'app-guestbook',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './guestbook.component.html',
  styleUrls: ['./guestbook.component.scss'],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-100%)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-100%)' }))
      ])
    ]),
  ],
})
export class GuestbookComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string = 'Guest';
  messageContent: string = '';
  messages: GuestBookModel[] = [];
  isEmojiPickerVisible: boolean = false;
  IsLoggedIn: boolean = false;
  private isSending: boolean = false;
  isSubmitting: boolean = false;
  userId: string = '';
  profilePicUrl: string = '';
  emojis: string[] = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'];
  isLoading: boolean = false;

  @ViewChild('chatbox') private chatbox!: ElementRef;
  @ViewChild('messageTextArea') private messageTextArea!: ElementRef;
  @ViewChild('emojiPicker') private emojiPicker!: ElementRef;

  private guestbookScroller: GuestbookScroller;
  private userSubscription: Subscription = new Subscription();
  private messageSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private renderer: Renderer2,
    private idGeneratorService: IdGeneratorService,
    private guestBookService: GuestBookService
  ) {
    this.guestbookScroller = new GuestbookScroller(renderer);
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => this.handleUserState(user));
    this.loadAllMessages();

    this.messageSubscription = this.guestBookService.onMessage((message: GuestBookModel) => {
      this.onMessageReceived(message);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.messageSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.chatbox) {
      this.guestbookScroller.setChatbox(this.chatbox.nativeElement);
    }
  }

  private onMessageReceived(newMessage: GuestBookModel): void {
    if (!this.messages.some(message => message.MessageId === newMessage.MessageId)) {
      newMessage.DatePosted = this.parseData(newMessage.DatePosted);
      this.messages.unshift(newMessage);
      this.cd.detectChanges();
    }
  }

  private handleUserState(user: any): void {
    this.IsLoggedIn = !!user;
    if (this.IsLoggedIn) {
      this.username = user.name || 'Guest';
      this.userId = user.uid || '';
      this.profilePicUrl = user.photoURL || '';
    } else {
      this.resetUserState();
    }
  }

  toggleAuth(): void {
    this.isLoading = true;
    this.IsLoggedIn ? this.logoutUser() : this.loginUser();
  }

  private loginUser(): void {
    this.authService.loginWithGitHub().subscribe({
      next: () => {
        this.isLoading = false;
        console.log('User logged in');
      },
      error: (error: any) => {
        console.error('Login error:', error);
        this.isLoading = false;
        alert('Login failed. Please try again.');
      },
    });
  }

  private logoutUser(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.resetUserState();
        console.log('User logged out');
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        this.isLoading = false;
        alert('Logout failed. Please try again.');
      },
    });
  }

  private resetUserState(): void {
    this.IsLoggedIn = false;
    this.username = 'Guest';
    this.userId = '';
    this.profilePicUrl = '';
    this.messages = [];
    this.isLoading = false;
  }

  submitMessage(): void {
    console.log('Attempting to submit message...');

    if (!this.authService.isAuthenticated()) {
      console.error('User is not authenticated.');
      return;
    }

    if (this.isValidMessage() && !this.isSubmitting) {
      console.log('Message is valid and not already submitting.');
      this.isSubmitting = true;

      const newMessage: GuestBookModel = this.createNewMessage();

      console.log('Submitting message:', newMessage);

      this.guestBookService.addMessage(newMessage).subscribe({
        next: () => {
          console.log('Message sent to GunDB successfully.');
          this.onMessageSent(newMessage);
          this.isSubmitting = false;
          setTimeout(() => {
            this.isSubmitting = false;
          }, 3000);
          this.guestBookService.saveMessageToFirebase(newMessage).subscribe({
            next: () => {
              console.log('Message saved to Firebase successfully.');
              this.isSubmitting = false;
            },
            error: (error: any) => {
              console.error('Error saving message to Firebase:', error);
            }
          });
        },
        error: (error: any) => {
          console.error('Error sending message to GunDB:', error);
          this.isSubmitting = false;
        },
      });
    } else {
      console.error('Message is either invalid or already submitting.');
    }
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.submitMessage();
    }
  }

  private isValidMessage(): boolean {
    return this.messageContent.trim() !== '' && this.IsLoggedIn;
  }

  private createNewMessage(): GuestBookModel {
    const messageId = this.idGeneratorService.generateMessageId();
    return {
      GitHubUsername: this.username,
      Message: this.messageContent,
      MessageId: messageId,
      DatePosted: new Date(),
      IsApproved: false,
      ProfilePicUrl: this.profilePicUrl,
      UserId: this.userId,
      Uid: this.userId,
    };
  }

  private onMessageSent(newMessage: GuestBookModel): void {
    //this.onMessageReceived(newMessage); // this part was showing double messages in chatbox
    this.messageContent = '';
    this.isSubmitting = false;
    this.cd.detectChanges();
  }

  loadAllMessages(): void {
    this.isLoading = true;

    this.authService.currentUser$.subscribe(user => {
      this.guestBookService.getAllMessages().subscribe({
        next: (data: GuestBookModel[]) => {
          console.log('Fetched Messages:', data);
          this.populateMessages(data);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading messages:', error);
          this.isLoading = false;
        },
      });
    });
  }

  private populateMessages(data: GuestBookModel[]): void {
    this.messages = data.map(message => ({
      ...message,
      DatePosted: this.parseData(message.DatePosted)
    })).sort((a, b) => new Date(b.DatePosted).getTime() - new Date(a.DatePosted).getTime());

    this.cd.detectChanges();
  }

  private parseData(dateInput: string | Date): string {
    let date: Date;
    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'MMM d, yyyy h:mm a');
  }

  addEmoji(emoji: string): void {
    this.messageContent += emoji;
    this.cd.detectChanges();
    this.messageTextArea.nativeElement.focus();
  }

  private onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isEmojiPickerVisible &&
      !this.emojiPicker.nativeElement.contains(target) &&
      !this.messageTextArea.nativeElement.contains(target)) {
      this.isEmojiPickerVisible = false;
      this.cd.detectChanges();
    }
  }

  toggleEmojiPicker(): void {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
    if (this.isEmojiPickerVisible) {
      this.renderer.listen('document', 'click', event => this.onDocumentClick(event));
    }
  }
}
