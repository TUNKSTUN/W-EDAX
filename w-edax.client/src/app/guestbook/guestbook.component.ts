import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Services/auth.service';
import { MessageService } from '../Services/message.service';
import { GuestBookModel } from '../models/guestbook.model.';
import { Auth, signInWithPopup, GithubAuthProvider, User } from '@angular/fire/auth';

@Component({
  selector: 'app-guestbook',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './guestbook.component.html',
  styleUrls: ['./guestbook.component.scss'],
})
export class GuestbookComponent {
  username: string = 'Guest';
  messageContent: string = '';
  messages: GuestBookModel[] = [];
  isEmojiPickerVisible: boolean = false;
  emojis: string[] = ['😊', '😂', '😍', '🥺', '😎', '👍'];

  private auth: Auth = inject(Auth);
  private authService: AuthService = inject(AuthService);
  private messageService: MessageService = inject(MessageService);
  isLoggedIn$ = this.authService.isLoggedIn();
  isLoggedIn: boolean = false;

  constructor() {
    this.authService.isLoggedIn().subscribe(status => {
      this.isLoggedIn = status;
      if (this.isLoggedIn) {
        this.authService.getCurrentUser().subscribe(user => {
          this.username = user?.displayName ?? 'Guest';
          this.loadMessages();
        });
      } else {
        this.username = 'Guest';
        this.messages = [];
      }
    });
  }

  async toggleAuth(): Promise<void> {
    if (this.isLoggedIn) {
      try {
        await this.auth.signOut(); // Ensure no arguments
        await this.authService.logout();
        this.username = 'Guest';
        this.messages = [];
        console.log('User logged out');
      } catch (error) {
        console.error('Logout error:', error);
      }
    } else {
      try {
        await this.authService.loginWithGitHub(); // No arguments required
        const user = await this.auth.currentUser; // Get the user from the auth service
        this.username = user?.displayName ?? 'Guest';
        console.log('User logged in:', this.username);
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  }


  submitMessage(): void {
    if (this.messageContent.trim()) {
      const newMessage: GuestBookModel = {
        guestName: this.username,
        message: this.messageContent,
        datePosted: new Date(),
        email: '',
        isApproved: false,
        accessToken: ''
      };

      this.messageService.addMessage(newMessage).subscribe({
        next: () => {
          this.messages.push(newMessage);
          this.messageContent = '';
        },
        error: (error) => {
          console.error('Error sending message:', error);
        }
      });
    }
  }

  loadMessages(): void {
    this.messageService.getMessages().subscribe({
      next: (data: GuestBookModel[]) => {
        this.messages = data;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  toggleEmojiPicker(): void {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  addEmoji(emoji: string): void {
    this.messageContent += emoji;
    this.isEmojiPickerVisible = false;
  }

  @HostListener('window:keydown.enter', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.target instanceof HTMLTextAreaElement && event.target === document.activeElement) {
      event.preventDefault();
      this.submitMessage();
    }
  }
}
