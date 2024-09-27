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
  styleUrls: ['./guestbook.component.scss'], animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-100%)' }), // Start from the top
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })), // Slide into place
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-100%)' })) // Slide out to the top
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

    // Subscribe to incoming messages in GuestBookService
    this.messageSubscription = this.guestBookService.onMessage((message: GuestBookModel) => {
      this.onMessageReceived(message); // Process single incoming message
    });
  }

  ngAfterViewInit(): void {
    if (this.chatbox) {
      this.guestbookScroller.setChatbox(this.chatbox.nativeElement);
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.userSubscription.unsubscribe();
    this.messageSubscription.unsubscribe();
  }

  private onMessageReceived(newMessage: GuestBookModel): void {
    // Prevent duplicate messages
    if (!this.messages.some(message => message.MessageId === newMessage.MessageId)) {
      newMessage.DatePosted = newMessage.DatePosted.toLocaleString() // Format date accordingly
      this.messages.unshift(newMessage); // Prepend the new message
      this.cd.detectChanges(); // Ensure the view updates
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
  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.messageContent.trim() !== '' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line when Enter is pressed without Shift

      const newMessage: GuestBookModel = this.createNewMessage();

      // Immediately add the new message to the chatbox UI
      this.onMessageReceived(newMessage);
      this.messageContent = ''; // Clear the input field

      // Trigger message submission
      this.submitMessage();
    }
  }


  submitMessage(): void {
    if (this.isValidMessage() && !this.isSubmitting) {
      this.isSubmitting = true; // Set submitting flag
      const newMessage: GuestBookModel = this.createNewMessage();

      // Send message to GunDB first
      this.guestBookService.addMessage(newMessage).subscribe({
        next: () => {
          // Update UI after successful GunDB addition
          this.onMessageSent(newMessage);

          // Optionally save message to Firebase after confirming GunDB success
          this.guestBookService.saveMessageToFirebase(newMessage).subscribe({
            next: () => {
              console.log('Message saved to Firebase successfully.');
            },
            error: (error: any) => {
              console.error('Error saving message to Firebase:', error);
            }
          });
        },
        error: (error: any) => {
          console.error('Error sending message to GunDB:', error);
          this.isSubmitting = false; // Reset submitting flag on failure
        },
      });
    } else {
      console.error('User must be logged in to submit a message or message is already submitting.');
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
      DatePosted: new Date().toLocaleString(), // Store the date as an ISO string
      IsApproved: false,
      ProfilePicUrl: this.profilePicUrl,
      UserId: this.userId,
      Uid: this.userId,
    };
  }

  private onMessageSent(newMessage: GuestBookModel): void {
    // Prepend the new message to the messages array
    this.onMessageReceived(newMessage); // Add new message to the top
    this.messageContent = ''; // Clear the input after sending
    this.isSubmitting = false;
    this.cd.detectChanges(); // Trigger change detection to update the view
  }

  loadAllMessages(): void {
    this.isLoading = true;

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const userId = user.uid;

        this.guestBookService.getAllMessages(userId).subscribe({
          next: (data: GuestBookModel[]) => {
            console.log('Fetched Messages:', data);
            this.populateMessages(data); // Show messages filtered by userId
            this.isLoading = false;
          },
          error: (error: any) => {
            console.error('Error loading messages:', error);
            this.isLoading = false;
          },
        });
      } else {
        this.isLoading = false;
        console.error('No user is logged in');
      }
    });
  }

  private populateMessages(data: GuestBookModel[]): void {
    this.messages = data.sort((a, b) => new Date(b.DatePosted).getTime() - new Date(a.DatePosted).getTime());
    this.cd.detectChanges();
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
