import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, from, Subject, Subscription } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GuestBookModel } from '../models/guestbook.model';
import Gun from 'gun';
import { AuthService } from './auth.service';
import { debounceTime } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class GuestBookService {
  private apiUrl = `${environment.apiUrl}/GuestBook`;
  private messagesSubject = new BehaviorSubject<GuestBookModel[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private messageSubject = new Subject<GuestBookModel>();
  private gun: any;
  private gun_node = "GuestBook1";

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private db: AngularFireDatabase
  ) {
    this.initGun();
    this.setupMessageListener();
    this.startCleanupSchedule(); // Start the cleanup schedule
  }

  private initGun(): void {
    const peerRelays = ['https://gun-relay-server-zk8u.onrender.com/gun'];
    this.gun = Gun({ peers: peerRelays, localStorage: true, retry: Infinity });
  }

  private getExpirationDate(): string {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    return expirationDate.toISOString();
  }

  private clearExpiredMessages(): void {
    const currentTime = new Date().getTime();

    // Fetch all messages from GunDB
    this.gun.get(this.gun_node).map().once((message: GuestBookModel, key: string) => {
      if (message && message.ExpirationDate) {
        const expirationTime = new Date(message.ExpirationDate).getTime();
        if (currentTime > expirationTime) {
          // Remove expired message
          this.gun.get(this.gun_node).get(key).put(null); // Remove the message by key
          console.log(`Cleared expired message: ${key}`);
        }
      }
    });
  }

  private startCleanupSchedule(): void {
    // Initial cleanup run when the service is instantiated
    this.clearExpiredMessages();

    // Set up an interval to run the cleanup every 24 hours
    setInterval(() => {
      this.clearExpiredMessages();
    }, 86400000); // 24 hours in milliseconds
  }

  private sendMessageToGunDB(message: GuestBookModel): void {
    console.log('Sending message to GunDB:', message); // Log the message
    message.DatePosted = new Date().toISOString(); // Use current time for posting
    message.ExpirationDate = this.getExpirationDate(); // Set expiration date

    // Set the message in GunDB
    this.gun.get(this.gun_node).set(message, (ack: any) => {
      if (ack.err) {
        console.error('Error sending message to GunDB:', ack.err);
      } else {
        console.log('Message sent successfully to GunDB:', ack);
      }
    });
  }

  // Save the message first to GunDB, then Firebase
  addMessage(entry: GuestBookModel): Observable<void> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) throw new Error('User must be logged in to send a message');
        return {
          ...entry,
          UserId: user.uid,
          GitHubUsername: user.name || 'Guest',
          ProfilePicUrl: user.photoURL || '',
          DatePosted: new Date(), // Set to ISO string format directly
          ExpirationDate: this.getExpirationDate(), // Set expiration date
          IsApproved: false,
        };
      }),
      tap(message => {
        // Immediately update the chatbox before sending to GunDB
        this.messagesSubject.next([...this.messagesSubject.value, message]);
        this.sendMessageToGunDB(message); // Store in GunDB
      }),
      switchMap(message => this.saveMessageToFirebase(message)),
      catchError(this.handleError('adding message')),
      map(() => void 0) // Return void after completion
    );
  }

  getAllMessages(): Observable<GuestBookModel[]> {
    return new Observable<GuestBookModel[]>(observer => {
      const messages: GuestBookModel[] = [];

      // Fetch messages from GunDB
      this.gun.get(this.gun_node).map().once((message: GuestBookModel, key: string) => {
        if (message) {
          message.MessageId = key; // Assign GunDB key as MessageId
          message.DatePosted = this.parseData(message.DatePosted);
          messages.push(message);
        }
      });

      // Once done fetching, emit the messages
      setTimeout(() => {
        observer.next(messages);
        observer.complete();
        this.messagesSubject.next(messages); // Update local cache
      }, 1000);
    }).pipe(
      catchError(this.handleError('fetching messages from GunDB'))
    );
  }

  public parseData(dateInput: string | Date): string {
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

  // No longer syncing GunDB to Firebase automatically
  public saveMessageToFirebase(entry: GuestBookModel): Observable<void> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        const userId = user?.uid;
        const newMessageRef = this.db.list(`Guestbook/${userId}/messages`).push(entry);
        const messageId = newMessageRef.key;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        return from(this.db.object(`Guestbook/${userId}/messages/${messageId}`).update({
          ...entry,
          MessageId: messageId,
          ExpirationDate: expirationDate.toISOString(), // Ensure this matches with GunDB
        }));
      }),
      catchError(this.handleError('saving message to Firebase'))
    );
  }

  private handleError(action: string) {
    return (error: any): Observable<never> => {
      console.error(`Error ${action}:`, error);
      return throwError(() => new Error(error));
    };
  }

  private setupMessageListener(): void {
    this.gun.get(this.gun_node).map().on((message: GuestBookModel, key: string) => {
      if (message) {
        message.MessageId = key;
        message.DatePosted = new Date(message.DatePosted).toISOString();

        // Prevent duplicates before updating messages
        const existingMessage = this.messagesSubject.value.find(m => m.MessageId === message.MessageId);
        if (!existingMessage) {
          this.messagesSubject.next([...this.messagesSubject.value, message]);
          this.messageSubject.next(message);
        }
      }
    });
  }

  public onMessage(callback: (message: GuestBookModel) => void): Subscription {
    return this.messageSubject.subscribe(callback); // Return the subscription
  }

  private mapDataToMessageModel(data: any): GuestBookModel {
    // Implement mapping logic based on your data structure
    return {
      DatePosted: data.DatePosted,
      // Other properties...
    } as GuestBookModel;
  }
}
