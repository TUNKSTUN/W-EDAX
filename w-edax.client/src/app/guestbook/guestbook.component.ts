import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Services/auth.service';
import { GuestBookModel } from '../models/guestbook.model';
import { GuestbookScroller } from './guestbook.scroller';
import { IdGeneratorService } from '../Services/id-gen.service';
import { GuestBookService } from '../Services/guestbook.service';
import { Subscription } from 'rxjs';
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
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('0.5s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.5s ease-out', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class GuestbookComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string = 'Guest';
  messageContent: string = '';
  messages: GuestBookModel[] = [];
  isEmojiPickerVisible: boolean = false;
  IsLoggedIn: boolean = false;
  private isSubmitting: boolean = false;
  public showLoginButton: boolean = false; // Control visibility of login button
  userId: string = '';
  profilePicUrl: string = '';
  emojis: string[] = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🥰', '😍', '😘', '😗', '😙', '😚',
    '😋', '😜', '😝', '😛', '😏', '😎', '🤓', '🧐', '😕', '😟', '😮', '😯', '😲', '😳', '😬', '🤯',
    '😴', '😪', '😵', '🥳', '🤩', '🥺', '😱', '😈', '👻', '😷', '🤒', '🤕', '🥵', '🥶', '🌈', '🌟',
    '✨', '🎉', '🎊', '🎈', '🍀', '🍎', '🍉', '🍓', '🍌', '🍕', '🌮', '🍔', '🍿', '🌭', '🍩', '🍪',
    '🍰', '🎂', '🧁', '🍫', '🍬', '🍭', '💖', '💗', '💞', '💘', '❤️', '💛', '💚', '💙', '💜', '🖤',
    '🤍', '🤎', '🧡', '🔥', '💥', '✨', '🌟', '🌻', '🌼', '🌸', '🌺', '🌹', '🌷', '🏆', '🥇', '🥈',
    '🥉', '🎖️', '🎗️', '🎟️', '🏅', '🚀', '✈️', '🚁', '🛩️', '🛶', '⛵', '🚤', '🛳️', '🏍️', '🚲',
    '🚌', '🚎', '🚓', '🚑', '🚕', '🚘', '🚙', '🚍', '🚦', '🚥', '🚧', '🔋', '💡', '🔌', '💻', '📱',
    '📲', '💽', '📀', '🖥️', '🖨️', '🖱️', '🖲️', '🎙️', '🎚️', '🎛️', '📷', '📹', '📼', '🔍', '🔎',
    '🔭', '🔬', '🧬', '⚗️', '🧪', '💊', '💉', '🩺', '🚑', '🚒', '🚓', '🚖', '🛴', '🦯', '🦮', '🦷',
    '🦴', '🐾', '🐶', '🐕', '🐕‍🦺', '🐩', '🐈', '🐈‍⬛', '🐢', '🐍', '🦎', '🦋', '🐝', '🐞', '🦗',
    '🐠', '🐟', '🐬', '🐋', '🦈', '🐅', '🐘', '🦏', '🐪', '🐫', '🐒', '🐥', '🦚', '🐦', '🐧', '🦅'
  ];

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

    setTimeout(() => {
      this.isLoading = false; // Hide loading spinner
      this.showLoginButton = true; // Show login button with animation
    }, 2000); // Change this duration as per your loading time


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
    this.isLoading = true;
    this.authService.loginWithGitHub().subscribe(() => {
      setTimeout(() => {
        this.isLoading = false; // Hide loading
        this.showLoginButton = true; // Show login button after login
      }, 1000);
    }, () => {
      this.isLoading = false;
    });
  }

  private logoutUser(): void {
    this.authService.logout().subscribe(() => {
      this.resetUserState();
    }, () => {
      this.isLoading = false;
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
    if (!this.authService.isAuthenticated()) {
      return;
    }

    if (this.isValidMessage() && !this.isSubmitting) {
      this.isSubmitting = true; // Set to true to prevent double submission
      const newMessage: GuestBookModel = this.createNewMessage();

      // Add message to the backend
      this.guestBookService.addMessage(newMessage).subscribe(
        () => {
          this.onMessageSent(newMessage);
          this.guestBookService.saveMessageToFirebase(newMessage).subscribe();
          this.guestbookScroller.scrollToTop(); // Scroll to top on new message
        },
        () => {
          this.isSubmitting = false; // Reset if there's an error
        },
        () => {
          this.isSubmitting = false; // Reset after completion
        }
      );
    }
  }


  onEnter(event: KeyboardEvent, messageInput: HTMLTextAreaElement) {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        const cursorPosition = messageInput.selectionStart;
        const currentValue = messageInput.value;
        messageInput.value = currentValue.slice(0, cursorPosition) +  currentValue.slice(cursorPosition);
        messageInput.selectionStart = messageInput.selectionEnd = cursorPosition + 1;
      } else {

        event.preventDefault();
        this.submitMessage();
      }
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
      ExpirationDate: new Date()
    };
  }

  private onMessageSent(newMessage: GuestBookModel): void {
    this.messageContent = '';
    this.isSubmitting = false;
    this.cd.detectChanges();
  }

  loadAllMessages(): void {
    this.isLoading = true;
    setTimeout(() => {
    this.authService.currentUser$.subscribe(() => {
      this.guestBookService.getAllMessages().subscribe(data => {
        this.populateMessages(data);
        this.isLoading = false;
        this.showLoginButton = true;

      }, () => {
        this.isLoading = false;
      });
    });
  }, 1000);
  }

  private populateMessages(data: GuestBookModel[]): void {
    this.isLoading = true;
    this.messages = data.map(message => ({
      ...message,
      DatePosted: this.parseData(message.DatePosted)
    })).sort((a, b) => new Date(b.DatePosted).getTime() - new Date(a.DatePosted).getTime());
    this.isLoading = false;
    this.cd.detectChanges();
  }

  public parseData(dateInput: string | Date | undefined): string {
    if (dateInput === undefined) {
      return 'Invalid date';
    }

    let date: Date;
    if (typeof dateInput === 'string') {
      date = new Date(dateInput);

      // If it's not a valid date, try to parse it as a timestamp
      if (isNaN(date.getTime())) {
        const timestamp = parseInt(dateInput, 10);
        date = new Date(timestamp);
      }
    } else {
      date = dateInput;
    }
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM d, yyyy h:mm:ss a');
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
