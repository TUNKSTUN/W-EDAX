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

@Injectable({
  providedIn: 'root',
})
export class GuestBookService {
  private apiUrl = `${environment.apiUrl}/GuestBook`;
  private messagesSubject = new BehaviorSubject<GuestBookModel[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private messageSubject = new Subject<GuestBookModel>();
  private gun: any;
  private gun_node = "GuestBook";
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private db: AngularFireDatabase
  ) {
    this.initGun();
    this.setupMessageListener();
  }

  private initGun(): void {
    // Update the peer address to your relay server's address
    const peerRelays = ['https://gun-relay-server-zk8u.onrender.com/gun']; // Replace with your actual relay server address
    this.gun = Gun({ peers: peerRelays, localStorage: true, retry: Infinity });
  }

  private sendMessageToGunDB(message: GuestBookModel): void {
    this.gun.get(this.gun_node).set(message); // Store message globally
  }


  addMessage(entry: GuestBookModel): Observable<void> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) throw new Error('User must be logged in to send a message');
        return {
          ...entry,
          UserId: user.uid,
          GitHubUsername: user.name || 'Guest',
          ProfilePicUrl: user.photoURL || '',
          DatePosted: new Date().toLocaleTimeString().toString(),
          IsApproved: false,
        };
      }),
      tap(message => this.sendMessageToGunDB(message)),
      switchMap(message => this.saveMessageToFirebase(message)),
      catchError(this.handleError('adding message')),
      map(() => void 0)
    );
  }

  getAllMessages(userId: string): Observable<GuestBookModel[]> {
    return new Observable<GuestBookModel[]>(observer => {
      const messages: GuestBookModel[] = [];

      // Fetch messages from GunDB for the user
      this.gun.get(this.gun_node).map().once((message: GuestBookModel, key: string) => {
        if (message) {
          message.MessageId = key; // Assign GunDB key as MessageId
          message.DatePosted = new Date(message.DatePosted).toLocaleTimeString(); // Ensure the DatePosted is a Date object
          messages.push(message);
        }
      });

      // Once done fetching, emit the messages
      setTimeout(() => {
        observer.next(messages);
        observer.complete();

        // Sync the messages to Firebase (optional)
        this.syncMessagesToFirebase(messages, userId);
        this.messagesSubject.next(messages); // Update the BehaviorSubject with the messages
      }, 1000); // Allow some time for GunDB to fetch the data

    }).pipe(
      catchError(this.handleError('fetching messages from GunDB'))
    );
  }

  private syncMessagesToFirebase(messages: GuestBookModel[], userId: string): void {
    messages.forEach(message => {
      const messageId = message.MessageId;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      // Update or add message to Firebase
      this.db.object(`Guestbook/${userId}/messages/${messageId}`).update({
        ...message,
        expirationDate: expirationDate.toISOString(),
      }).catch(error => {
        console.error('Error syncing message to Firebase:', error);
      });
    });
  }


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
          expirationDate: expirationDate.toISOString(),
        }));
      }),
      catchError(this.handleError('saving message to Firebase'))
    );
  }


  private syncMessagesToGunDB(messages: GuestBookModel[]): void {
    messages.forEach(message => this.sendMessageToGunDB(message));
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
        // Make sure to check for duplicate messages here if needed
        message.MessageId = key;
        message.DatePosted = typeof message.DatePosted === 'string' ? new Date(message.DatePosted): message.DatePosted;

        // Ensure the message is not already present
        const existingMessage = this.messagesSubject.value.find(m => m.MessageId === message.MessageId);
        if (!existingMessage) {
          this.messagesSubject.next([...this.messagesSubject.value, message]);
          this.messageSubject.next(message); // Emit the message to subscribers

        }
      }
    });
  }



  public onMessage(callback: (message: GuestBookModel) => void): Subscription {
    return this.messageSubject.subscribe(callback); // Return the subscription
  }
}
