import { Injectable } from '@angular/core';
import Gun from 'gun';
import 'gun/sea';
import { BehaviorSubject } from 'rxjs';
import { GuestBookModel } from '../models/guestbook.model';

@Injectable({
  providedIn: 'root',
})
export class GunService {
  private gun: any;
  private messagesSubject = new BehaviorSubject<GuestBookModel[]>([]);
  public messages: GuestBookModel[] = [];

  constructor() {
    this.initGun();
    this.setupMessageListener();
  }

  private initGun(): void {
    const peerRelays = ['https://chat-relay-f22545140058.herokuapp.com:3023'];
    this.gun = Gun({ peers: peerRelays, localStorage: true, retry: Infinity });
  }

  async getAllMessages(): Promise<GuestBookModel[]> {
    this.messages = [];
    return new Promise((resolve, reject) => {
      this.gun.get('messages').map().once((data: GuestBookModel, key: string) => {
        if (data) {
          data.MessageId = key;
          // Convert DatePosted to shorthand format if it's a string
          if (typeof data.DatePosted === 'string') {
            data.DatePosted = this.formatDate(new Date(data.DatePosted));
          }
          this.messages.push(data);
          this.messagesSubject.next(this.messages);
        }
        resolve(this.messages);
      }, reject);
    });
  }

  sendMessage(message: GuestBookModel): void {
    // Convert DatePosted to string in ISO format before saving to GunDB
    const messageToSend = {
      ...message,
      DatePosted: message.DatePosted instanceof Date ? message.DatePosted.toISOString() : message.DatePosted
    };
    this.gun.get('messages').set(messageToSend);
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  onMessage(callback: (messages: GuestBookModel[]) => void): void {
    this.messagesSubject.subscribe(callback);
  }

  private setupMessageListener(): void {
    this.gun.get('messages').map().on((message: GuestBookModel, key: string) => { 
      if (message) {
        message.MessageId = key;
        // Convert DatePosted to shorthand format if it's a string
        if (typeof message.DatePosted === 'string') {
          message.DatePosted = this.formatDate(new Date(message.DatePosted));
        }
        if (!this.messages.some(msg => msg.MessageId === message.MessageId)) {
          this.messages.push(message);
          this.messagesSubject.next(this.messages);
        }
      }
    });
  }
}
