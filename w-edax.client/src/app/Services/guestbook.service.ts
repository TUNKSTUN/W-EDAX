import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, from } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GuestBookModel } from '../models/guestbook.model';
import Gun from 'gun';
import { AuthService } from './auth.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GuestBookService {
  private apiUrl = `${environment.apiUrl}/GuestBook`;
  private messagesSubject = new BehaviorSubject<GuestBookModel[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private messageSubject = new Subject<GuestBookModel>();
  private gun: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private db: AngularFireDatabase
  ) {
    this.initGun();
    this.setupMessageListener();
    this.gun.get('messages').map().on((message: GuestBookModel, key: string) => {
      if (message) {
        message.MessageId = key;
        this.messageSubject.next(message); // Emit the message to all subscribers
      }
    });
  }

  private initGun(): void {
    // Replace the following line with your EC2 instance's public address
    const peerRelays = ['wss://chat-relay-ALB-1778665202.us-east-1.elb.amazonaws.com:3010'];
    this.gun = Gun({ peers: peerRelays, localStorage: true, retry: Infinity });
  }

  getAllMessages(userId: string): Observable<GuestBookModel[]> {
    return this.db.list<GuestBookModel>(`Guestbook/${userId}/messages`).valueChanges().pipe(
      tap(messages => this.syncMessagesToGunDB(messages)),
      catchError(this.handleError('fetching all messages'))
    );
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
          DatePosted: new Date().toISOString(),
          IsApproved: false,
        };
      }),
      tap(message => this.sendMessageToGunDB(message)),
      switchMap(message => this.saveMessageToFirebase(message)),
      catchError(this.handleError('adding message')),
      map(() => void 0)
    );
  }

  public saveMessageToFirebase(entry: GuestBookModel): Observable<void> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        if (!user) throw new Error('User must be logged in to save a message');
        const userId = user.uid;
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

  private sendMessageToGunDB(message: GuestBookModel): void {
    this.gun.get(`Guestbook/${message.UserId}/messages`).set(message);
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
    this.gun.get('messages').map().on((message: GuestBookModel, key: string) => {
      if (message) {
        message.MessageId = key;
        if (typeof message.DatePosted === 'string') {
          message.DatePosted = new Date(message.DatePosted);
        }
        this.messagesSubject.next(this.messagesSubject.value.concat(message));
      }
    });
  }

  public onMessage(callback: (message: GuestBookModel) => void): Subscription {
    return this.messageSubject.subscribe(callback); // Return the subscription
  }
}
