import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-guestbook',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  providers: [DatePipe], // Provide DatePipe if used in the component
  templateUrl: './guestbook.component.html',
  styleUrls: ['./guestbook.component.scss']
})
export class GuestbookComponent {
  isLoggedIn = false; // Placeholder for GitHub login logic
  messageContent = '';
  messages: { username: string; content: string; timestamp: Date; }[] = [
    { username: 'User1', content: 'This is a test message.', timestamp: new Date() },
    { username: 'User2', content: 'Another dummy message!', timestamp: new Date() },
    { username: 'User3', content: 'Feel free to add your message here.', timestamp: new Date() }
  ];
  isEmojiPickerVisible = false;
  emojis = ['😊', '😂', '😍', '🥺', '😎', '👍']; // Add more emojis as needed

  loginWithGitHub() {
    // const url = `${this.authEndpoint}?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    // window.location.href = url;
  }

  handleOAuthCallback() {
    // Placeholder for OAuth callback implementation
  }

  submitMessage() {
    if (this.messageContent.trim()) {
      this.messages.push({
        username: 'User', // Replace with actual username logic
        content: this.messageContent,
        timestamp: new Date()
      });
      this.messageContent = '';
      this.scrollToBottom(); // Ensure the latest message is visible
    }
  }

  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  addEmoji(emoji: string) {
    this.messageContent += emoji;
    this.isEmojiPickerVisible = false;
  }

  @HostListener('window:keydown.enter', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.target instanceof HTMLTextAreaElement && event.target === document.activeElement) {
      event.preventDefault(); // Prevent the default action of Enter key (e.g., new line)
      this.submitMessage();
    }
  }

  private scrollToBottom() {
    const chatbox = document.querySelector('.chatbox');
    if (chatbox) {
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  }
}
